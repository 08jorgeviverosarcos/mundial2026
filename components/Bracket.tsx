import React from 'react';
import { Match, Team } from '../types';
import { MatchCard } from './MatchCard';
import { useLanguage } from '../contexts/LanguageContext';

interface BracketProps {
  matches: Match[];
  teams: Record<string, Team>;
  userTeamId: string | null;
  onSimulate: (match: Match) => void;
  onUpdateScore?: (matchId: string, home: number, away: number, penaltyWinner?: string) => void;
  onSimulatePhase?: (stage: Match['stage']) => void;
  onRestartPhase?: (stage: Match['stage']) => void;
  simulatingId: string | null;
}

export const Bracket: React.FC<BracketProps> = ({ matches, teams, userTeamId, onSimulate, onUpdateScore, onSimulatePhase, onRestartPhase, simulatingId }) => {
  const { t } = useLanguage();

  const r32 = matches.filter(m => m.stage === 'Round of 32');
  const r16 = matches.filter(m => m.stage === 'Round of 16');
  const qf = matches.filter(m => m.stage === 'Quarter-Final');
  const sf = matches.filter(m => m.stage === 'Semi-Final');
  const f = matches.filter(m => m.stage === 'Final');

  const renderColumn = (title: string, stage: Match['stage'], stageMatches: Match[], color: string) => {
    // Check if we can batch simulate:
    // 1. Are there unfinished matches?
    // 2. Are there ready matches (both teams known) among the unfinished ones?
    const unfinished = stageMatches.filter(m => !m.isFinished);
    const readyToSimulate = unfinished.filter(m => m.homeTeamId && m.awayTeamId).length > 0;
    const isPhaseSimulating = simulatingId === `BATCH_${stage}`;
    const isPhaseFinished = stageMatches.length > 0 && unfinished.length === 0;

    return (
        <div className="flex flex-col gap-6 min-w-[340px] px-2">
            <div className={`sticky top-0 bg-slate-900/95 py-4 z-10 backdrop-blur-xl border-b border-white/10 shadow-lg flex flex-col gap-2 items-center`}>
                <h3 className={`text-center font-teko text-3xl ${color} uppercase tracking-widest`}>
                    {title}
                </h3>
                {onSimulatePhase && readyToSimulate && (
                    <button
                        onClick={() => onSimulatePhase(stage)}
                        disabled={simulatingId !== null}
                        className={`px-3 py-1 rounded font-teko text-lg tracking-wide transition-colors disabled:opacity-50 shadow-lg flex items-center gap-2 whitespace-nowrap
                            ${isPhaseSimulating 
                                ? 'bg-yellow-600 shadow-yellow-900/20 cursor-wait animate-pulse text-white' 
                                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 text-white'
                            }`}
                    >
                        {!isPhaseSimulating && (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                            </svg>
                        )}
                        {isPhaseSimulating ? t.simulating : t.simPhase}
                    </button>
                )}
                
                {onRestartPhase && isPhaseFinished && (
                    <button
                        onClick={() => onRestartPhase(stage)}
                        className="px-3 py-1 rounded font-teko text-lg tracking-wide transition-colors shadow-lg flex items-center gap-2 whitespace-nowrap bg-red-600 hover:bg-red-500 shadow-red-900/20 text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        {t.restartPhase}
                    </button>
                )}
            </div>
            
            <div className="flex flex-col justify-center gap-6 pb-20 mt-4">
                {stageMatches.length > 0 ? (
                    stageMatches.map(match => (
                    <MatchCard 
                        key={match.id} 
                        match={match} 
                        teams={teams} 
                        userTeamId={userTeamId} 
                        onSimulate={onSimulate}
                        onUpdateScore={onUpdateScore}
                        loading={simulatingId === match.id || isPhaseSimulating}
                    />
                    ))
                ) : (
                    <div className="text-gray-500 text-center italic p-4 border border-white/5 rounded">
                        Pending...
                    </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="w-full h-full overflow-x-auto overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <div className="flex px-8 pb-12 pt-4 min-w-max h-full">
            {renderColumn(t.stages['Round of 32'], 'Round of 32', r32, 'text-blue-400')}
            
            {/* Connector Lines (Visual Only - simplified) */}
            <div className="w-12 hidden md:block"></div>
            
            {renderColumn(t.stages['Round of 16'], 'Round of 16', r16, 'text-cyan-400')}
            <div className="w-12 hidden md:block"></div>
            
            {renderColumn(t.stages['Quarter-Final'], 'Quarter-Final', qf, 'text-purple-400')}
            <div className="w-12 hidden md:block"></div>
            
            {renderColumn(t.stages['Semi-Final'], 'Semi-Final', sf, 'text-pink-400')}
            <div className="w-12 hidden md:block"></div>
            
            {renderColumn(t.stages['Final'], 'Final', f, 'text-yellow-400')}
        </div>
    </div>
  );
};