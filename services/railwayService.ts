import { Team, Match } from "../types";
import { logAppEvent } from "./firebase";

export interface SimulationResult {
  homeScore: number;
  awayScore: number;
}

export interface BatchMatchResult extends SimulationResult {
  matchId: string;
}

const API_BASE_URL = 'https://mundial-predictor-production.up.railway.app';

interface ApiResponse {
    match: string;
    team1_score: number;
    team2_score: number;
    is_knockout: boolean;
    details: {
        winner: string;
        [key: string]: any;
    };
    qualified_team?: string;
}

// Fallback logic in case API fails
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

export const simulateMatchWithAI = async (
  homeTeam: Team,
  awayTeam: Team,
  stage: string,
  language: 'en' | 'es'
): Promise<SimulationResult> => {
    try {
        const isKnockout = stage !== 'Group';
        
        // API requires English names
        const payload = {
            team1: homeTeam.name.en,
            team2: awayTeam.name.en,
            is_knockout: isKnockout
        };

        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();

        let homeScore = data.team1_score;
        let awayScore = data.team2_score;

        // Handle Knockout Tie-Breaker (App requires a score difference to determine winner)
        if (isKnockout && homeScore === awayScore && data.qualified_team) {
            const winnerName = data.qualified_team.toLowerCase();
            const homeName = homeTeam.name.en.toLowerCase();
            
            // Artificial goal for the winner so the app brackets work correctly
            if (winnerName.includes(homeName) || homeName.includes(winnerName)) {
                homeScore += 1;
            } else {
                awayScore += 1;
            }
        }

        return {
            homeScore,
            awayScore
        };

    } catch (error: any) {
        console.warn("Railway API Simulation Failed (using fallback). Error:", error.message);
        logAppEvent('simulation_error', { stage, error: error.message });
        return fallbackSimulation(homeTeam.rating, awayTeam.rating, stage, language);
    }
};

export const simulateBatchMatches = async (
  matches: Match[],
  teams: Record<string, Team>,
  language: 'en' | 'es'
): Promise<BatchMatchResult[]> => {
    if (matches.length === 0) return [];

    try {
        const payloadMatches = matches.map(m => {
            const home = teams[m.homeTeamId!];
            const away = teams[m.awayTeamId!];
            return {
                team1: home.name.en, // Always English
                team2: away.name.en, // Always English
                is_knockout: m.stage !== 'Group'
            };
        });

        const response = await fetch(`${API_BASE_URL}/predict_batch`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ matches: payloadMatches })
        });

        if (!response.ok) {
             throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const json = await response.json();
        
        // Handle if response is array or object wrapping array
        const data: ApiResponse[] = Array.isArray(json) ? json : (json.matches || []);

        if (!Array.isArray(data)) {
            throw new Error("Invalid API response format");
        }

        // Map results back to matches
        // Assuming the API returns the array in the same order as the request
        return matches.map((m, index) => {
            const result = data[index];
            if (!result) {
                // Should not happen if API is correct, but safe fallback
                return {
                    matchId: m.id,
                    ...fallbackSimulation(teams[m.homeTeamId!].rating, teams[m.awayTeamId!].rating, m.stage, language)
                };
            }

            const homeTeam = teams[m.homeTeamId!];
            
            let homeScore = result.team1_score;
            let awayScore = result.team2_score;

            // Handle Knockout Tie-Breaker
            if (result.is_knockout && homeScore === awayScore && result.qualified_team) {
                const winnerName = result.qualified_team.toLowerCase();
                const homeName = homeTeam.name.en.toLowerCase();
                
                if (winnerName.includes(homeName) || homeName.includes(winnerName)) {
                    homeScore += 1;
                } else {
                    awayScore += 1;
                }
            }

            return {
                matchId: m.id,
                homeScore,
                awayScore
            };
        });

    } catch (error: any) {
        console.warn("Batch Railway API Simulation Failed (using fallback). Error:", error.message);
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