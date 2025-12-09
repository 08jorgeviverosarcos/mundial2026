import React, { useState, useEffect, useMemo } from 'react';
import { TEAMS, GROUPS, generateGroupSchedule, STADIUMS, findStadium } from './constants';
import { Team, Match, GroupStanding, LocalizedString } from './types';
import { TeamSelector } from './components/TeamSelector';
import { GroupTable } from './components/GroupTable';
import { MatchCard } from './components/MatchCard';
import { Bracket } from './components/Bracket';
import { AdBanner } from './components/AdBanner'; // Import AdBanner
import { simulateMatchWithAI, simulateBatchMatches } from './services/railwayService'; // Updated Import to Railway
import { useLanguage } from './contexts/LanguageContext';
import { logAppEvent } from './services/firebase';

enum AppState {
  SELECT_TEAM,
  GROUP_STAGE,
  KNOCKOUT_STAGE
}

const STORAGE_KEY = 'FIFA26_SIM_STATE_V1';

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [appState, setAppState] = useState<AppState>(AppState.SELECT_TEAM);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Record<string, GroupStanding>>({});
  const [simulatingId, setSimulatingId] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [filterTeam, setFilterTeam] = useState('ALL');

  const hasKnockouts = matches.some(m => m.stage !== 'Group');
  const unfinishedGroupMatches = matches.some(m => m.stage === 'Group' && !m.isFinished);

  // Dynamic SEO Title Update
  useEffect(() => {
    if (language === 'es') {
      document.title = "Simulador Mundial 2026 - Predicciones IA | Fixture y Grupos";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", "Simula el Mundial FIFA 2026. Predice resultados con IA, tabla de posiciones y eliminatorias. ¡Juega y descubre al campeón!");
    } else {
      document.title = "FIFA 2026 World Cup Simulator - AI Predictions | Bracket & Groups";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", "Simulate the FIFA World Cup 2026. Predict matches with AI, view group standings and bracket. Play now and find the champion!");
    }
  }, [language]);

  // Initialize Data (Load from Storage or Default)
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    let loaded = false;

    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            if (parsed.matches && parsed.matches.length > 0) {
                setMatches(parsed.matches);
                setStandings(parsed.standings || {});
                setUserTeam(parsed.userTeam);
                setAppState(parsed.appState !== undefined ? parsed.appState : AppState.SELECT_TEAM);
                loaded = true;
                logAppEvent('session_start', { loaded_from_storage: true });
            }
        } catch (e) {
            console.error("Error loading saved simulation:", e);
        }
    }

    if (!loaded) {
        // Init matches default
        const initialMatches = generateGroupSchedule();
        setMatches(initialMatches);

        // Init standings default
        const initialStandings: Record<string, GroupStanding> = {};
        Object.keys(TEAMS).forEach(teamId => {
          initialStandings[teamId] = { teamId, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
        });
        setStandings(initialStandings);
        logAppEvent('session_start', { loaded_from_storage: false });
    }
  }, []);

  // Track page views when state changes
  useEffect(() => {
    const screenName = 
        appState === AppState.SELECT_TEAM ? 'select_team' : 
        appState === AppState.GROUP_STAGE ? 'group_stage' : 
        'knockout_stage';
    
    logAppEvent('screen_view', { firebase_screen: screenName });
  }, [appState]);

  // Auto-Save Effect
  useEffect(() => {
    if (matches.length > 0) {
        const stateToSave = {
            matches,
            standings,
            userTeam,
            appState
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [matches, standings, userTeam, appState]);

  // Computed Values for UI
  const allTeamsList = useMemo(() => {
    return Object.values(TEAMS).sort((a, b) => a.name[language].localeCompare(b.name[language]));
  }, [language]);

  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
        if (m.stage !== 'Group') return false;

        // Group Filter
        if (filterGroup !== 'ALL' && m.group !== filterGroup) return false;

        // Team Filter (Dropdown)
        if (filterTeam !== 'ALL' && m.homeTeamId !== filterTeam && m.awayTeamId !== filterTeam) return false;

        // Search Query (Text)
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const homeName = m.homeTeamId ? TEAMS[m.homeTeamId].name[language].toLowerCase() : '';
            const awayName = m.awayTeamId ? TEAMS[m.awayTeamId].name[language].toLowerCase() : '';
            return homeName.includes(q) || awayName.includes(q);
        }

        return true;
    });
  }, [matches, filterGroup, filterTeam, searchQuery, language]);


  const handleSelectTeam = (team: Team) => {
    setUserTeam(team);
    setAppState(AppState.GROUP_STAGE);
    logAppEvent('select_content', { content_type: 'team', item_id: team.id });
  };

  const handleRestart = () => {
      logAppEvent('restart_simulation');
      // Clear Storage
      localStorage.removeItem(STORAGE_KEY);
      
      // Reset State variables
      setAppState(AppState.SELECT_TEAM);
      setUserTeam(null);
      setMatches(generateGroupSchedule());
      
      const initialStandings: Record<string, GroupStanding> = {};
      Object.keys(TEAMS).forEach(teamId => {
        initialStandings[teamId] = { teamId, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
      });
      setStandings(initialStandings);
      
      // Reset filters
      setSearchQuery('');
      setFilterGroup('ALL');
      setFilterTeam('ALL');
  };

  const calculateStandingsFromScratch = (currentMatches: Match[]) => {
    const newStandings: Record<string, GroupStanding> = {};
    
    // Reset
    Object.keys(TEAMS).forEach(teamId => {
      newStandings[teamId] = { teamId, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
    });

    // Populate
    currentMatches.forEach(match => {
        if (match.stage === 'Group' && match.isFinished && match.homeScore !== null && match.awayScore !== null && match.homeTeamId && match.awayTeamId) {
            const h = match.homeTeamId;
            const a = match.awayTeamId;
            const hs = match.homeScore;
            const as = match.awayScore;

            // Home Stats
            newStandings[h].played += 1;
            newStandings[h].gf += hs;
            newStandings[h].ga += as;
            newStandings[h].gd += (hs - as);
            if (hs > as) { newStandings[h].won++; newStandings[h].points += 3; }
            else if (hs < as) { newStandings[h].lost++; }
            else { newStandings[h].drawn++; newStandings[h].points += 1; }

            // Away Stats
            newStandings[a].played += 1;
            newStandings[a].gf += as;
            newStandings[a].ga += hs;
            newStandings[a].gd += (as - hs);
            if (as > hs) { newStandings[a].won++; newStandings[a].points += 3; }
            else if (as < hs) { newStandings[a].lost++; }
            else { newStandings[a].drawn++; newStandings[a].points += 1; }
        }
    });
    return newStandings;
  };

  // Shared Logic for R32 Pairings
  const calculateR32Pairings = (currentStandings: Record<string, GroupStanding>) => {
    // 1. Determine positions for each group
    const positions: Record<string, string[]> = {}; 
    const thirdPlaceTeams: GroupStanding[] = [];

    GROUPS.forEach(group => {
        const groupStandings = group.teams.map(t => currentStandings[t]).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.gd !== a.gd) return b.gd - a.gd;
            return b.gf - a.gf;
        });
        positions[group.id] = groupStandings.map(s => s.teamId);
        thirdPlaceTeams.push(groupStandings[2]);
    });

    // 2. Determine Best 8 Thirds
    thirdPlaceTeams.sort((a, b) => {
         if (b.points !== a.points) return b.points - a.points;
         if (b.gd !== a.gd) return b.gd - a.gd;
         return b.gf - a.gf;
    });
    
    // The top 8 third place teams qualify
    const best8Thirds = thirdPlaceTeams.slice(0, 8);
    
    // Helper: Map team code to ID
    const getTeam = (code: string): string => {
        const rank = parseInt(code[0]) - 1;
        const groupId = code.slice(1);
        return positions[groupId][rank];
    };

    // Helper: Pick a valid 3rd place team based on allowable groups
    const usedThirds = new Set<string>();
    const getThirdPlace = (allowableGroups: string[]): string => {
        const candidate = best8Thirds.find(t => {
            const group = GROUPS.find(g => g.teams.includes(t.teamId))?.id;
            return group && allowableGroups.includes(group) && !usedThirds.has(t.teamId);
        });

        if (candidate) {
            usedThirds.add(candidate.teamId);
            return candidate.teamId;
        }

        const fallback = best8Thirds.find(t => !usedThirds.has(t.teamId));
        if (fallback) {
            usedThirds.add(fallback.teamId);
            return fallback.teamId;
        }
        return 'TBD';
    };

    const bracketPlan = [
        // Sunday 28
        { m: 73, h: '2A', a: '2B', date: {en: 'Jun 28', es: '28 de Jun'}, ven: 'Los Angeles Stadium' },
        // Monday 29
        { m: 74, h: '1E', a: '3rd', groups: ['A','B','C','D','F'], date: {en: 'Jun 29', es: '29 de Jun'}, ven: 'Boston Stadium' },
        { m: 75, h: '1F', a: '2C', date: {en: 'Jun 29', es: '29 de Jun'}, ven: 'Estadio Monterrey' },
        { m: 76, h: '1C', a: '2F', date: {en: 'Jun 29', es: '29 de Jun'}, ven: 'Houston Stadium' }, 
        // Tuesday 30
        { m: 77, h: '1I', a: '3rd', groups: ['C','D','F','G','H'], date: {en: 'Jun 30', es: '30 de Jun'}, ven: 'New York New Jersey Stadium' },
        { m: 78, h: '2E', a: '2I', date: {en: 'Jun 30', es: '30 de Jun'}, ven: 'Dallas Stadium' },
        { m: 79, h: '1A', a: '3rd', groups: ['C','E','F','H','I'], date: {en: 'Jun 30', es: '30 de Jun'}, ven: 'Estadio Ciudad de México' },
        // Wednesday 1
        { m: 80, h: '1L', a: '3rd', groups: ['E','H','I','J','K'], date: {en: 'Jul 1', es: '1 de Jul'}, ven: 'Atlanta Stadium' },
        { m: 81, h: '1D', a: '3rd', groups: ['B','E','F','I','J'], date: {en: 'Jul 1', es: '1 de Jul'}, ven: 'San Francisco Bay Area Stadium' },
        { m: 82, h: '1G', a: '3rd', groups: ['A','E','H','I','J'], date: {en: 'Jul 1', es: '1 de Jul'}, ven: 'Seattle Stadium' },
        // Thursday 2
        { m: 83, h: '2K', a: '2L', date: {en: 'Jul 2', es: '2 de Jul'}, ven: 'Toronto Stadium' },
        { m: 84, h: '1H', a: '2J', date: {en: 'Jul 2', es: '2 de Jul'}, ven: 'Los Angeles Stadium' },
        { m: 85, h: '1B', a: '3rd', groups: ['E','F','G','I','J'], date: {en: 'Jul 2', es: '2 de Jul'}, ven: 'BC Place Vancouver' },
        // Friday 3
        { m: 86, h: '1J', a: '2H', date: {en: 'Jul 3', es: '3 de Jul'}, ven: 'Miami Stadium' },
        { m: 87, h: '1K', a: '3rd', groups: ['D','E','I','J','L'], date: {en: 'Jul 3', es: '3 de Jul'}, ven: 'Kansas City Stadium' },
        { m: 88, h: '2D', a: '2G', date: {en: 'Jul 3', es: '3 de Jul'}, ven: 'Dallas Stadium' },
    ];

    return bracketPlan.map(p => ({
        id: `M${p.m}`,
        homeTeamId: getTeam(p.h),
        awayTeamId: p.a === '3rd' ? getThirdPlace(p.groups || []) : getTeam(p.a)
    }));
  };

  const handleUpdateScore = (matchId: string, homeScore: number, awayScore: number, penaltyWinnerId?: string) => {
      logAppEvent('update_score', { match_id: matchId, home: homeScore, away: awayScore });
      const matchIndex = matches.findIndex(m => m.id === matchId);
      if (matchIndex === -1) return;

      const currentMatch = matches[matchIndex];
      let winnerId: string | null = null;

      if (homeScore > awayScore) {
          winnerId = currentMatch.homeTeamId;
      } else if (awayScore > homeScore) {
          winnerId = currentMatch.awayTeamId;
      } else {
          // Draw logic
          if (currentMatch.stage !== 'Group') {
              // Knockout: Must determine winner. 
              // penaltyWinnerId comes from MatchCard selection.
              // Fallback to existing winner if it's consistent with participants, otherwise null (waiting for user input)
              winnerId = penaltyWinnerId || currentMatch.winnerId || null;
          } else {
              winnerId = null; // Group stage draw
          }
      }

      const updatedMatch = {
          ...currentMatch,
          homeScore,
          awayScore,
          isFinished: true,
          winnerId: winnerId
      };

      let newMatches = [...matches];
      newMatches[matchIndex] = updatedMatch;

      // 1. Recalculate Standings if Group Stage
      let newStandings = standings;
      if (updatedMatch.stage === 'Group') {
          newStandings = calculateStandingsFromScratch(newMatches);
          setStandings(newStandings);

          // 2. Dynamic Bracket Update (The user asked for "afectar todo el fixture")
          if (hasKnockouts) {
              const r32Pairings = calculateR32Pairings(newStandings);
              
              r32Pairings.forEach(pairing => {
                  const idx = newMatches.findIndex(m => m.id === pairing.id);
                  if (idx !== -1) {
                      const current = newMatches[idx];
                      if (current.homeTeamId !== pairing.homeTeamId || current.awayTeamId !== pairing.awayTeamId) {
                          // Team changed! Reset this match.
                          newMatches[idx] = {
                              ...current,
                              homeTeamId: pairing.homeTeamId,
                              awayTeamId: pairing.awayTeamId,
                              homeScore: null,
                              awayScore: null,
                              isFinished: false,
                              winnerId: null
                          };
                      }
                  }
              });
          }
      }

      setMatches(newMatches);
  };

  const simulateMatch = async (match: Match) => {
    if (!match.homeTeamId || !match.awayTeamId) return;
    setSimulatingId(match.id);
    logAppEvent('simulate_match_start', { match_id: match.id, stage: match.stage });

    const homeTeam = TEAMS[match.homeTeamId];
    const awayTeam = TEAMS[match.awayTeamId];

    const result = await simulateMatchWithAI(homeTeam, awayTeam, match.stage, language);
    console.log("result",result)

    const updatedMatches = matches.map(m => {
      if (m.id === match.id) {
        let winnerId = null;
        if (result.homeScore > result.awayScore) winnerId = m.homeTeamId;
        else if (result.awayScore > result.homeScore) winnerId = m.awayTeamId;
        else if (result.penaltyWinner === 'home') winnerId = m.homeTeamId;
        else if (result.penaltyWinner === 'away') winnerId = m.awayTeamId;

        return {
          ...m,
          homeScore: result.homeScore,
          awayScore: result.awayScore,
          isFinished: true,
          winnerId: winnerId
        };
      }
      return m;
    });
    console.log("updatedMatches",updatedMatches)

    setMatches(updatedMatches);
    logAppEvent('simulate_match_complete', { match_id: match.id });

    if (match.stage === 'Group') {
        setStandings(calculateStandingsFromScratch(updatedMatches));
    }

    setSimulatingId(null);
  };

  // Effect to handle Bracket Progression automatically (Synchronize Next Rounds)
  useEffect(() => {
     if (appState !== AppState.KNOCKOUT_STAGE) return;
     
     // Progression Logic Mapped by ID
     const progressions: Record<number, number> = {
        74: 89, 77: 89, 73: 90, 75: 90, 76: 91, 78: 91, 79: 92, 80: 92,
        83: 93, 84: 93, 81: 94, 82: 94, 86: 95, 88: 95, 85: 96, 87: 96,
        89: 97, 90: 97, 93: 98, 94: 98, 91: 99, 92: 99, 95: 100, 96: 100,
        97: 101, 98: 101, 99: 102, 100: 102,
     };
     
     const finalMatches: Record<number, number> = { 101: 104, 102: 104 };
     const thirdPlaceMatches: Record<number, number> = { 101: 103, 102: 103 };
     const homeSources = [74, 73, 76, 79, 83, 81, 86, 85, 89, 93, 91, 95, 97, 99, 101];

     let changed = false;
     const newMatches = [...matches];

     // We iterate through all Knockout Matches to ensure consistency
     // R32 matches are handled by the group stage update logic (handleUpdateScore) or finishGroupStage.
     // Here we handle R16 and beyond.

     const processRound = (targetIdNum: number, sourceIdNum: number, isHome: boolean) => {
        const sourceMatch = newMatches.find(m => m.id === `M${sourceIdNum}`);
        const targetIndex = newMatches.findIndex(m => m.id === `M${targetIdNum}`);
        
        if (targetIndex !== -1 && sourceMatch) {
             const targetMatch = newMatches[targetIndex];
             // Winner Logic
             const sourceWinner = (sourceMatch.isFinished && sourceMatch.winnerId) ? sourceMatch.winnerId : null;
             
             if (isHome) {
                 if (targetMatch.homeTeamId !== sourceWinner) {
                     newMatches[targetIndex] = { ...targetMatch, homeTeamId: sourceWinner };
                     // If team changes, result is invalid
                     if (targetMatch.isFinished) {
                         newMatches[targetIndex].isFinished = false;
                         newMatches[targetIndex].homeScore = null;
                         newMatches[targetIndex].awayScore = null;
                         newMatches[targetIndex].winnerId = null;
                     }
                     changed = true;
                 }
             } else {
                 if (targetMatch.awayTeamId !== sourceWinner) {
                     newMatches[targetIndex] = { ...targetMatch, awayTeamId: sourceWinner };
                     if (targetMatch.isFinished) {
                         newMatches[targetIndex].isFinished = false;
                         newMatches[targetIndex].homeScore = null;
                         newMatches[targetIndex].awayScore = null;
                         newMatches[targetIndex].winnerId = null;
                     }
                     changed = true;
                 }
             }
        }
     };

     // Loop through progressions to sync state
     Object.keys(progressions).forEach(key => {
         const source = parseInt(key);
         const target = progressions[source];
         processRound(target, source, homeSources.includes(source));
     });

     // Finals & 3rd Place
     [101, 102].forEach(source => {
         const targetF = finalMatches[source];
         const target3 = thirdPlaceMatches[source];
         const sourceMatch = newMatches.find(m => m.id === `M${source}`);
         
         if (sourceMatch) {
             // Final (Winner)
             const idxF = newMatches.findIndex(m => m.id === `M${targetF}`);
             const winner = (sourceMatch.isFinished && sourceMatch.winnerId) ? sourceMatch.winnerId : null;
             if (idxF !== -1) {
                 const t = newMatches[idxF];
                 if (source === 101) {
                     if (t.homeTeamId !== winner) { newMatches[idxF] = {...t, homeTeamId: winner, isFinished:false, homeScore:null, awayScore:null, winnerId:null}; changed=true; }
                 } else {
                     if (t.awayTeamId !== winner) { newMatches[idxF] = {...t, awayTeamId: winner, isFinished:false, homeScore:null, awayScore:null, winnerId:null}; changed=true; }
                 }
             }

             // 3rd Place (Loser)
             const idx3 = newMatches.findIndex(m => m.id === `M${target3}`);
             const loser = (sourceMatch.isFinished && sourceMatch.winnerId && sourceMatch.homeTeamId && sourceMatch.awayTeamId) 
                            ? (sourceMatch.winnerId === sourceMatch.homeTeamId ? sourceMatch.awayTeamId : sourceMatch.homeTeamId) 
                            : null;
             
             if (idx3 !== -1) {
                 const t = newMatches[idx3];
                 if (source === 101) {
                     if (t.homeTeamId !== loser) { newMatches[idx3] = {...t, homeTeamId: loser, isFinished:false, homeScore:null, awayScore:null, winnerId:null}; changed=true; }
                 } else {
                     if (t.awayTeamId !== loser) { newMatches[idx3] = {...t, awayTeamId: loser, isFinished:false, homeScore:null, awayScore:null, winnerId:null}; changed=true; }
                 }
             }
         }
     });

     if (changed) {
         setMatches(newMatches);
     }

  }, [matches, appState]);


  const autoSimulateGroup = async () => {
    console.log("autosimulategriou")
    const unfinishedMatches = matches.filter(m => m.stage === 'Group' && !m.isFinished);
    if (unfinishedMatches.length === 0) return;

    setSimulatingId('BATCH');
    logAppEvent('batch_simulate_group_start', { count: unfinishedMatches.length });

    const results = await simulateBatchMatches(unfinishedMatches, TEAMS, language);

    let updatedMatches = matches.map(m => {
        const res = results.find(r => r.matchId === m.id);
        if (res) {
            return {
                ...m,
                homeScore: res.homeScore,
                awayScore: res.awayScore,
                isFinished: true,
                winnerId: res.homeScore > res.awayScore ? m.homeTeamId : (res.awayScore > res.homeScore ? m.awayTeamId : null)
            };
        }
        return m;
    });

    // Recalculate standings immediately based on the new results
    const newStandings = calculateStandingsFromScratch(updatedMatches);
    setStandings(newStandings);

    // If we are simulating group matches AFTER knockouts have generated, we must update the bracket
    if (hasKnockouts) {
         const r32Pairings = calculateR32Pairings(newStandings);
         
         updatedMatches = updatedMatches.map(m => {
             // Only check R32 matches for updates
             if (m.stage === 'Round of 32') {
                 const pairing = r32Pairings.find(p => p.id === m.id);
                 if (pairing) {
                     // Check if teams changed due to new standings
                     if (m.homeTeamId !== pairing.homeTeamId || m.awayTeamId !== pairing.awayTeamId) {
                         return {
                             ...m,
                             homeTeamId: pairing.homeTeamId,
                             awayTeamId: pairing.awayTeamId,
                             // Reset match if teams changed
                             homeScore: null,
                             awayScore: null,
                             isFinished: false,
                             winnerId: null
                         };
                     }
                 }
             }
             return m;
         });
    }

    setMatches(updatedMatches);
    setSimulatingId(null);
    logAppEvent('batch_simulate_group_complete');
  };

  const handleSimulatePhase = async (stage: Match['stage']) => {
      // Only simulate matches that are ready (have both teams) and not finished
      const matchesToSimulate = matches.filter(m => m.stage === stage && !m.isFinished && m.homeTeamId && m.awayTeamId);
      
      if (matchesToSimulate.length === 0) return;

      setSimulatingId(`BATCH_${stage}`);
      logAppEvent('batch_simulate_phase_start', { stage, count: matchesToSimulate.length });

      const results = await simulateBatchMatches(matchesToSimulate, TEAMS, language);

      const updatedMatches = matches.map(m => {
          const res = results.find(r => r.matchId === m.id);
          if (res) {
               // Determine winner strictly for update (though logic is in result too usually)
               let winnerId = null;
               if (res.homeScore > res.awayScore) winnerId = m.homeTeamId;
               else if (res.awayScore > res.homeScore) winnerId = m.awayTeamId;
               else if (res.penaltyWinner === 'home') winnerId = m.homeTeamId;
               else if (res.penaltyWinner === 'away') winnerId = m.awayTeamId;

               return {
                  ...m,
                  homeScore: res.homeScore,
                  awayScore: res.awayScore,
                  isFinished: true,
                  winnerId: winnerId
              };
          }
          return m;
      });

      setMatches(updatedMatches);
      setSimulatingId(null);
      logAppEvent('batch_simulate_phase_complete', { stage });
  };
  
  const handleRestartPhase = (stage: Match['stage']) => {
      logAppEvent('restart_phase', { stage });
      const updatedMatches = matches.map(m => {
          if (m.stage === stage) {
              return {
                  ...m,
                  homeScore: null,
                  awayScore: null,
                  isFinished: false,
                  winnerId: null
              };
          }
          return m;
      });
      setMatches(updatedMatches);
  };

  const finishGroupStage = () => {
    logAppEvent('finish_group_stage');
    // Generate Bracket using Shared Logic
    const pairings = calculateR32Pairings(standings);
    
    // Create Bracket Matches (73-104) or update existing
    // Since this is "First Time" finish or "Re-entry", we append mainly
    const existingIds = new Set(matches.map(m => m.id));

    // Define Empty slots for Rounds after R32
    const r16Plan = [
        { m: 89, date: {en: 'Jul 4', es: '4 de Jul'}, ven: 'Philadelphia Stadium' },
        { m: 90, date: {en: 'Jul 4', es: '4 de Jul'}, ven: 'Houston Stadium' },
        { m: 91, date: {en: 'Jul 5', es: '5 de Jul'}, ven: 'New York New Jersey Stadium' },
        { m: 92, date: {en: 'Jul 5', es: '5 de Jul'}, ven: 'Estadio Azteca' },
        { m: 93, date: {en: 'Jul 6', es: '6 de Jul'}, ven: 'Dallas Stadium' },
        { m: 94, date: {en: 'Jul 6', es: '6 de Jul'}, ven: 'Seattle Stadium' },
        { m: 95, date: {en: 'Jul 7', es: '7 de Jul'}, ven: 'Atlanta Stadium' },
        { m: 96, date: {en: 'Jul 7', es: '7 de Jul'}, ven: 'BC Place Vancouver' },
    ];
    const qfPlan = [
        { m: 97, date: {en: 'Jul 9', es: '9 de Jul'}, ven: 'Boston Stadium' },
        { m: 98, date: {en: 'Jul 10', es: '10 de Jul'}, ven: 'Los Angeles Stadium' },
        { m: 99, date: {en: 'Jul 11', es: '11 de Jul'}, ven: 'Miami Stadium' },
        { m: 100, date: {en: 'Jul 11', es: '11 de Jul'}, ven: 'Kansas City Stadium' },
    ];
    const sfPlan = [
        { m: 101, date: {en: 'Jul 14', es: '14 de Jul'}, ven: 'Dallas Stadium' },
        { m: 102, date: {en: 'Jul 15', es: '15 de Jul'}, ven: 'Atlanta Stadium' },
    ];
    const fPlan = [
        { m: 103, date: {en: 'Jul 18', es: '18 de Jul'}, ven: 'Miami Stadium' }, 
        { m: 104, date: {en: 'Jul 19', es: '19 de Jul'}, ven: 'New York New Jersey Stadium' },
    ];

    const create = (id: number, stage: Match['stage'], h: string | null, a: string | null, date: LocalizedString, ven: string): Match => ({
        id: `M${id}`,
        homeTeamId: h,
        awayTeamId: a,
        homeScore: null,
        awayScore: null,
        isFinished: false,
        stage,
        date: { en: `${date.en}, 2026`, es: `${date.es}, 2026` },
        time: id % 2 === 0 ? '20:00' : '16:00', // Assign times for knockouts
        stadium: findStadium(ven)
    });

    const newMatches: Match[] = [];

    // R32
    pairings.forEach(p => {
        // Find venue/date from static plan inside calculateR32 (we need to duplicate data or find a way to access it, simpler to just map by ID since calculateR32 doesn't return venue)
        // Re-mapping logic for venue:
        const bracketPlan = [
            // Sunday 28
            { m: 73, date: {en: 'Jun 28', es: '28 de Jun'}, ven: 'Los Angeles Stadium' },
            { m: 74, date: {en: 'Jun 29', es: '29 de Jun'}, ven: 'Boston Stadium' },
            { m: 75, date: {en: 'Jun 29', es: '29 de Jun'}, ven: 'Estadio Monterrey' },
            { m: 76, date: {en: 'Jun 29', es: '29 de Jun'}, ven: 'Houston Stadium' }, 
            { m: 77, date: {en: 'Jun 30', es: '30 de Jun'}, ven: 'New York New Jersey Stadium' },
            { m: 78, date: {en: 'Jun 30', es: '30 de Jun'}, ven: 'Dallas Stadium' },
            { m: 79, date: {en: 'Jun 30', es: '30 de Jun'}, ven: 'Estadio Ciudad de México' },
            { m: 80, date: {en: 'Jul 1', es: '1 de Jul'}, ven: 'Atlanta Stadium' },
            { m: 81, date: {en: 'Jul 1', es: '1 de Jul'}, ven: 'San Francisco Bay Area Stadium' },
            { m: 82, date: {en: 'Jul 1', es: '1 de Jul'}, ven: 'Seattle Stadium' },
            { m: 83, date: {en: 'Jul 2', es: '2 de Jul'}, ven: 'Toronto Stadium' },
            { m: 84, date: {en: 'Jul 2', es: '2 de Jul'}, ven: 'Los Angeles Stadium' },
            { m: 85, date: {en: 'Jul 2', es: '2 de Jul'}, ven: 'BC Place Vancouver' },
            { m: 86, date: {en: 'Jul 3', es: '3 de Jul'}, ven: 'Miami Stadium' },
            { m: 87, date: {en: 'Jul 3', es: '3 de Jul'}, ven: 'Kansas City Stadium' },
            { m: 88, date: {en: 'Jul 3', es: '3 de Jul'}, ven: 'Dallas Stadium' },
        ];
        const meta = bracketPlan.find(b => `M${b.m}` === p.id);
        if (meta && !existingIds.has(p.id)) {
            newMatches.push(create(parseInt(p.id.substring(1)), 'Round of 32', p.homeTeamId, p.awayTeamId, meta.date, meta.ven));
        }
    });

    // Subsequents
    r16Plan.forEach(p => !existingIds.has(`M${p.m}`) && newMatches.push(create(p.m, 'Round of 16', null, null, p.date, p.ven)));
    qfPlan.forEach(p => !existingIds.has(`M${p.m}`) && newMatches.push(create(p.m, 'Quarter-Final', null, null, p.date, p.ven)));
    sfPlan.forEach(p => !existingIds.has(`M${p.m}`) && newMatches.push(create(p.m, 'Semi-Final', null, null, p.date, p.ven)));
    fPlan.forEach((p, idx) => !existingIds.has(`M${p.m}`) && newMatches.push(create(p.m, idx === 0 ? 'Third Place' : 'Final', null, null, p.date, p.ven)));

    setMatches(prev => [...prev, ...newMatches]);
    setAppState(AppState.KNOCKOUT_STAGE);
  };

  const Navbar = () => (
    <nav className="border-b border-white/10 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-3 py-3 md:px-6 md:h-16 shadow-lg">
        {/* Left: Title & Team */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <h1 className="font-teko text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400 leading-none">
                <span className="md:hidden">FIFA 26</span>
                <span className="hidden md:inline">{t.title}</span>
            </h1>
            {userTeam && (
                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-white/10 shrink-0">
                    <span className="hidden lg:inline text-xs text-gray-400 uppercase">{t.yourTeam}:</span>
                    <img src={userTeam.flag} className="w-5 h-3.5 md:w-6 md:h-4 rounded" alt="flag" />
                    <span className="font-bold text-xs md:text-sm text-yellow-400">{userTeam.code}</span>
                </div>
            )}
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {appState === AppState.GROUP_STAGE && (
                <>
                <button 
                    onClick={() => {
                        if (hasKnockouts) {
                            setAppState(AppState.KNOCKOUT_STAGE);
                        } else {
                            finishGroupStage();
                        }
                    }}
                    className="px-3 py-1.5 md:px-4 md:py-2 bg-green-600 hover:bg-green-500 rounded font-teko text-lg md:text-xl tracking-wide transition-colors shadow-lg shadow-green-900/20"
                >
                     <span className="md:hidden">{language === 'en' ? 'Knockouts' : 'Fase Final'}</span>
                     <span className="hidden md:inline">{t.goToKnockouts}</span>
                </button>
                </>
            )}
            {appState === AppState.KNOCKOUT_STAGE && (
                 <>
                 <button 
                    onClick={() => {
                        setAppState(AppState.GROUP_STAGE);
                        logAppEvent('nav_view_groups');
                    }}
                    className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-500 rounded font-teko text-lg md:text-xl tracking-wide transition-colors"
                >
                    <span className="md:hidden">{language === 'en' ? 'Groups' : 'Grupos'}</span>
                    <span className="hidden md:inline">{t.viewGroups}</span>
                </button>
                </>
            )}
            
            {/* Restart Button - Available in both Group and Knockout phases */}
            {appState !== AppState.SELECT_TEAM && (
                 <button 
                    onClick={handleRestart}
                    className="p-1.5 md:px-4 md:py-2 bg-white/10 hover:bg-white/20 rounded font-teko text-lg md:text-xl tracking-wide transition-colors flex items-center gap-2"
                    title={t.restart}
                >
                    <span className="hidden md:inline">{t.restart}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:hidden">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                </button>
            )}
            
            <div className="flex bg-white/10 rounded-lg p-0.5 md:p-1">
                <button 
                    onClick={() => { setLanguage('en'); logAppEvent('change_language', { lang: 'en' }); }}
                    className={`px-2 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-bold rounded ${language === 'en' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    EN
                </button>
                <button 
                    onClick={() => { setLanguage('es'); logAppEvent('change_language', { lang: 'es' }); }}
                    className={`px-2 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-bold rounded ${language === 'es' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    ES
                </button>
            </div>
        </div>
    </nav>
  );

  if (appState === AppState.SELECT_TEAM) {
    return (
        <>
            <div className="absolute top-4 right-4 z-50 flex bg-white/10 rounded-lg p-1 backdrop-blur-md">
                <button onClick={() => { setLanguage('en'); logAppEvent('change_language', { lang: 'en' }); }} className={`px-2 py-1 text-xs font-bold rounded ${language === 'en' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}>EN</button>
                <button onClick={() => { setLanguage('es'); logAppEvent('change_language', { lang: 'es' }); }} className={`px-2 py-1 text-xs font-bold rounded ${language === 'es' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}>ES</button>
            </div>
            <TeamSelector onSelect={handleSelectTeam} />
        </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col relative">
      <Navbar />

      {/* Ad Banner - Top Placement */}
      <div className="max-w-7xl mx-auto px-6 w-full">
         <AdBanner />
      </div>

      {/* FIXED Loader Overlay: Outside of main to cover viewport and block interaction */}
      {simulatingId === 'BATCH' && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center touch-none h-screen w-screen p-4">
              {/* Visual Feedback first (Priority) */}
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h2 className="text-3xl font-teko text-white animate-pulse mb-2">{t.simulating}</h2>
              <p className="text-gray-400 text-sm mb-8 animate-pulse text-center">
                  {language === 'es' ? 'Generando predicciones con IA... Por favor espera.' : 'Generating AI predictions... Please wait.'}
              </p>

              {/* Ad Container with Context */}
              <div className="w-full max-w-md bg-white/5 rounded-lg p-4 border border-white/10 flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                      {language === 'es' ? 'Patrocinado' : 'Sponsored'}
                  </span>
                  {/* Reuse AdBanner but allow it to fill width of this container */}
                  <AdBanner className="my-0 w-full" />
              </div>
          </div>
      )}

      <main className="flex-1 overflow-hidden relative">
        {appState === AppState.GROUP_STAGE && (
            // Toggle overflow based on simulating state to prevent scrolling
            <div className={`h-full p-6 ${simulatingId === 'BATCH' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                <div className="max-w-7xl mx-auto">
                    {/* Groups Grid */}
                    <h2 className="text-4xl font-teko text-white mb-6 border-l-4 border-blue-500 pl-4">{t.groupStage}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                        {GROUPS.map((group) => (
                            <GroupTable 
                                key={group.id} 
                                group={group} 
                                standings={standings} 
                                teams={TEAMS} 
                                userTeamId={userTeam?.id || null}
                            />
                        ))}
                    </div>
                    
                    {/* Ad Banner - Middle Placement */}
                    <AdBanner className="mb-8" />

                    {/* Match Schedule with Filters */}
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-6 gap-4 border-l-4 border-yellow-500 pl-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <h2 className="text-4xl font-teko text-white leading-none">{t.matchSchedule}</h2>
                             {unfinishedGroupMatches ? (
                                <button 
                                    onClick={autoSimulateGroup}
                                    disabled={simulatingId !== null}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded font-teko text-lg tracking-wide transition-colors disabled:opacity-50 shadow-lg shadow-blue-900/20 flex items-center gap-2 whitespace-nowrap"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                                    </svg>
                                    {simulatingId === 'BATCH' ? t.simulating : t.quickSim}
                                </button>
                            ) : (
                                <button 
                                    onClick={handleRestart}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded font-teko text-lg tracking-wide transition-colors shadow-lg shadow-red-900/20 flex items-center gap-2 whitespace-nowrap"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                    </svg>
                                    {t.restart}
                                </button>
                            )}
                        </div>
                        
                        {/* Filters Toolbar */}
                        <div className="flex flex-wrap gap-2 items-center bg-slate-800/50 p-2 rounded-lg border border-white/10">
                            {/* Search */}
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder={t.searchPlaceholder} 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-black/40 border border-white/10 text-white text-sm rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 w-40 placeholder-gray-500"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-2 top-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            {/* Group Filter */}
                            <select 
                                value={filterGroup}
                                onChange={(e) => setFilterGroup(e.target.value)}
                                className="bg-black/40 border border-white/10 text-white text-sm rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
                            >
                                <option value="ALL">{t.allGroups}</option>
                                {GROUPS.map(g => (
                                    <option key={g.id} value={g.id}>{t.group} {g.id}</option>
                                ))}
                            </select>

                            {/* Team Filter */}
                            <select 
                                value={filterTeam}
                                onChange={(e) => setFilterTeam(e.target.value)}
                                className="bg-black/40 border border-white/10 text-white text-sm rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer max-w-[150px]"
                            >
                                <option value="ALL">{t.allTeams}</option>
                                {allTeamsList.map(team => (
                                    <option key={team.id} value={team.id}>{team.name[language]}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredMatches.length > 0 ? (
                            filteredMatches.map(match => (
                                <MatchCard 
                                    key={match.id} 
                                    match={match} 
                                    teams={TEAMS}
                                    userTeamId={userTeam?.id || null}
                                    onSimulate={hasKnockouts ? undefined : simulateMatch}
                                    onUpdateScore={handleUpdateScore}
                                    loading={simulatingId === match.id}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center bg-white/5 rounded-xl border border-dashed border-white/20">
                                <p className="text-gray-400 text-lg">{t.noMatchesFound}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {appState === AppState.KNOCKOUT_STAGE && (
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-auto">
                    <Bracket 
                        matches={matches.filter(m => m.stage !== 'Group')}
                        teams={TEAMS}
                        userTeamId={userTeam?.id || null}
                        onSimulate={simulateMatch}
                        onUpdateScore={handleUpdateScore}
                        onSimulatePhase={handleSimulatePhase}
                        onRestartPhase={handleRestartPhase}
                        simulatingId={simulatingId}
                    />
                </div>
                {/* Ad Banner - Bottom Placement for Knockouts */}
                <div className="shrink-0 px-6 bg-slate-900 border-t border-white/5">
                    <AdBanner />
                </div>
            </div>
        )}
      </main>
      
      {/* Footer Version Indicator */}
      <div className="absolute bottom-1 right-2 text-[10px] text-gray-600 font-mono pointer-events-none z-0">
        v1.3.1-ads
      </div>
    </div>
  );
}