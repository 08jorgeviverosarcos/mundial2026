import React from 'react';
import { Match, Team } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface MatchCardProps {
  match: Match;
  teams: Record<string, Team>;
  userTeamId: string | null;
  onSimulate?: (match: Match) => void;
  loading?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, teams, userTeamId, onSimulate, loading }) => {
  const { language, t } = useLanguage();
  const home = match.homeTeamId ? teams[match.homeTeamId] : null;
  const away = match.awayTeamId ? teams[match.awayTeamId] : null;

  const isUserMatch = match.homeTeamId === userTeamId || match.awayTeamId === userTeamId;

  const stageLabel = match.stage === 'Group' 
    ? `${t.group} ${match.group} - ${t.match}` 
    : t.stages[match.stage];

  return (
    <div className={`relative overflow-hidden rounded-xl border ${isUserMatch ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-white/10'} bg-slate-900/60 backdrop-blur-md p-4 flex flex-col gap-3 min-w-[300px]`}>
      
      {/* Header */}
      <div className="flex justify-between items-center text-xs text-gray-400 uppercase tracking-widest font-semibold">
        <span>{stageLabel}</span>
        <span>{match.stadium.city[language]}</span>
      </div>

      <div className="flex justify-between items-center py-2">
        {/* Home Team */}
        <div className="flex flex-col items-center w-1/3 text-center">
          {home ? (
            <>
              <img src={home.flag} alt={home.name[language]} className="w-10 h-7 object-cover rounded shadow-sm mb-2" />
              <span className={`font-teko text-xl ${home.id === userTeamId ? 'text-yellow-400' : 'text-white'}`}>{home.code}</span>
            </>
          ) : (
             <div className="w-10 h-7 bg-white/10 rounded animate-pulse"></div>
          )}
        </div>

        {/* Scoreboard / VS */}
        <div className="flex flex-col items-center w-1/3">
          {match.isFinished ? (
            <div className="flex gap-2 text-3xl font-teko font-bold text-white">
              <span>{match.homeScore}</span>
              <span className="text-gray-500">-</span>
              <span>{match.awayScore}</span>
            </div>
          ) : (
            <span className="text-xl font-teko text-gray-500">{t.vs}</span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center w-1/3 text-center">
          {away ? (
            <>
              <img src={away.flag} alt={away.name[language]} className="w-10 h-7 object-cover rounded shadow-sm mb-2" />
              <span className={`font-teko text-xl ${away.id === userTeamId ? 'text-yellow-400' : 'text-white'}`}>{away.code}</span>
            </>
          ) : (
            <div className="w-10 h-7 bg-white/10 rounded animate-pulse"></div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="min-h-[24px] flex items-center justify-center">
        {match.isFinished ? (
          <p className="text-xs text-center text-cyan-300 italic line-clamp-2 px-2">"{match.commentary}"</p>
        ) : (
          home && away && onSimulate && (
            <button 
              onClick={() => onSimulate(match)}
              disabled={loading}
              className={`text-xs px-4 py-1 rounded-full uppercase tracking-wider font-bold transition-all
                ${loading ? 'bg-gray-600 text-gray-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50'}
              `}
            >
              {loading ? t.simulating : t.simulate}
            </button>
          )
        )}
      </div>
    </div>
  );
};