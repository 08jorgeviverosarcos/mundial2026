import React, { useState } from 'react';
import { Match, Team } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface MatchCardProps {
  match: Match;
  teams: Record<string, Team>;
  userTeamId: string | null;
  onSimulate?: (match: Match) => void;
  onUpdateScore?: (matchId: string, home: number, away: number) => void;
  loading?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, teams, userTeamId, onSimulate, onUpdateScore, loading }) => {
  const { language, t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editHome, setEditHome] = useState(match.homeScore?.toString() || '0');
  const [editAway, setEditAway] = useState(match.awayScore?.toString() || '0');

  const home = match.homeTeamId ? teams[match.homeTeamId] : null;
  const away = match.awayTeamId ? teams[match.awayTeamId] : null;

  const isUserMatch = match.homeTeamId === userTeamId || match.awayTeamId === userTeamId;

  const stageLabel = match.stage === 'Group' 
    ? `${t.group} ${match.group} - ${t.match}` 
    : t.stages[match.stage];

  const handleSave = () => {
    if (onUpdateScore) {
      const h = parseInt(editHome);
      const a = parseInt(editAway);
      if (!isNaN(h) && !isNaN(a)) {
        onUpdateScore(match.id, h, a);
        setIsEditing(false);
      }
    }
  };

  const handleEditClick = () => {
      setEditHome(match.homeScore?.toString() || '0');
      setEditAway(match.awayScore?.toString() || '0');
      setIsEditing(true);
  };

  return (
    <div className={`relative overflow-visible group rounded-xl border ${isUserMatch ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-white/10'} bg-slate-900/60 backdrop-blur-md p-4 flex flex-col gap-3 min-w-[300px]`}>
      
      {/* Edit Button (Always Visible) */}
      {onUpdateScore && home && away && !isEditing && (
          <button 
            onClick={handleEditClick}
            className="absolute top-2 right-2 p-1 text-gray-500 hover:text-white transition-colors z-10"
            title={t.edit}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
          </button>
      )}

      {/* Header */}
      <div className="flex justify-between items-center text-xs text-gray-400 uppercase tracking-widest font-semibold pr-4 mb-1">
        <span>{stageLabel}</span>
        <span>{match.stadium.city[language]}</span>
      </div>
      {/* Date & Time */}
      <div className="flex justify-center gap-2 text-[10px] text-blue-300 font-mono -mt-1 mb-2">
          <span>{match.date[language]}</span>
          {match.time && <span>• {match.time}</span>}
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

        {/* Scoreboard / VS / Edit Inputs */}
        <div className="flex flex-col items-center w-1/3 z-20">
          {isEditing ? (
              <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-2 items-center">
                      <input 
                        type="number" 
                        value={editHome} 
                        onChange={(e) => setEditHome(e.target.value)}
                        className="w-12 h-10 bg-black/50 border border-white/20 rounded text-center font-teko text-2xl text-white focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-gray-500">-</span>
                      <input 
                        type="number" 
                        value={editAway} 
                        onChange={(e) => setEditAway(e.target.value)}
                        className="w-12 h-10 bg-black/50 border border-white/20 rounded text-center font-teko text-2xl text-white focus:outline-none focus:border-blue-500"
                      />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={handleSave} className="bg-green-600 hover:bg-green-500 text-white text-[10px] px-2 py-0.5 rounded uppercase">{t.save}</button>
                    <button onClick={() => setIsEditing(false)} className="bg-gray-600 hover:bg-gray-500 text-white text-[10px] px-2 py-0.5 rounded uppercase">{t.cancel}</button>
                  </div>
              </div>
          ) : (
            match.isFinished ? (
                <div className="flex gap-2 text-3xl font-teko font-bold text-white">
                <span>{match.homeScore}</span>
                <span className="text-gray-500">-</span>
                <span>{match.awayScore}</span>
                </div>
            ) : (
                <span className="text-xl font-teko text-gray-500">{t.vs}</span>
            )
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
        {!isEditing && (
            match.isFinished ? (
               <div className="h-2"></div> 
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
            )
        )}
      </div>
    </div>
  );
};