import { GoogleGenAI, Type } from "@google/genai";
import { Team, Match } from "../types";
import { logAppEvent } from "./firebase";

// Safe access to API Key preventing ReferenceError if process is not defined
const getApiKey = () => {
  try {
    // Check if process is defined to avoid ReferenceError in strict browser environments
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY || '';
    }
    return '';
  } catch (e) {
    return '';
  }
};

export interface SimulationResult {
  homeScore: number;
  awayScore: number;
}

export interface BatchMatchResult extends SimulationResult {
  matchId: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fallbackSimulation = (ratingA: number = 75, ratingB: number = 75, stage: string, language: string): SimulationResult => {
  const diff = ratingA - ratingB;
  const baseProbA = 0.5 + (diff / 100);
  let scoreA = 0;
  let scoreB = 0;
  
  for(let i=0; i<5; i++) {
    if (Math.random() < baseProbA) { if (Math.random() > 0.6) scoreA++; } 
    else { if (Math.random() > 0.6) scoreB++; }
  }

  if (stage !== 'Group' && scoreA === scoreB) {
     if (Math.random() > 0.5) scoreA++; else scoreB++;
  }

  return {
    homeScore: scoreA,
    awayScore: scoreB
  };
};

// Helper to lazily get the AI client
// This prevents the app from crashing on load if the API key is missing
const getAIClient = () => {
    const apiKey = getApiKey();
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

const generateContentWithRetry = async (model: string, params: any, retries = 3) => {
    const ai = getAIClient();
    
    // If no client (no key), we throw so we fall back to manual simulation in the caller
    if (!ai) throw new Error("API Key missing");

    for (let i = 0; i < retries; i++) {
        try {
            return await ai.models.generateContent({ model, ...params });
        } catch (error: any) {
            // Check for 429 or "RESOURCE_EXHAUSTED"
            const isRateLimit = error?.status === 429 || error?.code === 429 || error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED';
            if (isRateLimit && i < retries - 1) {
                const waitTime = 1000 * Math.pow(2, i);
                console.warn(`Gemini API rate limit hit. Retrying in ${waitTime}ms...`);
                await delay(waitTime);
                continue;
            }
            throw error;
        }
    }
};

export const simulateMatchWithAI = async (
  homeTeam: Team,
  awayTeam: Team,
  stage: string,
  language: 'en' | 'es'
): Promise<SimulationResult> => {
  // Check for key before attempting simulation
  const apiKey = getApiKey();
  if (!apiKey) {
    return fallbackSimulation(homeTeam.rating, awayTeam.rating, stage, language);
  }

  try {
    const isKnockout = stage !== 'Group';
    // Optimization: Very terse prompt
    const prompt = `FIFA 26 Sim. ${homeTeam.name[language]}(${homeTeam.rating}) vs ${awayTeam.name[language]}(${awayTeam.rating}). Stage:${stage}. ${isKnockout ? 'No draws' : 'Draws ok'}. JSON out.`;

    const response = await generateContentWithRetry('gemini-2.5-flash', {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            homeScore: { type: Type.INTEGER },
            awayScore: { type: Type.INTEGER }
          },
          required: ["homeScore", "awayScore"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    if (typeof result.homeScore === 'number' && typeof result.awayScore === 'number') {
        let h = result.homeScore;
        let a = result.awayScore;
        if (isKnockout && h === a) {
             if (Math.random() > 0.5) h++; else a++;
        }

        return {
            homeScore: h,
            awayScore: a
        };
    }
    throw new Error("Invalid format");

  } catch (error: any) {
    console.warn("Gemini Simulation Failed (using fallback):", error.message);
    logAppEvent('simulation_error', { stage, error: error.message });
    return fallbackSimulation(homeTeam.rating, awayTeam.rating, stage, language);
  }
};

export const simulateBatchMatches = async (
  matches: Match[],
  teams: Record<string, Team>,
  language: 'en' | 'es'
): Promise<BatchMatchResult[]> => {
  const apiKey = getApiKey();
  if (!apiKey || matches.length === 0) {
    return matches.map(m => ({
      matchId: m.id,
      ...fallbackSimulation(
        m.homeTeamId ? teams[m.homeTeamId].rating : 75,
        m.awayTeamId ? teams[m.awayTeamId].rating : 75,
        m.stage,
        language
      )
    }));
  }

  try {
    const isKnockout = matches[0].stage !== 'Group';

    // Optimization: Use Pipe-Delimited CSV style instead of JSON objects for input.
    const matchesData = matches.map(m => {
        const home = m.homeTeamId ? teams[m.homeTeamId] : null;
        const away = m.awayTeamId ? teams[m.awayTeamId] : null;
        if (!home || !away) return null;
        // Format: ID|HomeName|HomeRat|AwayName|AwayRat
        return `${m.id}|${home.name[language]}|${home.rating}|${away.name[language]}|${away.rating}`;
    }).filter(Boolean).join("\n");

    const prompt = `FIFA 26 Bulk Sim.
Format: ID|Home|Rat|Away|Rat.
Stage: ${isKnockout ? 'Knockout(No draws)' : 'Group(Draws ok)'}.
Task: Predict scores based on Rat.
Data:
${matchesData}`;

    const response = await generateContentWithRetry('gemini-2.5-flash', {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
                matchId: { type: Type.STRING },
                homeScore: { type: Type.INTEGER },
                awayScore: { type: Type.INTEGER }
            },
            required: ["matchId", "homeScore", "awayScore"]
          }
        }
      }
    });

    const results: BatchMatchResult[] = JSON.parse(response.text || '[]');
    
    // Safety check for knockouts
    if (isKnockout) {
        return results.map(r => {
            if (r.homeScore === r.awayScore) {
                // Force winner if AI returned draw
                return { ...r, homeScore: r.homeScore + 1 };
            }
            return r;
        });
    }

    return results;

  } catch (error: any) {
    console.warn("Batch Simulation Failed (using fallback):", error.message);
    logAppEvent('batch_simulation_error', { count: matches.length, error: error.message });
    
    // Fallback for batch
    return matches.map(m => ({
      matchId: m.id,
      ...fallbackSimulation(
        m.homeTeamId ? teams[m.homeTeamId]?.rating : 75,
        m.awayTeamId ? teams[m.awayTeamId]?.rating : 75,
        m.stage,
        language
      )
    }));
  }
};