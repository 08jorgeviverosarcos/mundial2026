import React from 'react';
import { Match, Team } from '../types';
import { MatchCard } from './MatchCard';
import { useLanguage } from '../contexts/LanguageContext';

interface BracketProps {
  matches: Match[];
  teams: Record<string, Team>;
  userTeamId: string | null;
  onSimulate: (match: Match) => void;
  simulatingId: string | null;
}

export const Bracket: React.FC<BracketProps> = ({ matches, teams, userTeamId, onSimulate, simulatingId }) => {
  const { t } = useLanguage();

  const r32 = matches.filter(m => m.stage === 'Round of 32');
  const r16 = matches.filter(m => m.stage === 'Round of 16');
  const qf = matches.filter(m => m.stage === 'Quarter-Final');
  const sf = matches.filter(m => m.stage === 'Semi-Final');
  const f = matches.filter(m => m.stage === 'Final');

  const renderColumn = (title: string, stageMatches: Match[], color: string) => (
    <div className="flex flex-col gap-6 min-w-[340px] px-2">
      <h3 className={`text-center font-teko text-3xl ${color} uppercase tracking-widest sticky top-0 bg-slate-900/90 py-4 z-10 backdrop-blur-xl border-b border-white/10 shadow-lg`}>
        {title}
      </h3>
      <div className="flex flex-col justify-center gap-6 pb-20">
        {stageMatches.length > 0 ? (
            stageMatches.map(match => (
            <MatchCard 
                key={match.id} 
                match={match} 
                teams={teams} 
                userTeamId={userTeamId} 
                onSimulate={onSimulate}
                loading={simulatingId === match.id}
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

  return (
    <div className="w-full h-full overflow-x-auto overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <div className="flex px-8 pb-12 pt-4 min-w-max h-full">
            {renderColumn(t.stages['Round of 32'], r32, 'text-blue-400')}
            
            {/* Connector Lines (Visual Only - simplified) */}
            <div className="w-12 hidden md:block"></div>
            
            {renderColumn(t.stages['Round of 16'], r16, 'text-cyan-400')}
            <div className="w-12 hidden md:block"></div>
            
            {renderColumn(t.stages['Quarter-Final'], qf, 'text-purple-400')}
            <div className="w-12 hidden md:block"></div>
            
            {renderColumn(t.stages['Semi-Final'], sf, 'text-pink-400')}
            <div className="w-12 hidden md:block"></div>
            
            {renderColumn(t.stages['Final'], f, 'text-yellow-400')}
        </div>
    </div>
  );
};