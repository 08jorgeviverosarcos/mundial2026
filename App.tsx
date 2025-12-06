import React, { useState, useEffect } from 'react';
import { TEAMS, GROUPS, generateGroupSchedule, STADIUMS } from './constants';
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

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [appState, setAppState] = useState<AppState>(AppState.SELECT_TEAM);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Record<string, GroupStanding>>({});
  const [simulatingId, setSimulatingId] = useState<string | null>(null);

  // Initialize Data
  useEffect(() => {
    // Init matches
    const initialMatches = generateGroupSchedule();
    setMatches(initialMatches);

    // Init standings
    const initialStandings: Record<string, GroupStanding> = {};
    Object.keys(TEAMS).forEach(teamId => {
      initialStandings[teamId] = { teamId, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
    });
    setStandings(initialStandings);
  }, []);

  const handleSelectTeam = (team: Team) => {
    setUserTeam(team);
    setAppState(AppState.GROUP_STAGE);
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

  // Effect to handle Bracket Progression automatically when matches finish
  useEffect(() => {
     if (appState !== AppState.KNOCKOUT_STAGE) return;
     
     // Map match IDs to their next destination
     // Based on FIFA bracket structure:
     // R32 (16 matches) -> R16 (8 matches) -> QF (4) -> SF (2) -> F (1)
     
     // Logic: Match M73 & M74 -> Winner to M89 (Example)
     // To keep it dynamic, we use a pairing map or algorithmic index
     
     const advanceWinner = (currentStage: string, matchesList: Match[]) => {
         const currentStageMatches = matchesList.filter(m => m.stage === currentStage);
         
         // Sort by ID to ensure pairing 0&1, 2&3 etc.
         // Assumption: M73, M74 feed into next. 
         // Since IDs are M73, M74... we can just parse the number.
         
         let changed = false;
         const newMatches = [...matchesList];

         currentStageMatches.forEach(match => {
            if (match.isFinished && match.winnerId) {
                const matchNum = parseInt(match.id.replace('M', ''));
                
                // Determine next match ID
                let nextMatchNum = 0;
                let isHome = false;

                // Simple Bracket Logic: (N, N+1) -> Next
                // R32: 73-88 -> R16: 89-96
                if (matchNum >= 73 && matchNum <= 88) {
                    const offset = matchNum - 73;
                    nextMatchNum = 89 + Math.floor(offset / 2);
                    isHome = offset % 2 === 0;
                }
                // R16: 89-96 -> QF: 97-100
                else if (matchNum >= 89 && matchNum <= 96) {
                    const offset = matchNum - 89;
                    nextMatchNum = 97 + Math.floor(offset / 2);
                    isHome = offset % 2 === 0;
                }
                // QF: 97-100 -> SF: 101-102
                else if (matchNum >= 97 && matchNum <= 100) {
                    const offset = matchNum - 97;
                    nextMatchNum = 101 + Math.floor(offset / 2);
                    isHome = offset % 2 === 0;
                }
                // SF: 101-102 -> F: 104 (103 is 3rd place, skipped for now)
                else if (matchNum >= 101 && matchNum <= 102) {
                    nextMatchNum = 104;
                    isHome = (matchNum === 101); // 101 is Home in Final
                }

                if (nextMatchNum > 0) {
                    const targetId = `M${nextMatchNum}`;
                    const targetIdx = newMatches.findIndex(m => m.id === targetId);
                    if (targetIdx !== -1) {
                        const target = newMatches[targetIdx];
                        if (isHome) {
                            if (target.homeTeamId !== match.winnerId) {
                                newMatches[targetIdx] = { ...target, homeTeamId: match.winnerId };
                                changed = true;
                            }
                        } else {
                            if (target.awayTeamId !== match.winnerId) {
                                newMatches[targetIdx] = { ...target, awayTeamId: match.winnerId };
                                changed = true;
                            }
                        }
                    }
                }
            }
         });

         if (changed) {
             setMatches(newMatches);
         }
     };

     advanceWinner('Round of 32', matches);
     advanceWinner('Round of 16', matches);
     advanceWinner('Quarter-Final', matches);
     advanceWinner('Semi-Final', matches);

  }, [matches, appState]);


  const finishGroupStage = () => {
    // 1. Determine positions for each group
    const positions: Record<string, string[]> = {}; // GroupID -> [1stID, 2ndID, 3rdID]
    const thirdPlaceTeams: GroupStanding[] = [];

    GROUPS.forEach(group => {
        const groupStandings = group.teams.map(t => standings[t]).sort((a, b) => {
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
    const best8Ids = best8Thirds.map(t => t.teamId);

    // Helper: Find a 3rd place team not from specific group
    // In a real simulation we'd use the complex FIFA grid. 
    // Here we use a greedy allocation for visual purposes.
    const allocatedThirds = new Set<string>();
    const getNextBestThird = (avoidGroupId: string): string => {
        // Try to find one not from avoidGroupId
        const candidate = best8Thirds.find(t => 
            !allocatedThirds.has(t.teamId) && 
            TEAMS[t.teamId].id !== positions[avoidGroupId]?.[2] // Check logic: positions[avoidGroupId][2] is the 3rd of that group
        );
        
        if (candidate) {
            allocatedThirds.add(candidate.teamId);
            return candidate.teamId;
        }
        
        // Fallback: take any available
        const fallback = best8Thirds.find(t => !allocatedThirds.has(t.teamId));
        if (fallback) {
             allocatedThirds.add(fallback.teamId);
             return fallback.teamId;
        }
        return 'TBD';
    };

    // 3. Helper to fetch team by code
    const getTeam = (code: string): string => {
        // code examples: "1A", "2B", "3rd"
        if (code === "3rd") return "3rd"; // handled dynamically
        const rank = parseInt(code[0]) - 1;
        const groupId = code.slice(1);
        return positions[groupId][rank];
    };

    // 4. Bracket Definition (FIFA 2026 Style - Matches 73 to 104)
    // Structure: Home vs Away
    // 3rds play against: A, B, C, D, E, F, G, H, I, J, K, L winners?
    // Actually typically 1A, 1B, 1C... play 3rds. 
    // We will assign 8 group winners to play 3rds.
    // Let's assume A, B, C, D, E, F, G, H play 3rds for simplicity/visuals if 12 groups.
    // Actually with 12 groups, its more spread out.
    // Using a fixed structure for the demo:
    
    const bracketPlan = [
        // R32 (Matches 73-88)
        // Revised Plan to ensure 8x 1st vs 3rd
        { m: 73, h: '2A', a: '2B' },
        { m: 74, h: '1K', a: '3rd' }, // 1K vs 3rd
        { m: 75, h: '1C', a: '2D' },
        { m: 76, h: '1F', a: '3rd' }, // 1F vs 3rd
        { m: 77, h: '1A', a: '3rd' }, // 1A vs 3rd
        { m: 78, h: '1E', a: '2F' },
        { m: 79, h: '1I', a: '3rd' }, // 1I vs 3rd
        { m: 80, h: '1L', a: '3rd' }, // 1L vs 3rd
        
        { m: 81, h: '1B', a: '3rd' }, // 1B vs 3rd
        { m: 82, h: '1J', a: '2H' },
        { m: 83, h: '1D', a: '3rd' }, // 1D vs 3rd
        { m: 84, h: '1G', a: '2I' },
        { m: 85, h: '1H', a: '3rd' }, // 1H vs 3rd
        { m: 86, h: '2C', a: '2E' },
        { m: 87, h: '2G', a: '2J' },
        { m: 88, h: '2K', a: '2L' },  // 2K vs 2L
    ];

    const newMatches: Match[] = [];
    
    const getKnockoutDate = (dayOffset: number): LocalizedString => {
        const d = new Date(2026, 5, 28); // June 28
        d.setDate(d.getDate() + dayOffset);
        
        const monthNamesEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const monthNamesEs = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        
        return {
            en: `${monthNamesEn[d.getMonth()]} ${d.getDate()}, 2026`,
            es: `${d.getDate()} de ${monthNamesEs[d.getMonth()]}, 2026`
        };
    };

    const createKnockout = (id: string, stage: Match['stage'], h: string | null, a: string | null, dateOffset: number): Match => ({
        id,
        homeTeamId: h,
        awayTeamId: a,
        homeScore: null,
        awayScore: null,
        isFinished: false,
        stage,
        date: getKnockoutDate(dateOffset),
        stadium: STADIUMS[dateOffset % STADIUMS.length]
    });

    // Populate R32
    bracketPlan.forEach((p, idx) => {
        let homeId = getTeam(p.h);
        let awayId = p.a === '3rd' ? getNextBestThird(p.h.slice(1)) : getTeam(p.a);
        
        newMatches.push(createKnockout(`M${p.m}`, 'Round of 32', homeId, awayId, Math.floor(idx/2.5)));
    });

    // Populate subsequent rounds (Empty placeholders)
    // R16: M89-M96
    for(let i=0; i<8; i++) newMatches.push(createKnockout(`M${89+i}`, 'Round of 16', null, null, 6 + Math.floor(i/2)));
    // QF: M97-M100
    for(let i=0; i<4; i++) newMatches.push(createKnockout(`M${97+i}`, 'Quarter-Final', null, null, 11 + i));
    // SF: M101-M102
    for(let i=0; i<2; i++) newMatches.push(createKnockout(`M${101+i}`, 'Semi-Final', null, null, 16 + i));
    // Final: M104
    newMatches.push(createKnockout(`M104`, 'Final', null, null, 21));

    setMatches(prev => [...prev.filter(m => m.stage === 'Group'), ...newMatches]);
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
                <button 
                    onClick={autoSimulateGroup}
                    disabled={simulatingId !== null}
                    className="hidden md:block px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-teko text-xl tracking-wide transition-colors disabled:opacity-50"
                >
                    {simulatingId === 'BATCH' ? t.simulating : t.quickSim}
                </button>
                <button 
                    onClick={finishGroupStage}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded font-teko text-xl tracking-wide transition-colors"
                >
                    {t.goToKnockouts}
                </button>
                </>
            )}
            {appState === AppState.KNOCKOUT_STAGE && (
                 <button 
                    onClick={() => {
                        setAppState(AppState.SELECT_TEAM);
                        setMatches(generateGroupSchedule());
                        setUserTeam(null);
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded font-teko text-xl tracking-wide transition-colors"
                >
                    Restart
                </button>
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
                                onSimulate={simulateMatch}
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
                simulatingId={simulatingId}
             />
        )}
      </main>
    </div>
  );
}