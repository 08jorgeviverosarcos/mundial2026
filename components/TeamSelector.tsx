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
    <div className="flex flex-col items-center min-h-screen bg-[url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative overflow-y-auto">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm fixed"></div>
      
      <div className="relative z-10 w-full max-w-5xl p-6 flex flex-col items-center">
        {/* Header Section */}
        <div className="flex-shrink-0 text-center mb-6 mt-8">
            <h1 className="text-6xl md:text-8xl font-bold font-teko text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-green-400 mb-2 uppercase drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
            {t.title}
            </h1>
            <h2 className="text-2xl md:text-3xl font-light text-gray-300 uppercase tracking-widest">
            {t.subtitle}
            </h2>
        </div>

        {/* Value Proposition Box */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 text-center max-w-3xl mx-auto shadow-lg backdrop-blur-md">
            <h3 className="text-xl font-bold text-blue-400 mb-2 font-teko tracking-wide uppercase">
                {language === 'es' ? '¿Cómo funciona el simulador?' : 'How the Simulator Works'}
            </h3>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                {language === 'es' 
                    ? "Bienvenido a la herramienta definitiva de predicción para la Copa Mundial 2026. Utilizando algoritmos avanzados de IA, nuestro sistema simula cada partido del torneo basándose en el rendimiento actual, clasificaciones históricas y estadísticas de los equipos. No es solo un juego de azar: es un análisis deportivo completo que te permite visualizar posibles escenarios, desde la fase de grupos hasta la gran final."
                    : "Welcome to the ultimate prediction tool for the 2026 World Cup. Using advanced AI algorithms, our system simulates every match of the tournament based on current form, historical rankings, and team statistics. It's not just a guessing game—it's a comprehensive sports analysis that allows you to visualize potential scenarios, from the group stages to the grand final."
                }
            </p>
        </div>

        <div className="text-center mb-4">
             <p className="text-lg text-white font-semibold animate-pulse">{t.selectTeam}</p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 w-full mb-12">
          {teamsList.map((team) => (
            <button
              key={team.id}
              onClick={() => onSelect(team)}
              className="group flex flex-col items-center p-3 bg-slate-800/80 border border-white/10 rounded-lg hover:bg-slate-700 hover:border-blue-500 transition-all duration-200 hover:scale-105 shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img 
                src={team.flag} 
                alt={`${team.name[language]} Flag`} 
                className="w-10 h-7 object-cover rounded shadow-md mb-2 z-10" 
              />
              <span className="font-bold text-xs text-gray-300 group-hover:text-white uppercase tracking-wider z-10">{team.code}</span>
              <span className="text-[10px] text-gray-500 group-hover:text-blue-200 truncate w-full text-center z-10">
                {team.name[language]}
              </span>
            </button>
          ))}
        </div>

        {/* High Value Content Article (For AdSense) */}
        <article className="w-full bg-black/40 border border-white/5 rounded-xl p-8 mb-8 text-gray-400">
            <h3 className="text-2xl font-teko text-white mb-4 uppercase border-b border-white/10 pb-2">
                {language === 'es' ? 'Sobre el Mundial 2026' : 'About World Cup 2026'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed">
                <div>
                    <h4 className="font-bold text-gray-200 mb-2">
                        {language === 'es' ? 'Un Nuevo Formato Histórico' : 'A Historic New Format'}
                    </h4>
                    <p className="mb-4">
                        {language === 'es' 
                        ? "La Copa Mundial 2026 será la primera en incluir 48 selecciones, un aumento significativo desde las 32 tradicionales. Este cambio introduce una nueva estructura con 12 grupos de 4 equipos cada uno. Los dos primeros de cada grupo y los 8 mejores terceros avanzarán a una nueva ronda de dieciseisavos de final." 
                        : "The 2026 World Cup will be the first to feature 48 teams, a significant increase from the traditional 32. This change introduces a new structure with 12 groups of 4 teams each. The top two from each group and the 8 best third-placed teams will advance to a new Round of 32 knockout stage."}
                    </p>
                    <h4 className="font-bold text-gray-200 mb-2">
                         {language === 'es' ? 'Tres Anfitriones' : 'Three Hosts'}
                    </h4>
                    <p>
                        {language === 'es'
                        ? "Por primera vez, el torneo se celebrará en tres naciones anfitrionas: Estados Unidos, México y Canadá. Con sedes icónicas como el Estadio Azteca, que hará historia al albergar su tercera Copa Mundial, y estadios modernos de la NFL en EE.UU., el evento promete ser el más grande en la historia del deporte."
                        : "For the first time, the tournament will be hosted by three nations: the United States, Mexico, and Canada. With iconic venues like the Estadio Azteca, making history by hosting its third World Cup, and modern NFL stadiums in the US, the event promises to be the largest in sports history."}
                    </p>
                </div>
                <div>
                     <h4 className="font-bold text-gray-200 mb-2">
                         {language === 'es' ? 'Simulación con IA' : 'AI Simulation'}
                    </h4>
                    <p className="mb-4">
                        {language === 'es'
                        ? "Nuestro simulador utiliza datos actualizados del ranking FIFA y el rendimiento histórico para proyectar los resultados más probables. Sin embargo, el fútbol siempre tiene sorpresas. Puedes ajustar manualmente cualquier marcador para ver cómo un resultado inesperado altera todo el cuadro de eliminación directa."
                        : "Our simulator uses updated FIFA ranking data and historical performance to project the most probable outcomes. However, football always has surprises. You can manually adjust any score to see how an unexpected result alters the entire knockout bracket."}
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-500">
                        <li>104 {language === 'es' ? 'Partidos Totales' : 'Total Matches'}</li>
                        <li>16 {language === 'es' ? 'Ciudades Sede' : 'Host Cities'}</li>
                        <li>48 {language === 'es' ? 'Selecciones Nacionales' : 'National Teams'}</li>
                    </ul>
                </div>
            </div>
        </article>

        {/* Footer Info */}
        <div className="w-full text-center pt-6 border-t border-white/10 text-[10px] text-gray-600">
            <p>© 2024 FIFA 26 Simulator. {language === 'es' ? 'Herramienta no oficial.' : 'Unofficial tool.'}</p>
            <p className="mt-1">
                {language === 'es' ? 'Datos basados en proyecciones y estadísticas deportivas.' : 'Data based on projections and sports statistics.'}
            </p>
        </div>
      </div>
    </div>
  );
};