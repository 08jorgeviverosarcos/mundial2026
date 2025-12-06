import React, { useState, useEffect } from 'react';
import { TEAMS, GROUPS, generateGroupSchedule, STADIUMS, findStadium } from './constants';
import { Team, Match, GroupStanding, LocalizedString } from './types';
import { TeamSelector } from './components/TeamSelector';
import { GroupTable } from './components/GroupTable';
import { MatchCard } from './components/MatchCard';
import { Bracket } from './components/Bracket';
import { simulateMatchWithAI, simulateBatchMatches } from './services/geminiService';
import { useLanguage } from './contexts/LanguageContext';

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

  const hasKnockouts = matches.some(m => m.stage !== 'Group');

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
    }
  }, []);

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

  const handleSelectTeam = (team: Team) => {
    setUserTeam(team);
    setAppState(AppState.GROUP_STAGE);
  };

  const handleRestart = () => {
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

  const handleUpdateScore = (matchId: string, homeScore: number, awayScore: number) => {
      const matchIndex = matches.findIndex(m => m.id === matchId);
      if (matchIndex === -1) return;

      const updatedMatch = {
          ...matches[matchIndex],
          homeScore,
          awayScore,
          isFinished: true,
          commentary: language === 'es' ? "Resultado editado." : "Result edited.",
          winnerId: homeScore > awayScore 
                    ? matches[matchIndex].homeTeamId 
                    : (awayScore > homeScore ? matches[matchIndex].awayTeamId : null)
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
                              winnerId: null,
                              commentary: undefined
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

    const homeTeam = TEAMS[match.homeTeamId];
    const awayTeam = TEAMS[match.awayTeamId];

    const result = await simulateMatchWithAI(homeTeam, awayTeam, match.stage, language);

    const updatedMatches = matches.map(m => {
      if (m.id === match.id) {
        return {
          ...m,
          homeScore: result.homeScore,
          awayScore: result.awayScore,
          isFinished: true,
          commentary: result.commentary,
          winnerId: result.homeScore > result.awayScore ? m.homeTeamId : (result.awayScore > result.homeScore ? m.awayTeamId : null)
        };
      }
      return m;
    });

    setMatches(updatedMatches);

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


  const finishGroupStage = () => {
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

  const autoSimulateGroup = async () => {
      const unfinished = matches.filter(m => m.stage === 'Group' && !m.isFinished);
      if (unfinished.length === 0) return;

      setSimulatingId('BATCH'); 

      const results = await simulateBatchMatches(unfinished, TEAMS, language);

      const updatedMatches = matches.map(m => {
          const res = results.find(r => r.matchId === m.id);
          if (res) {
              return { 
                  ...m, 
                  isFinished: true, 
                  homeScore: res.homeScore, 
                  awayScore: res.awayScore, 
                  commentary: res.commentary 
              };
          }
          return m;
      });

      setMatches(updatedMatches);
      setStandings(calculateStandingsFromScratch(updatedMatches));
      setSimulatingId(null);
  };

  const handleSimulatePhase = async (stage: Match['stage']) => {
      const unfinished = matches.filter(m => m.stage === stage && !m.isFinished && m.homeTeamId && m.awayTeamId);
      if (unfinished.length === 0) return;

      setSimulatingId(`BATCH_${stage}`);

      const results = await simulateBatchMatches(unfinished, TEAMS, language);

      const updatedMatches = matches.map(m => {
          const res = results.find(r => r.matchId === m.id);
          if (res) {
              return { 
                  ...m, 
                  isFinished: true, 
                  homeScore: res.homeScore, 
                  awayScore: res.awayScore, 
                  commentary: res.commentary,
                  winnerId: res.homeScore > res.awayScore ? m.homeTeamId : m.awayTeamId
              };
          }
          return m;
      });

      setMatches(updatedMatches);
      setSimulatingId(null);
  };

  const Navbar = () => (
    <nav className="h-16 border-b border-white/10 bg-slate-900/80 backdrop-blur sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
            <h1 className="font-teko text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                {t.title}
            </h1>
            {userTeam && (
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    <span className="text-xs text-gray-400 uppercase">{t.yourTeam}:</span>
                    <img src={userTeam.flag} className="w-6 h-4 rounded" alt="flag" />
                    <span className="font-bold text-sm text-yellow-400">{userTeam.code}</span>
                </div>
            )}
        </div>
        
        <div className="flex items-center gap-4">
            {appState === AppState.GROUP_STAGE && (
                <>
                {!hasKnockouts && (
                    <button 
                        onClick={autoSimulateGroup}
                        disabled={simulatingId !== null}
                        className="hidden md:block px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-teko text-xl tracking-wide transition-colors disabled:opacity-50"
                    >
                        {simulatingId === 'BATCH' ? t.simulating : t.quickSim}
                    </button>
                )}
                <button 
                    onClick={() => {
                        if (hasKnockouts) {
                            setAppState(AppState.KNOCKOUT_STAGE);
                        } else {
                            finishGroupStage();
                        }
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded font-teko text-xl tracking-wide transition-colors"
                >
                    {t.goToKnockouts}
                </button>
                </>
            )}
            {appState === AppState.KNOCKOUT_STAGE && (
                 <>
                 <button 
                    onClick={() => setAppState(AppState.GROUP_STAGE)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-teko text-xl tracking-wide transition-colors mr-2"
                >
                    {t.viewGroups}
                </button>
                 <button 
                    onClick={handleRestart}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded font-teko text-xl tracking-wide transition-colors"
                >
                    Restart
                </button>
                </>
            )}
            
            <div className="flex bg-white/10 rounded-lg p-1">
                <button 
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-1 text-xs font-bold rounded ${language === 'en' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    EN
                </button>
                <button 
                    onClick={() => setLanguage('es')}
                    className={`px-2 py-1 text-xs font-bold rounded ${language === 'es' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
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
                <button onClick={() => setLanguage('en')} className={`px-2 py-1 text-xs font-bold rounded ${language === 'en' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}>EN</button>
                <button onClick={() => setLanguage('es')} className={`px-2 py-1 text-xs font-bold rounded ${language === 'es' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}>ES</button>
            </div>
            <TeamSelector onSelect={handleSelectTeam} />
        </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col relative">
      <Navbar />

      <main className="flex-1 overflow-hidden relative">
        {simulatingId === 'BATCH' && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h2 className="text-3xl font-teko text-white animate-pulse">{t.simulating}</h2>
            </div>
        )}

        {appState === AppState.GROUP_STAGE && (
            <div className="h-full overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto">
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

                    <h2 className="text-4xl font-teko text-white mb-6 border-l-4 border-yellow-500 pl-4">{t.matchSchedule}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {matches.filter(m => m.stage === 'Group').map(match => (
                            <MatchCard 
                                key={match.id} 
                                match={match} 
                                teams={TEAMS}
                                userTeamId={userTeam?.id || null}
                                onSimulate={hasKnockouts ? undefined : simulateMatch}
                                onUpdateScore={handleUpdateScore}
                                loading={simulatingId === match.id}
                            />
                        ))}
                    </div>
                </div>
            </div>
        )}

        {appState === AppState.KNOCKOUT_STAGE && (
             <Bracket 
                matches={matches.filter(m => m.stage !== 'Group')}
                teams={TEAMS}
                userTeamId={userTeam?.id || null}
                onSimulate={simulateMatch}
                onUpdateScore={handleUpdateScore}
                onSimulatePhase={handleSimulatePhase}
                simulatingId={simulatingId}
             />
        )}
      </main>
    </div>
  );
}