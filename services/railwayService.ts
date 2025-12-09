import { Team, Match } from "../types";
import { logAppEvent } from "./firebase";

export interface SimulationResult {
  homeScore: number;
  awayScore: number;
  penaltyWinner?: 'home' | 'away';
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

// Helper to normalize team names for the API (e.g., USA -> United States)
const normalizeTeamName = (name: string): string => {
    if (name === 'USA') return 'United States';
    if (name === 'Curacao') return 'Curaçao';
    if (name === 'Cabo Verde') return 'Cape Verde';
    return name;
};

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

  // Fallback knockout tie-breaker (no penalty info, just force score)
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
        
        // API requires English names, and specific normalizations (USA -> United States)
        const payload = {
            team1: normalizeTeamName(homeTeam.name.en),
            team2: normalizeTeamName(awayTeam.name.en),
            is_knockout: isKnockout
        };

        const response = await fetch(`${API_BASE_URL}/predict-gemini`, {
            method: 'POST',
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
        let penaltyWinner: 'home' | 'away' | undefined;

        // Handle Knockout Tie-Breaker Logic
        // We rely on our local 'isKnockout' to ensure we force a result if needed
        if (isKnockout && homeScore === awayScore) {
            const qualifiedName = (data.qualified_team || '').toLowerCase();
            const detailsWinner = (data.details?.winner || '').toLowerCase();
            
            // Normalize local names for comparison (e.g. USA -> United States) to match API behavior
            const homeNameNormalized = normalizeTeamName(homeTeam.name.en).toLowerCase();
            const awayNameNormalized = normalizeTeamName(awayTeam.name.en).toLowerCase();
            
            // Check Home Match
            if (
                (qualifiedName && (qualifiedName.includes(homeNameNormalized) || homeNameNormalized.includes(qualifiedName))) ||
                (detailsWinner && detailsWinner.includes(homeNameNormalized))
            ) {
                penaltyWinner = 'home';
            } 
            // Check Away Match
            else if (
                (qualifiedName && (qualifiedName.includes(awayNameNormalized) || awayNameNormalized.includes(qualifiedName))) ||
                (detailsWinner && detailsWinner.includes(awayNameNormalized))
            ) {
                penaltyWinner = 'away';
            }
            // Fallback: If API was ambiguous but it's a knockout draw, we MUST pick a winner 
            // to avoid breaking the bracket UI.
            else {
                penaltyWinner = Math.random() > 0.5 ? 'home' : 'away';
            }
        }

        return {
            homeScore,
            awayScore,
            penaltyWinner
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
                team1: normalizeTeamName(home.name.en), // Normalize for API
                team2: normalizeTeamName(away.name.en), // Normalize for API
                is_knockout: m.stage !== 'Group'
            };
        });

        const response = await fetch(`${API_BASE_URL}/predict-batch-gemini`, {
            method: 'POST',
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
        const data: ApiResponse[] = Array.isArray(json) ? json : (json.results || json.matches || []);

        if (!Array.isArray(data)) {
            console.error("Invalid API response format", json); // Log for debugging
            throw new Error("Invalid API response format: 'results' array missing");
        }

        // Map results back to matches strictly using INDEX.
        return matches.map((m, index) => {
            const result = data[index];
            const homeTeam = teams[m.homeTeamId!];
            const awayTeam = teams[m.awayTeamId!];

            if (!result) {
                return {
                    matchId: m.id,
                    ...fallbackSimulation(homeTeam.rating, awayTeam.rating, m.stage, language)
                };
            }

            const homeScore = result.team1_score;
            const awayScore = result.team2_score;
            
            let penaltyWinner: 'home' | 'away' | undefined;

            // Handle Knockout Tie-Breaker
            // Trust local stage definition for knockout status
            const isKnockoutMatch = m.stage !== 'Group';

            if (isKnockoutMatch && homeScore === awayScore) {
                const qualifiedName = (result.qualified_team || '').toLowerCase();
                const detailsWinner = (result.details?.winner || '').toLowerCase();

                const homeNameNormalized = normalizeTeamName(homeTeam.name.en).toLowerCase();
                const awayNameNormalized = normalizeTeamName(awayTeam.name.en).toLowerCase();
                
                // Check Home
                if (
                    (qualifiedName && (qualifiedName.includes(homeNameNormalized) || homeNameNormalized.includes(qualifiedName))) ||
                    (detailsWinner && detailsWinner.includes(homeNameNormalized))
                ) {
                    penaltyWinner = 'home';
                } 
                // Check Away
                else if (
                    (qualifiedName && (qualifiedName.includes(awayNameNormalized) || awayNameNormalized.includes(qualifiedName))) ||
                    (detailsWinner && detailsWinner.includes(awayNameNormalized))
                ) {
                    penaltyWinner = 'away';
                } 
                // Fallback: Ensure progression
                else {
                    penaltyWinner = Math.random() > 0.5 ? 'home' : 'away';
                }
            }

            return {
                matchId: m.id,
                homeScore,
                awayScore,
                penaltyWinner
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