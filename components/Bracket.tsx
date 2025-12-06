import React from 'react';
import { Match, Team } from '../types';
import { MatchCard } from './MatchCard';
import { useLanguage } from '../contexts/LanguageContext';

interface BracketProps {
  matches: Match[];
  teams: Record<string, Team>;
  userTeamId: string | null;
  onSimulate: (match: Match) => void;
  onUpdateScore?: (matchId: string, home: number, away: number) => void;
  onSimulatePhase?: (stage: Match['stage']) => void;
  simulatingId: string | null;
}

export const Bracket: React.FC<BracketProps> = ({ matches, teams, userTeamId, onSimulate, onUpdateScore, onSimulatePhase, simulatingId }) => {
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
                        className={`text-xs px-3 py-1 rounded border border-white/20 uppercase tracking-widest transition-colors font-bold
                            ${isPhaseSimulating 
                                ? 'bg-yellow-600 text-white cursor-wait animate-pulse' 
                                : 'bg-white/5 hover:bg-white/20 text-gray-300 hover:text-white'
                            } disabled:opacity-50`}
                    >
                        {isPhaseSimulating ? t.simulating : t.simPhase}
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