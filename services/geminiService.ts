import { GoogleGenAI, Type } from "@google/genai";
import { Team, Match } from "../types";

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
      ${isKnockout ? 'Knockout match: must have a winner.' : 'Draws allowed.'}
      Language: ${language === 'es' ? 'Spanish (Español)' : 'English'}.
      
      Return JSON:
      - homeScore (int)
      - awayScore (int)
      - commentary (string, max 15 words, dramatic style)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
        return {
            homeScore: result.homeScore,
            awayScore: result.awayScore,
            commentary: result.commentary || (language === 'es' ? "¡Partido increíble!" : "Amazing match!")
        };
    }
    throw new Error("Invalid format");

  } catch (error) {
    console.error("Gemini Simulation Failed", error);
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
    const matchesPrompt = matches.map(m => {
        const home = m.homeTeamId ? teams[m.homeTeamId] : null;
        const away = m.awayTeamId ? teams[m.awayTeamId] : null;
        if (!home || !away) return null;
        return `{ id: "${m.id}", home: "${home.name[language]}", homeRating: ${home.rating}, away: "${away.name[language]}", awayRating: ${away.rating} }`;
    }).filter(Boolean).join(",\n");

    const prompt = `
      Simulate the following FIFA World Cup 2026 group stage matches.
      Language: ${language === 'es' ? 'Spanish' : 'English'}.
      Draws are allowed.
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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

    const results = JSON.parse(response.text || '[]');
    return results;

  } catch (error) {
    console.error("Batch Simulation Failed", error);
    // Fallback for batch
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
};

const fallbackSimulation = (ratingA: number, ratingB: number, stage: string, language: string): SimulationResult => {
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
    commentary: language === 'es' ? "Simulación rápida." : "Quick sim."
  };
};