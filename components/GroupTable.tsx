import React from 'react';
import { Group, GroupStanding, Team } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface GroupTableProps {
  group: Group;
  standings: Record<string, GroupStanding>;
  teams: Record<string, Team>;
  userTeamId: string | null;
}

export const GroupTable: React.FC<GroupTableProps> = ({ group, standings, teams, userTeamId }) => {
  const { language, t } = useLanguage();

  const sortedTeamIds = [...group.teams].sort((a, b) => {
    const statA = standings[a];
    const statB = standings[b];
    if (statB.points !== statA.points) return statB.points - statA.points;
    if (statB.gd !== statA.gd) return statB.gd - statA.gd;
    return statB.gf - statA.gf;
  });

  return (
    <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-xl p-4 min-w-[320px]">
      <h3 className="text-xl font-teko text-blue-400 mb-3 border-b border-white/10 pb-1">
        {t.group} {group.id}
      </h3>
      <div className="w-full">
        <div className="grid grid-cols-12 gap-1 text-[10px] text-gray-400 uppercase tracking-widest mb-2 px-2">
          <div className="col-span-6">Team</div>
          <div className="col-span-1 text-center">{t.mp}</div>
          <div className="col-span-1 text-center">{t.w}</div>
          <div className="col-span-1 text-center">{t.d}</div>
          <div className="col-span-1 text-center">{t.l}</div>
          <div className="col-span-1 text-center">{t.gd}</div>
          <div className="col-span-1 text-center font-bold text-white">{t.pts}</div>
        </div>
        
        <div className="space-y-1">
          {sortedTeamIds.map((teamId, index) => {
            const team = teams[teamId];
            const stats = standings[teamId];
            const isUser = teamId === userTeamId;
            const rankColor = index < 2 ? 'border-l-4 border-l-green-500' : (index === 2 ? 'border-l-4 border-l-yellow-500/50' : 'border-l-4 border-l-transparent');

            return (
              <div 
                key={teamId} 
                className={`grid grid-cols-12 gap-1 items-center bg-white/5 rounded p-2 ${rankColor} ${isUser ? 'bg-yellow-900/20' : ''}`}
              >
                <div className="col-span-6 flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono w-3">{index + 1}</span>
                  <img src={team.flag} alt={`${t.prediction} ${team.name[language]}`} className="w-5 h-3.5 object-cover rounded shadow-sm" />
                  <span className={`text-sm font-bold font-teko truncate ${isUser ? 'text-yellow-400' : 'text-gray-200'}`}>
                    {team.name[language]}
                  </span>
                </div>
                <div className="col-span-1 text-center text-xs text-gray-400">{stats.played}</div>
                <div className="col-span-1 text-center text-xs text-gray-400">{stats.won}</div>
                <div className="col-span-1 text-center text-xs text-gray-400">{stats.drawn}</div>
                <div className="col-span-1 text-center text-xs text-gray-400">{stats.lost}</div>
                <div className="col-span-1 text-center text-xs text-gray-400">{stats.gd}</div>
                <div className="col-span-1 text-center text-sm font-bold text-white">{stats.points}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};