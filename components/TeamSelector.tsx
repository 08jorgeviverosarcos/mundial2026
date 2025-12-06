import React from 'react';
import { TEAMS } from '../constants';
import { Team } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface TeamSelectorProps {
  onSelect: (team: Team) => void;
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({ onSelect }) => {
  const { language, t } = useLanguage();
  const teamsList = Object.values(TEAMS).sort((a, b) => 
    a.name[language].localeCompare(b.name[language])
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-4xl p-6 text-center animate-fade-in-up">
        <h1 className="text-6xl md:text-8xl font-bold font-teko text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-green-400 mb-2 uppercase drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
          {t.title}
        </h1>
        <h2 className="text-2xl md:text-4xl font-light text-gray-300 mb-8 uppercase tracking-widest">
          {t.subtitle}
        </h2>
        
        <p className="text-lg text-gray-400 mb-6">{t.selectTeam}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {teamsList.map((team) => (
            <button
              key={team.id}
              onClick={() => onSelect(team)}
              className="group flex flex-col items-center p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/20 hover:border-blue-500 transition-all duration-300 hover:scale-105"
            >
              <img 
                src={team.flag} 
                alt={team.name[language]} 
                className="w-12 h-8 object-cover rounded shadow-md mb-3 group-hover:shadow-blue-500/50" 
              />
              <span className="font-bold text-sm text-gray-200 group-hover:text-white uppercase tracking-wider">{team.code}</span>
              <span className="text-xs text-gray-500 group-hover:text-gray-300 truncate w-full text-center">
                {team.name[language]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};