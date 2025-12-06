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

// Helper to find stadium by loose name matching from the prompt
export const findStadium = (query: string): Stadium => {
    const q = query.toLowerCase();
    if (q.includes('azteca') || q.includes('ciudad de méxico')) return STADIUMS[0];
    if (q.includes('monterrey')) return STADIUMS[1];
    if (q.includes('guadalajara')) return STADIUMS[2];
    if (q.includes('bc place') || q.includes('vancouver')) return STADIUMS[3];
    if (q.includes('toronto')) return STADIUMS[4];
    if (q.includes('new york') || q.includes('nueva york') || q.includes('metlife')) return STADIUMS[5];
    if (q.includes('dallas')) return STADIUMS[6];
    if (q.includes('kansas')) return STADIUMS[7];
    if (q.includes('houston')) return STADIUMS[8];
    if (q.includes('atlanta')) return STADIUMS[9];
    if (q.includes('los angeles') || q.includes('los ángeles')) return STADIUMS[10];
    if (q.includes('philadelphia') || q.includes('filadelfia')) return STADIUMS[11];
    if (q.includes('seattle')) return STADIUMS[12];
    if (q.includes('san francisco') || q.includes('bay area')) return STADIUMS[13];
    if (q.includes('boston')) return STADIUMS[14];
    if (q.includes('miami')) return STADIUMS[15];
    return STADIUMS[0]; // Fallback
};

export const TEAMS: Record<string, Team> = {
  // --- Group A ---
  'MEX': { id: 'MEX', name: { en: 'Mexico', es: 'México' }, code: 'MEX', flag: getFlag('mx'), rating: 84, confederation: 'CONCACAF' },
  'RSA': { id: 'RSA', name: { en: 'South Africa', es: 'Sudáfrica' }, code: 'RSA', flag: getFlag('za'), rating: 76, confederation: 'CAF' },
  'KOR': { id: 'KOR', name: { en: 'South Korea', es: 'Corea del Sur' }, code: 'KOR', flag: getFlag('kr'), rating: 80, confederation: 'AFC' },
  'DEN': { id: 'DEN', name: { en: 'Denmark', es: 'Dinamarca' }, code: 'DEN', flag: getFlag('dk'), rating: 81, confederation: 'UEFA' },

  // --- Group B ---
  'CAN': { id: 'CAN', name: { en: 'Canada', es: 'Canadá' }, code: 'CAN', flag: getFlag('ca'), rating: 80, confederation: 'CONCACAF' },
  'ITA': { id: 'ITA', name: { en: 'Italy', es: 'Italia' }, code: 'ITA', flag: getFlag('it'), rating: 87, confederation: 'UEFA' },
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
  'TUR': { id: 'TUR', name: { en: 'Turkey', es: 'Turquía' }, code: 'TUR', flag: getFlag('tr'), rating: 78, confederation: 'UEFA' },

  // --- Group E ---
  'GER': { id: 'GER', name: { en: 'Germany', es: 'Alemania' }, code: 'GER', flag: getFlag('de'), rating: 89, confederation: 'UEFA' },
  'CUW': { id: 'CUW', name: { en: 'Curacao', es: 'Curasao' }, code: 'CUW', flag: getFlag('cw'), rating: 73, confederation: 'CONCACAF' },
  'CIV': { id: 'CIV', name: { en: 'Ivory Coast', es: 'Costa de Marfil' }, code: 'CIV', flag: getFlag('ci'), rating: 78, confederation: 'CAF' },
  'ECU': { id: 'ECU', name: { en: 'Ecuador', es: 'Ecuador' }, code: 'ECU', flag: getFlag('ec'), rating: 81, confederation: 'CONMEBOL' },

  // --- Group F ---
  'NED': { id: 'NED', name: { en: 'Netherlands', es: 'Países Bajos' }, code: 'NED', flag: getFlag('nl'), rating: 87, confederation: 'UEFA' },
  'JPN': { id: 'JPN', name: { en: 'Japan', es: 'Japón' }, code: 'JPN', flag: getFlag('jp'), rating: 83, confederation: 'AFC' },
  'UKR': { id: 'UKR', name: { en: 'Ukraine', es: 'Ucrania' }, code: 'UKR', flag: getFlag('ua'), rating: 79, confederation: 'UEFA' },
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
  'BOL': { id: 'BOL', name: { en: 'Bolivia', es: 'Bolivia' }, code: 'BOL', flag: getFlag('bo'), rating: 74, confederation: 'CONMEBOL' },
  'NOR': { id: 'NOR', name: { en: 'Norway', es: 'Noruega' }, code: 'NOR', flag: getFlag('no'), rating: 81, confederation: 'UEFA' },

  // --- Group J ---
  'ARG': { id: 'ARG', name: { en: 'Argentina', es: 'Argentina' }, code: 'ARG', flag: getFlag('ar'), rating: 94, confederation: 'CONMEBOL' },
  'ALG': { id: 'ALG', name: { en: 'Algeria', es: 'Argelia' }, code: 'ALG', flag: getFlag('dz'), rating: 78, confederation: 'CAF' },
  'AUT': { id: 'AUT', name: { en: 'Austria', es: 'Austria' }, code: 'AUT', flag: getFlag('at'), rating: 79, confederation: 'UEFA' },
  'JOR': { id: 'JOR', name: { en: 'Jordan', es: 'Jordania' }, code: 'JOR', flag: getFlag('jo'), rating: 74, confederation: 'AFC' },

  // --- Group K ---
  'POR': { id: 'POR', name: { en: 'Portugal', es: 'Portugal' }, code: 'POR', flag: getFlag('pt'), rating: 89, confederation: 'UEFA' },
  'JAM': { id: 'JAM', name: { en: 'Jamaica', es: 'Jamaica' }, code: 'JAM', flag: getFlag('jm'), rating: 72, confederation: 'CONCACAF' },
  'UZB': { id: 'UZB', name: { en: 'Uzbekistan', es: 'Uzbekistán' }, code: 'UZB', flag: getFlag('uz'), rating: 72, confederation: 'AFC' },
  'COL': { id: 'COL', name: { en: 'Colombia', es: 'Colombia' }, code: 'COL', flag: getFlag('co'), rating: 85, confederation: 'CONMEBOL' },

  // --- Group L ---
  'ENG': { id: 'ENG', name: { en: 'England', es: 'Inglaterra' }, code: 'ENG', flag: getFlag('gb-eng'), rating: 90, confederation: 'UEFA' },
  'CRO': { id: 'CRO', name: { en: 'Croatia', es: 'Croacia' }, code: 'CRO', flag: getFlag('hr'), rating: 85, confederation: 'UEFA' },
  'GHA': { id: 'GHA', name: { en: 'Ghana', es: 'Ghana' }, code: 'GHA', flag: getFlag('gh'), rating: 77, confederation: 'CAF' },
  'PAN': { id: 'PAN', name: { en: 'Panama', es: 'Panamá' }, code: 'PAN', flag: getFlag('pa'), rating: 73, confederation: 'CONCACAF' },
};

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

interface ScheduleItem {
    id: number;
    group: string;
    venue: string;
    date: LocalizedString;
    pairing: [number, number]; // Index in group (0-3)
}

// Full Match Schedule 1-72
const SCHEDULE_DATA: ScheduleItem[] = [
    // June 11
    { id: 1, group: 'A', venue: 'Estadio Ciudad de México', date: {en: 'Jun 11, 2026', es: '11 de Jun, 2026'}, pairing: [0, 1] }, // Mex vs RSA
    { id: 2, group: 'A', venue: 'Estadio Guadalajara', date: {en: 'Jun 11, 2026', es: '11 de Jun, 2026'}, pairing: [2, 3] },
    // June 12
    { id: 3, group: 'B', venue: 'Toronto Stadium', date: {en: 'Jun 12, 2026', es: '12 de Jun, 2026'}, pairing: [0, 1] }, // Can vs Ita
    { id: 4, group: 'D', venue: 'Los Angeles Stadium', date: {en: 'Jun 12, 2026', es: '12 de Jun, 2026'}, pairing: [0, 1] }, // USA vs Par
    // June 13
    { id: 5, group: 'C', venue: 'Boston Stadium', date: {en: 'Jun 13, 2026', es: '13 de Jun, 2026'}, pairing: [0, 1] },
    { id: 6, group: 'D', venue: 'BC Place Vancouver', date: {en: 'Jun 13, 2026', es: '13 de Jun, 2026'}, pairing: [2, 3] },
    { id: 7, group: 'C', venue: 'Nueva York Nueva Jersey Stadium', date: {en: 'Jun 13, 2026', es: '13 de Jun, 2026'}, pairing: [2, 3] },
    { id: 8, group: 'B', venue: 'San Francisco Bay Area Stadium', date: {en: 'Jun 13, 2026', es: '13 de Jun, 2026'}, pairing: [2, 3] },
    // June 14
    { id: 9, group: 'E', venue: 'Philadelphia Stadium', date: {en: 'Jun 14, 2026', es: '14 de Jun, 2026'}, pairing: [0, 1] },
    { id: 10, group: 'E', venue: 'Houston Stadium', date: {en: 'Jun 14, 2026', es: '14 de Jun, 2026'}, pairing: [2, 3] },
    { id: 11, group: 'F', venue: 'Dallas Stadium', date: {en: 'Jun 14, 2026', es: '14 de Jun, 2026'}, pairing: [0, 1] },
    { id: 12, group: 'F', venue: 'Estadio Monterrey', date: {en: 'Jun 14, 2026', es: '14 de Jun, 2026'}, pairing: [2, 3] },
    // June 15
    { id: 13, group: 'H', venue: 'Miami Stadium', date: {en: 'Jun 15, 2026', es: '15 de Jun, 2026'}, pairing: [0, 1] },
    { id: 14, group: 'H', venue: 'Atlanta Stadium', date: {en: 'Jun 15, 2026', es: '15 de Jun, 2026'}, pairing: [2, 3] },
    { id: 15, group: 'G', venue: 'Los Angeles Stadium', date: {en: 'Jun 15, 2026', es: '15 de Jun, 2026'}, pairing: [0, 1] },
    { id: 16, group: 'G', venue: 'Seattle Stadium', date: {en: 'Jun 15, 2026', es: '15 de Jun, 2026'}, pairing: [2, 3] },
    // June 16
    { id: 17, group: 'I', venue: 'New York New Jersey Stadium', date: {en: 'Jun 16, 2026', es: '16 de Jun, 2026'}, pairing: [0, 1] },
    { id: 18, group: 'I', venue: 'Boston Stadium', date: {en: 'Jun 16, 2026', es: '16 de Jun, 2026'}, pairing: [2, 3] },
    { id: 19, group: 'J', venue: 'Kansas City Stadium', date: {en: 'Jun 16, 2026', es: '16 de Jun, 2026'}, pairing: [0, 1] },
    { id: 20, group: 'J', venue: 'San Francisco Bay Area Stadium', date: {en: 'Jun 16, 2026', es: '16 de Jun, 2026'}, pairing: [2, 3] },
    // June 17
    { id: 21, group: 'L', venue: 'Toronto Stadium', date: {en: 'Jun 17, 2026', es: '17 de Jun, 2026'}, pairing: [0, 1] },
    { id: 22, group: 'L', venue: 'Dallas Stadium', date: {en: 'Jun 17, 2026', es: '17 de Jun, 2026'}, pairing: [2, 3] },
    { id: 23, group: 'K', venue: 'Houston Stadium', date: {en: 'Jun 17, 2026', es: '17 de Jun, 2026'}, pairing: [0, 1] },
    { id: 24, group: 'K', venue: 'Estadio Ciudad de México', date: {en: 'Jun 17, 2026', es: '17 de Jun, 2026'}, pairing: [2, 3] },
    
    // Round 2
    // June 18
    { id: 25, group: 'A', venue: 'Atlanta Stadium', date: {en: 'Jun 18, 2026', es: '18 de Jun, 2026'}, pairing: [1, 2] },
    { id: 26, group: 'B', venue: 'Los Angeles Stadium', date: {en: 'Jun 18, 2026', es: '18 de Jun, 2026'}, pairing: [1, 3] },
    { id: 27, group: 'B', venue: 'BC Place Vancouver', date: {en: 'Jun 18, 2026', es: '18 de Jun, 2026'}, pairing: [0, 2] }, // Can match
    { id: 28, group: 'A', venue: 'Estadio Guadalajara', date: {en: 'Jun 18, 2026', es: '18 de Jun, 2026'}, pairing: [0, 3] }, // Mex Match
    // June 19
    { id: 29, group: 'C', venue: 'Philadelphia Stadium', date: {en: 'Jun 19, 2026', es: '19 de Jun, 2026'}, pairing: [0, 2] },
    { id: 30, group: 'C', venue: 'Boston Stadium', date: {en: 'Jun 19, 2026', es: '19 de Jun, 2026'}, pairing: [1, 3] },
    { id: 31, group: 'D', venue: 'San Francisco Bay Area Stadium', date: {en: 'Jun 19, 2026', es: '19 de Jun, 2026'}, pairing: [1, 3] },
    { id: 32, group: 'D', venue: 'Seattle Stadium', date: {en: 'Jun 19, 2026', es: '19 de Jun, 2026'}, pairing: [0, 2] }, // USA Match
    // June 20
    { id: 33, group: 'E', venue: 'Toronto Stadium', date: {en: 'Jun 20, 2026', es: '20 de Jun, 2026'}, pairing: [0, 2] },
    { id: 34, group: 'E', venue: 'Kansas City Stadium', date: {en: 'Jun 20, 2026', es: '20 de Jun, 2026'}, pairing: [1, 3] },
    { id: 35, group: 'F', venue: 'Houston Stadium', date: {en: 'Jun 20, 2026', es: '20 de Jun, 2026'}, pairing: [0, 2] },
    { id: 36, group: 'F', venue: 'Estadio Monterrey', date: {en: 'Jun 20, 2026', es: '20 de Jun, 2026'}, pairing: [1, 3] },
    // June 21
    { id: 37, group: 'H', venue: 'Miami Stadium', date: {en: 'Jun 21, 2026', es: '21 de Jun, 2026'}, pairing: [0, 2] },
    { id: 38, group: 'H', venue: 'Atlanta Stadium', date: {en: 'Jun 21, 2026', es: '21 de Jun, 2026'}, pairing: [1, 3] },
    { id: 39, group: 'G', venue: 'Los Angeles Stadium', date: {en: 'Jun 21, 2026', es: '21 de Jun, 2026'}, pairing: [0, 2] },
    { id: 40, group: 'G', venue: 'BC Place Vancouver', date: {en: 'Jun 21, 2026', es: '21 de Jun, 2026'}, pairing: [1, 3] },
    // June 22
    { id: 41, group: 'I', venue: 'Nueva York Nueva Jersey Stadium', date: {en: 'Jun 22, 2026', es: '22 de Jun, 2026'}, pairing: [0, 2] },
    { id: 42, group: 'I', venue: 'Philadelphia Stadium', date: {en: 'Jun 22, 2026', es: '22 de Jun, 2026'}, pairing: [1, 3] },
    { id: 43, group: 'J', venue: 'Dallas Stadium', date: {en: 'Jun 22, 2026', es: '22 de Jun, 2026'}, pairing: [0, 2] },
    { id: 44, group: 'J', venue: 'San Francisco Bay Area Stadium', date: {en: 'Jun 22, 2026', es: '22 de Jun, 2026'}, pairing: [1, 3] },
    // June 23
    { id: 45, group: 'L', venue: 'Boston Stadium', date: {en: 'Jun 23, 2026', es: '23 de Jun, 2026'}, pairing: [0, 2] },
    { id: 46, group: 'L', venue: 'Toronto Stadium', date: {en: 'Jun 23, 2026', es: '23 de Jun, 2026'}, pairing: [1, 3] },
    { id: 47, group: 'K', venue: 'Houston Stadium', date: {en: 'Jun 23, 2026', es: '23 de Jun, 2026'}, pairing: [0, 2] },
    { id: 48, group: 'K', venue: 'Estadio Guadalajara', date: {en: 'Jun 23, 2026', es: '23 de Jun, 2026'}, pairing: [1, 3] },
    
    // Round 3
    // June 24
    { id: 49, group: 'C', venue: 'Miami Stadium', date: {en: 'Jun 24, 2026', es: '24 de Jun, 2026'}, pairing: [3, 0] },
    { id: 50, group: 'C', venue: 'Atlanta Stadium', date: {en: 'Jun 24, 2026', es: '24 de Jun, 2026'}, pairing: [1, 2] },
    { id: 51, group: 'B', venue: 'BC Place Vancouver', date: {en: 'Jun 24, 2026', es: '24 de Jun, 2026'}, pairing: [0, 3] }, // Can Match
    { id: 52, group: 'B', venue: 'Seattle Stadium', date: {en: 'Jun 24, 2026', es: '24 de Jun, 2026'}, pairing: [1, 2] },
    { id: 53, group: 'A', venue: 'Estadio Ciudad de México', date: {en: 'Jun 24, 2026', es: '24 de Jun, 2026'}, pairing: [0, 2] }, // Mex Match (Seed vs 3rd)
    { id: 54, group: 'A', venue: 'Estadio Monterrey', date: {en: 'Jun 24, 2026', es: '24 de Jun, 2026'}, pairing: [1, 3] },
    // June 25
    { id: 55, group: 'E', venue: 'Philadelphia Stadium', date: {en: 'Jun 25, 2026', es: '25 de Jun, 2026'}, pairing: [3, 0] },
    { id: 56, group: 'E', venue: 'New York New Jersey Stadium', date: {en: 'Jun 25, 2026', es: '25 de Jun, 2026'}, pairing: [1, 2] },
    { id: 57, group: 'F', venue: 'Dallas Stadium', date: {en: 'Jun 25, 2026', es: '25 de Jun, 2026'}, pairing: [3, 0] },
    { id: 58, group: 'F', venue: 'Kansas City Stadium', date: {en: 'Jun 25, 2026', es: '25 de Jun, 2026'}, pairing: [1, 2] },
    { id: 59, group: 'D', venue: 'Los Angeles Stadium', date: {en: 'Jun 25, 2026', es: '25 de Jun, 2026'}, pairing: [3, 0] }, // USA Match
    { id: 60, group: 'D', venue: 'San Francisco Bay Area Stadium', date: {en: 'Jun 25, 2026', es: '25 de Jun, 2026'}, pairing: [1, 2] },
    // June 26
    { id: 61, group: 'I', venue: 'Boston Stadium', date: {en: 'Jun 26, 2026', es: '26 de Jun, 2026'}, pairing: [3, 0] },
    { id: 62, group: 'I', venue: 'Toronto Stadium', date: {en: 'Jun 26, 2026', es: '26 de Jun, 2026'}, pairing: [1, 2] },
    { id: 63, group: 'G', venue: 'Seattle Stadium', date: {en: 'Jun 26, 2026', es: '26 de Jun, 2026'}, pairing: [3, 0] },
    { id: 64, group: 'G', venue: 'BC Place Vancouver', date: {en: 'Jun 26, 2026', es: '26 de Jun, 2026'}, pairing: [1, 2] },
    { id: 65, group: 'H', venue: 'Houston Stadium', date: {en: 'Jun 26, 2026', es: '26 de Jun, 2026'}, pairing: [3, 0] },
    { id: 66, group: 'H', venue: 'Estadio Guadalajara', date: {en: 'Jun 26, 2026', es: '26 de Jun, 2026'}, pairing: [1, 2] },
    // June 27
    { id: 67, group: 'L', venue: 'New York New Jersey Stadium', date: {en: 'Jun 27, 2026', es: '27 de Jun, 2026'}, pairing: [3, 0] },
    { id: 68, group: 'L', venue: 'Philadelphia Stadium', date: {en: 'Jun 27, 2026', es: '27 de Jun, 2026'}, pairing: [1, 2] },
    { id: 69, group: 'J', venue: 'Kansas City Stadium', date: {en: 'Jun 27, 2026', es: '27 de Jun, 2026'}, pairing: [3, 0] },
    { id: 70, group: 'J', venue: 'Dallas Stadium', date: {en: 'Jun 27, 2026', es: '27 de Jun, 2026'}, pairing: [1, 2] },
    { id: 71, group: 'K', venue: 'Miami Stadium', date: {en: 'Jun 27, 2026', es: '27 de Jun, 2026'}, pairing: [3, 0] },
    { id: 72, group: 'K', venue: 'Atlanta Stadium', date: {en: 'Jun 27, 2026', es: '27 de Jun, 2026'}, pairing: [1, 2] },
];

export const generateGroupSchedule = (): Match[] => {
    const times = ['13:00', '16:00', '19:00', '21:00'];
    return SCHEDULE_DATA.map(s => {
        const groupObj = GROUPS.find(g => g.id === s.group);
        if(!groupObj) throw new Error('Invalid Group');
        
        const homeId = groupObj.teams[s.pairing[0]];
        const awayId = groupObj.teams[s.pairing[1]];

        return {
            id: `M${s.id.toString().padStart(2, '0')}`, // M01, M02...
            homeTeamId: homeId,
            awayTeamId: awayId,
            homeScore: null,
            awayScore: null,
            isFinished: false,
            stage: 'Group',
            group: s.group,
            date: s.date,
            time: times[s.id % 4], // Distribute times cyclically
            stadium: findStadium(s.venue)
        };
    });
};