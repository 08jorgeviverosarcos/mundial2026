import { Team, Group, Stadium, Match, LocalizedString } from './types';

// Using flagcdn for flags
const getFlag = (code: string) => `https://flagcdn.com/w320/${code.toLowerCase()}.png`;

export const STADIUMS: Stadium[] = [
  // Mexico
  { name: 'Estadio Azteca', city: { en: 'Mexico City', es: 'Ciudad de México' }, country: { en: 'Mexico', es: 'México' } },
  { name: 'Estadio BBVA', city: { en: 'Monterrey', es: 'Monterrey' }, country: { en: 'Mexico', es: 'México' } },
  { name: 'Estadio Akron', city: { en: 'Guadalajara', es: 'Guadalajara' }, country: { en: 'Mexico', es: 'México' } },
  // Canada
  { name: 'BC Place', city: { en: 'Vancouver', es: 'Vancouver' }, country: { en: 'Canada', es: 'Canadá' } },
  { name: 'BMO Field', city: { en: 'Toronto', es: 'Toronto' }, country: { en: 'Canada', es: 'Canadá' } },
  // USA
  { name: 'MetLife Stadium', city: { en: 'New York/New Jersey', es: 'Nueva York/Nueva Jersey' }, country: { en: 'USA', es: 'EE.UU.' } },
  { name: 'AT&T Stadium', city: { en: 'Dallas', es: 'Dallas' }, country: { en: 'USA', es: 'EE.UU.' } },
  { name: 'Arrowhead Stadium', city: { en: 'Kansas City', es: 'Kansas City' }, country: { en: 'USA', es: 'EE.UU.' } },
  { name: 'NRG Stadium', city: { en: 'Houston', es: 'Houston' }, country: { en: 'USA', es: 'EE.UU.' } },
  { name: 'Mercedes-Benz Stadium', city: { en: 'Atlanta', es: 'Atlanta' }, country: { en: 'USA', es: 'EE.UU.' } },
  { name: 'SoFi Stadium', city: { en: 'Los Angeles', es: 'Los Ángeles' }, country: { en: 'USA', es: 'EE.UU.' } },
  { name: 'Lincoln Financial Field', city: { en: 'Philadelphia', es: 'Filadelfia' }, country: { en: 'USA', es: 'EE.UU.' } },
  { name: 'Lumen Field', city: { en: 'Seattle', es: 'Seattle' }, country: { en: 'USA', es: 'EE.UU.' } },
  { name: 'Levi\'s Stadium', city: { en: 'San Francisco Bay Area', es: 'Área de la Bahía de SF' }, country: { en: 'USA', es: 'EE.UU.' } },
  { name: 'Gillette Stadium', city: { en: 'Boston', es: 'Boston' }, country: { en: 'USA', es: 'EE.UU.' } },
  { name: 'Hard Rock Stadium', city: { en: 'Miami', es: 'Miami' }, country: { en: 'USA', es: 'EE.UU.' } },
];

export const TEAMS: Record<string, Team> = {
  // --- Group A ---
  'MEX': { id: 'MEX', name: { en: 'Mexico', es: 'México' }, code: 'MEX', flag: getFlag('mx'), rating: 84, confederation: 'CONCACAF' },
  'RSA': { id: 'RSA', name: { en: 'South Africa', es: 'Sudáfrica' }, code: 'RSA', flag: getFlag('za'), rating: 76, confederation: 'CAF' },
  'KOR': { id: 'KOR', name: { en: 'South Korea', es: 'Corea del Sur' }, code: 'KOR', flag: getFlag('kr'), rating: 80, confederation: 'AFC' },
  'DEN': { id: 'DEN', name: { en: 'Denmark (PO)', es: 'Dinamarca (RP)' }, code: 'DEN', flag: getFlag('dk'), rating: 81, confederation: 'UEFA' },

  // --- Group B ---
  'CAN': { id: 'CAN', name: { en: 'Canada', es: 'Canadá' }, code: 'CAN', flag: getFlag('ca'), rating: 80, confederation: 'CONCACAF' },
  'ITA': { id: 'ITA', name: { en: 'Italy (PO)', es: 'Italia (RP)' }, code: 'ITA', flag: getFlag('it'), rating: 87, confederation: 'UEFA' },
  'QAT': { id: 'QAT', name: { en: 'Qatar', es: 'Catar' }, code: 'QAT', flag: getFlag('qa'), rating: 74, confederation: 'AFC' },
  'SUI': { id: 'SUI', name: { en: 'Switzerland', es: 'Suiza' }, code: 'SUI', flag: getFlag('ch'), rating: 82, confederation: 'UEFA' },

  // --- Group C ---
  'BRA': { id: 'BRA', name: { en: 'Brazil', es: 'Brasil' }, code: 'BRA', flag: getFlag('br'), rating: 92, confederation: 'CONMEBOL' },
  'MAR': { id: 'MAR', name: { en: 'Morocco', es: 'Marruecos' }, code: 'MAR', flag: getFlag('ma'), rating: 84, confederation: 'CAF' },
  'HAI': { id: 'HAI', name: { en: 'Haiti', es: 'Haití' }, code: 'HAI', flag: getFlag('ht'), rating: 72, confederation: 'CONCACAF' },
  'SCO': { id: 'SCO', name: { en: 'Scotland', es: 'Escocia' }, code: 'SCO', flag: getFlag('gb-sct'), rating: 79, confederation: 'UEFA' },

  // --- Group D ---
  'USA': { id: 'USA', name: { en: 'USA', es: 'EE.UU.' }, code: 'USA', flag: getFlag('us'), rating: 86, confederation: 'CONCACAF' },
  'PAR': { id: 'PAR', name: { en: 'Paraguay', es: 'Paraguay' }, code: 'PAR', flag: getFlag('py'), rating: 77, confederation: 'CONMEBOL' },
  'AUS': { id: 'AUS', name: { en: 'Australia', es: 'Australia' }, code: 'AUS', flag: getFlag('au'), rating: 77, confederation: 'AFC' },
  'TUR': { id: 'TUR', name: { en: 'Turkey (PO)', es: 'Turquía (RP)' }, code: 'TUR', flag: getFlag('tr'), rating: 78, confederation: 'UEFA' },

  // --- Group E ---
  'GER': { id: 'GER', name: { en: 'Germany', es: 'Alemania' }, code: 'GER', flag: getFlag('de'), rating: 89, confederation: 'UEFA' },
  'CUW': { id: 'CUW', name: { en: 'Curacao', es: 'Curasao' }, code: 'CUW', flag: getFlag('cw'), rating: 73, confederation: 'CONCACAF' },
  'CIV': { id: 'CIV', name: { en: 'Ivory Coast', es: 'Costa de Marfil' }, code: 'CIV', flag: getFlag('ci'), rating: 78, confederation: 'CAF' },
  'ECU': { id: 'ECU', name: { en: 'Ecuador', es: 'Ecuador' }, code: 'ECU', flag: getFlag('ec'), rating: 81, confederation: 'CONMEBOL' },

  // --- Group F ---
  'NED': { id: 'NED', name: { en: 'Netherlands', es: 'Países Bajos' }, code: 'NED', flag: getFlag('nl'), rating: 87, confederation: 'UEFA' },
  'JPN': { id: 'JPN', name: { en: 'Japan', es: 'Japón' }, code: 'JPN', flag: getFlag('jp'), rating: 83, confederation: 'AFC' },
  'UKR': { id: 'UKR', name: { en: 'Ukraine (PO)', es: 'Ucrania (RP)' }, code: 'UKR', flag: getFlag('ua'), rating: 79, confederation: 'UEFA' },
  'TUN': { id: 'TUN', name: { en: 'Tunisia', es: 'Túnez' }, code: 'TUN', flag: getFlag('tn'), rating: 75, confederation: 'CAF' },

  // --- Group G ---
  'BEL': { id: 'BEL', name: { en: 'Belgium', es: 'Bélgica' }, code: 'BEL', flag: getFlag('be'), rating: 88, confederation: 'UEFA' },
  'EGY': { id: 'EGY', name: { en: 'Egypt', es: 'Egipto' }, code: 'EGY', flag: getFlag('eg'), rating: 78, confederation: 'CAF' },
  'IRN': { id: 'IRN', name: { en: 'Iran', es: 'Irán' }, code: 'IRN', flag: getFlag('ir'), rating: 78, confederation: 'AFC' },
  'NZL': { id: 'NZL', name: { en: 'New Zealand', es: 'Nueva Zelanda' }, code: 'NZL', flag: getFlag('nz'), rating: 74, confederation: 'OFC' },

  // --- Group H ---
  'ESP': { id: 'ESP', name: { en: 'Spain', es: 'España' }, code: 'ESP', flag: getFlag('es'), rating: 91, confederation: 'UEFA' },
  'CPV': { id: 'CPV', name: { en: 'Cabo Verde', es: 'Cabo Verde' }, code: 'CPV', flag: getFlag('cv'), rating: 75, confederation: 'CAF' },
  'KSA': { id: 'KSA', name: { en: 'Saudi Arabia', es: 'Arabia Saudí' }, code: 'KSA', flag: getFlag('sa'), rating: 76, confederation: 'AFC' },
  'URU': { id: 'URU', name: { en: 'Uruguay', es: 'Uruguay' }, code: 'URU', flag: getFlag('uy'), rating: 86, confederation: 'CONMEBOL' },

  // --- Group I ---
  'FRA': { id: 'FRA', name: { en: 'France', es: 'Francia' }, code: 'FRA', flag: getFlag('fr'), rating: 93, confederation: 'UEFA' },
  'SEN': { id: 'SEN', name: { en: 'Senegal', es: 'Senegal' }, code: 'SEN', flag: getFlag('sn'), rating: 80, confederation: 'CAF' },
  'BOL': { id: 'BOL', name: { en: 'Bolivia (PO)', es: 'Bolivia (RP)' }, code: 'BOL', flag: getFlag('bo'), rating: 74, confederation: 'CONMEBOL' },
  'NOR': { id: 'NOR', name: { en: 'Norway', es: 'Noruega' }, code: 'NOR', flag: getFlag('no'), rating: 81, confederation: 'UEFA' },

  // --- Group J ---
  'ARG': { id: 'ARG', name: { en: 'Argentina', es: 'Argentina' }, code: 'ARG', flag: getFlag('ar'), rating: 94, confederation: 'CONMEBOL' },
  'ALG': { id: 'ALG', name: { en: 'Algeria', es: 'Argelia' }, code: 'ALG', flag: getFlag('dz'), rating: 78, confederation: 'CAF' },
  'AUT': { id: 'AUT', name: { en: 'Austria', es: 'Austria' }, code: 'AUT', flag: getFlag('at'), rating: 79, confederation: 'UEFA' },
  'JOR': { id: 'JOR', name: { en: 'Jordan', es: 'Jordania' }, code: 'JOR', flag: getFlag('jo'), rating: 74, confederation: 'AFC' },

  // --- Group K ---
  'POR': { id: 'POR', name: { en: 'Portugal', es: 'Portugal' }, code: 'POR', flag: getFlag('pt'), rating: 89, confederation: 'UEFA' },
  'JAM': { id: 'JAM', name: { en: 'Jamaica (PO)', es: 'Jamaica (RP)' }, code: 'JAM', flag: getFlag('jm'), rating: 72, confederation: 'CONCACAF' },
  'UZB': { id: 'UZB', name: { en: 'Uzbekistan', es: 'Uzbekistán' }, code: 'UZB', flag: getFlag('uz'), rating: 72, confederation: 'AFC' },
  'COL': { id: 'COL', name: { en: 'Colombia', es: 'Colombia' }, code: 'COL', flag: getFlag('co'), rating: 85, confederation: 'CONMEBOL' },

  // --- Group L ---
  'ENG': { id: 'ENG', name: { en: 'England', es: 'Inglaterra' }, code: 'ENG', flag: getFlag('gb-eng'), rating: 90, confederation: 'UEFA' },
  'CRO': { id: 'CRO', name: { en: 'Croatia', es: 'Croacia' }, code: 'CRO', flag: getFlag('hr'), rating: 85, confederation: 'UEFA' },
  'GHA': { id: 'GHA', name: { en: 'Ghana', es: 'Ghana' }, code: 'GHA', flag: getFlag('gh'), rating: 77, confederation: 'CAF' },
  'PAN': { id: 'PAN', name: { en: 'Panama', es: 'Panamá' }, code: 'PAN', flag: getFlag('pa'), rating: 73, confederation: 'CONCACAF' },
};

// "Official" Groups for the Simulation (48 Teams, 12 Groups)
export const GROUPS: Group[] = [
  { id: 'A', teams: ['MEX', 'RSA', 'KOR', 'DEN'] },
  { id: 'B', teams: ['CAN', 'ITA', 'QAT', 'SUI'] },
  { id: 'C', teams: ['BRA', 'MAR', 'HAI', 'SCO'] },
  { id: 'D', teams: ['USA', 'PAR', 'AUS', 'TUR'] },
  { id: 'E', teams: ['GER', 'CUW', 'CIV', 'ECU'] },
  { id: 'F', teams: ['NED', 'JPN', 'UKR', 'TUN'] },
  { id: 'G', teams: ['BEL', 'EGY', 'IRN', 'NZL'] },
  { id: 'H', teams: ['ESP', 'CPV', 'KSA', 'URU'] },
  { id: 'I', teams: ['FRA', 'SEN', 'BOL', 'NOR'] },
  { id: 'J', teams: ['ARG', 'ALG', 'AUT', 'JOR'] },
  { id: 'K', teams: ['POR', 'JAM', 'UZB', 'COL'] },
  { id: 'L', teams: ['ENG', 'CRO', 'GHA', 'PAN'] },
];

// Defined before usage to prevent ordering issues
const getStadiumByCountry = (country: string, salt: number) => {
    const list = STADIUMS.filter(s => s.country.en === country);
    return list.length > 0 ? list[salt % list.length] : STADIUMS[salt % STADIUMS.length];
};

const createMatch = (id: number, homeId: string, awayId: string, stage: Match['stage'], group: string, groupIndex: number, pairIdx: number): Match => {
  let stadium: Stadium;
  // Simplified Host Venue Logic
  if (groupIndex === 0) stadium = getStadiumByCountry('Mexico', id);
  else if (groupIndex === 1) stadium = getStadiumByCountry('Canada', id);
  else if (groupIndex === 2) stadium = getStadiumByCountry('USA', id);
  else stadium = STADIUMS[(id + groupIndex) % STADIUMS.length];
  
  // Calculate Date
  const baseDay = 11;
  const matchDay = baseDay + Math.floor(id / 5); 

  return {
    id: `GM-${id}`,
    homeTeamId: homeId,
    awayTeamId: awayId,
    homeScore: null,
    awayScore: null,
    isFinished: false,
    stage,
    group,
    date: { en: `June ${matchDay}, 2026`, es: `${matchDay} de Junio, 2026` },
    stadium
  };
};

export const generateGroupSchedule = (): Match[] => {
  const matches: Match[] = [];
  let matchIdCounter = 1;

  GROUPS.forEach((group, groupIndex) => {
    const t = group.teams;
    // 6 Matches per group
    const pairs = [
        [t[0], t[1]], [t[2], t[3]],
        [t[0], t[2]], [t[1], t[3]],
        [t[3], t[0]], [t[1], t[2]]
    ];

    pairs.forEach((pair, idx) => {
       matches.push(createMatch(matchIdCounter++, pair[0], pair[1], 'Group', group.id, groupIndex, idx));
    });
  });

  return matches;
};