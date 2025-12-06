import { GoogleGenAI, Type } from "@google/genai";
import { Team, Match } from "../types";
import { logAppEvent } from "./firebase";

// Safe access to API Key preventing ReferenceError if process is not defined
const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    return '';
  }
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

export interface SimulationResult {
  homeScore: number;
  awayScore: number;
  commentary: string;
}

export interface BatchMatchResult extends SimulationResult {
  matchId: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateContentWithRetry = async (model: string, params: any, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await ai.models.generateContent({ model, ...params });
        } catch (error: any) {
            // Check for 429 or "RESOURCE_EXHAUSTED"
            const isRateLimit = error?.status === 429 || error?.code === 429 || error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED';
            if (isRateLimit && i < retries - 1) {
                // Exponential backoff: 1s, 2s, 4s
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
  if (!apiKey) {
    return fallbackSimulation(homeTeam.rating, awayTeam.rating, stage, language);
  }

  try {
    const isKnockout = stage !== 'Group';
    const homeName = homeTeam.name[language];
    const awayName = awayTeam.name[language];
    
    const prompt = `
      Simulate a FIFA World Cup 2026 match between ${homeName} (Rating: ${homeTeam.rating}) and ${awayName} (Rating: ${awayTeam.rating}).
      Stage: ${stage}.
      ${isKnockout ? 'Knockout match: must have a winner (no draws allowed).' : 'Draws allowed.'}
      Language: ${language === 'es' ? 'Spanish (Español)' : 'English'}.
      
      Return JSON:
      - homeScore (int)
      - awayScore (int)
      - commentary (string, max 15 words, dramatic style)
    `;

    const response = await generateContentWithRetry('gemini-2.5-flash', {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            homeScore: { type: Type.INTEGER },
            awayScore: { type: Type.INTEGER },
            commentary: { type: Type.STRING },
          },
          required: ["homeScore", "awayScore", "commentary"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    if (typeof result.homeScore === 'number' && typeof result.awayScore === 'number') {
        // Double check knockout rule locally if AI fails
        let h = result.homeScore;
        let a = result.awayScore;
        if (isKnockout && h === a) {
             if (Math.random() > 0.5) h++; else a++;
        }

        return {
            homeScore: h,
            awayScore: a,
            commentary: result.commentary || (language === 'es' ? "¡Partido increíble!" : "Amazing match!")
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

    const matchesPrompt = matches.map(m => {
        const home = m.homeTeamId ? teams[m.homeTeamId] : null;
        const away = m.awayTeamId ? teams[m.awayTeamId] : null;
        if (!home || !away) return null;
        return `{ id: "${m.id}", home: "${home.name[language]}", homeRating: ${home.rating}, away: "${away.name[language]}", awayRating: ${away.rating} }`;
    }).filter(Boolean).join(",\n");

    const prompt = `
      Simulate the following FIFA World Cup 2026 matches.
      Stage: ${isKnockout ? 'Knockout Stage (Round of 32/16/QF/SF/Final)' : 'Group Stage'}.
      Language: ${language === 'es' ? 'Spanish' : 'English'}.
      ${isKnockout ? 'IMPORTANT: These are knockout matches. NO DRAWS ALLOWED. You MUST determine a winner.' : 'Draws are allowed.'}
      
      Matches:
      [
        ${matchesPrompt}
      ]

      Return a JSON ARRAY where each object has:
      - matchId (string, matching input id)
      - homeScore (int)
      - awayScore (int)
      - commentary (string, max 10 words)
    `;

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
                awayScore: { type: Type.INTEGER },
                commentary: { type: Type.STRING }
            },
            required: ["matchId", "homeScore", "awayScore", "commentary"]
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
                return { ...r, homeScore: r.homeScore + 1, commentary: r.commentary + (language === 'es' ? " (Penales)" : " (Pens)") };
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
    awayScore: scoreB,
    commentary: language === 'es' ? "Simulación (Límite de cuota)." : "Simulation (Quota limit)."
  };
};