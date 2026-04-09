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
  'CZE': { id: 'CZE', name: { en: 'Czech Republic', es: 'República Checa' }, code: 'CZE', flag: getFlag('cz'), rating: 79, confederation: 'UEFA' },

  // --- Group B ---
  'CAN': { id: 'CAN', name: { en: 'Canada', es: 'Canadá' }, code: 'CAN', flag: getFlag('ca'), rating: 80, confederation: 'CONCACAF' },
  'BIH': { id: 'BIH', name: { en: 'Bosnia and Herzegovina', es: 'Bosnia y Herzegovina' }, code: 'BIH', flag: getFlag('ba'), rating: 76, confederation: 'UEFA' },
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
  'SWE': { id: 'SWE', name: { en: 'Sweden', es: 'Suecia' }, code: 'SWE', flag: getFlag('se'), rating: 81, confederation: 'UEFA' },
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
  'IRQ': { id: 'IRQ', name: { en: 'Iraq', es: 'Irak' }, code: 'IRQ', flag: getFlag('iq'), rating: 75, confederation: 'AFC' },
  'NOR': { id: 'NOR', name: { en: 'Norway', es: 'Noruega' }, code: 'NOR', flag: getFlag('no'), rating: 81, confederation: 'UEFA' },

  // --- Group J ---
  'ARG': { id: 'ARG', name: { en: 'Argentina', es: 'Argentina' }, code: 'ARG', flag: getFlag('ar'), rating: 94, confederation: 'CONMEBOL' },
  'ALG': { id: 'ALG', name: { en: 'Algeria', es: 'Argelia' }, code: 'ALG', flag: getFlag('dz'), rating: 78, confederation: 'CAF' },
  'AUT': { id: 'AUT', name: { en: 'Austria', es: 'Austria' }, code: 'AUT', flag: getFlag('at'), rating: 79, confederation: 'UEFA' },
  'JOR': { id: 'JOR', name: { en: 'Jordan', es: 'Jordania' }, code: 'JOR', flag: getFlag('jo'), rating: 74, confederation: 'AFC' },

  // --- Group K ---
  'POR': { id: 'POR', name: { en: 'Portugal', es: 'Portugal' }, code: 'POR', flag: getFlag('pt'), rating: 89, confederation: 'UEFA' },
  'COD': { id: 'COD', name: { en: 'DR Congo', es: 'RD Congo' }, code: 'COD', flag: getFlag('cd'), rating: 76, confederation: 'CAF' },
  'UZB': { id: 'UZB', name: { en: 'Uzbekistan', es: 'Uzbekistán' }, code: 'UZB', flag: getFlag('uz'), rating: 72, confederation: 'AFC' },
  'COL': { id: 'COL', name: { en: 'Colombia', es: 'Colombia' }, code: 'COL', flag: getFlag('co'), rating: 85, confederation: 'CONMEBOL' },

  // --- Group L ---
  'ENG': { id: 'ENG', name: { en: 'England', es: 'Inglaterra' }, code: 'ENG', flag: getFlag('gb-eng'), rating: 90, confederation: 'UEFA' },
  'CRO': { id: 'CRO', name: { en: 'Croatia', es: 'Croacia' }, code: 'CRO', flag: getFlag('hr'), rating: 85, confederation: 'UEFA' },
  'GHA': { id: 'GHA', name: { en: 'Ghana', es: 'Ghana' }, code: 'GHA', flag: getFlag('gh'), rating: 77, confederation: 'CAF' },
  'PAN': { id: 'PAN', name: { en: 'Panama', es: 'Panamá' }, code: 'PAN', flag: getFlag('pa'), rating: 73, confederation: 'CONCACAF' },
};

export const GROUPS: Group[] = [
  { id: 'A', teams: ['MEX', 'RSA', 'KOR', 'CZE'] },
  { id: 'B', teams: ['CAN', 'BIH', 'QAT', 'SUI'] },
  { id: 'C', teams: ['BRA', 'MAR', 'HAI', 'SCO'] },
  { id: 'D', teams: ['USA', 'PAR', 'AUS', 'TUR'] },
  { id: 'E', teams: ['GER', 'CUW', 'CIV', 'ECU'] },
  { id: 'F', teams: ['NED', 'JPN', 'SWE', 'TUN'] },
  { id: 'G', teams: ['BEL', 'EGY', 'IRN', 'NZL'] },
  { id: 'H', teams: ['ESP', 'CPV', 'KSA', 'URU'] },
  { id: 'I', teams: ['FRA', 'SEN', 'IRQ', 'NOR'] },
  { id: 'J', teams: ['ARG', 'ALG', 'AUT', 'JOR'] },
  { id: 'K', teams: ['POR', 'COD', 'UZB', 'COL'] },
  { id: 'L', teams: ['ENG', 'CRO', 'GHA', 'PAN'] },
];

interface ScheduleItem {
    id: number;
    group: string;
    venue: string;
    dateTimeUtc: string; // ISO 8601 UTC — source of truth for all timezone conversions
    pairing: [number, number]; // Index in group teams array (0-3)
}

// Full Match Schedule — 72 group stage matches
// All times in UTC (EDT = UTC-4). Source: FIFA official / NBC Sports / Sky Sports
const SCHEDULE_DATA: ScheduleItem[] = [
    // ── ROUND 1 ──────────────────────────────────────────────────────────────
    // June 11
    { id:  1, group: 'A', venue: 'azteca',       dateTimeUtc: '2026-06-11T19:00:00Z', pairing: [0, 1] }, // MEX vs RSA  3pm ET
    { id:  2, group: 'A', venue: 'guadalajara',  dateTimeUtc: '2026-06-12T02:00:00Z', pairing: [2, 3] }, // KOR vs CZE  10pm ET Jun11
    // June 12
    { id:  3, group: 'B', venue: 'toronto',      dateTimeUtc: '2026-06-12T19:00:00Z', pairing: [0, 1] }, // CAN vs BIH  3pm ET
    { id:  4, group: 'D', venue: 'los angeles',  dateTimeUtc: '2026-06-13T01:00:00Z', pairing: [0, 1] }, // USA vs PAR  9pm ET Jun12
    // June 13
    { id:  5, group: 'B', venue: 'san francisco',dateTimeUtc: '2026-06-13T19:00:00Z', pairing: [2, 3] }, // QAT vs SUI  3pm ET
    { id:  6, group: 'C', venue: 'new york',     dateTimeUtc: '2026-06-13T22:00:00Z', pairing: [0, 1] }, // BRA vs MAR  6pm ET
    { id:  7, group: 'C', venue: 'boston',       dateTimeUtc: '2026-06-14T01:00:00Z', pairing: [2, 3] }, // HAI vs SCO  9pm ET Jun13
    { id:  8, group: 'D', venue: 'vancouver',    dateTimeUtc: '2026-06-14T04:00:00Z', pairing: [2, 3] }, // AUS vs TUR  midnight ET Jun13
    // June 14
    { id:  9, group: 'E', venue: 'houston',      dateTimeUtc: '2026-06-14T17:00:00Z', pairing: [0, 1] }, // GER vs CUW  1pm ET
    { id: 10, group: 'F', venue: 'dallas',       dateTimeUtc: '2026-06-14T20:00:00Z', pairing: [0, 1] }, // NED vs JPN  4pm ET
    { id: 11, group: 'E', venue: 'philadelphia', dateTimeUtc: '2026-06-14T23:00:00Z', pairing: [2, 3] }, // CIV vs ECU  7pm ET
    { id: 12, group: 'F', venue: 'monterrey',    dateTimeUtc: '2026-06-15T02:00:00Z', pairing: [2, 3] }, // SWE vs TUN  10pm ET Jun14
    // June 15
    { id: 13, group: 'H', venue: 'atlanta',      dateTimeUtc: '2026-06-15T16:00:00Z', pairing: [0, 1] }, // ESP vs CPV  12pm ET
    { id: 14, group: 'G', venue: 'seattle',      dateTimeUtc: '2026-06-15T19:00:00Z', pairing: [0, 1] }, // BEL vs EGY  3pm ET
    { id: 15, group: 'H', venue: 'miami',        dateTimeUtc: '2026-06-15T22:00:00Z', pairing: [2, 3] }, // KSA vs URU  6pm ET
    { id: 16, group: 'G', venue: 'los angeles',  dateTimeUtc: '2026-06-16T01:00:00Z', pairing: [2, 3] }, // IRN vs NZL  9pm ET Jun15
    // June 16
    { id: 17, group: 'I', venue: 'new york',     dateTimeUtc: '2026-06-16T19:00:00Z', pairing: [0, 1] }, // FRA vs SEN  3pm ET
    { id: 18, group: 'I', venue: 'boston',       dateTimeUtc: '2026-06-16T22:00:00Z', pairing: [2, 3] }, // IRQ vs NOR  6pm ET
    { id: 19, group: 'J', venue: 'kansas',       dateTimeUtc: '2026-06-17T01:00:00Z', pairing: [0, 1] }, // ARG vs ALG  9pm ET Jun16
    { id: 20, group: 'J', venue: 'san francisco',dateTimeUtc: '2026-06-17T04:00:00Z', pairing: [2, 3] }, // AUT vs JOR  midnight ET Jun16
    // June 17
    { id: 21, group: 'K', venue: 'houston',      dateTimeUtc: '2026-06-17T17:00:00Z', pairing: [0, 1] }, // POR vs COD  1pm ET
    { id: 22, group: 'L', venue: 'dallas',       dateTimeUtc: '2026-06-17T20:00:00Z', pairing: [0, 1] }, // ENG vs CRO  4pm ET
    { id: 23, group: 'L', venue: 'toronto',      dateTimeUtc: '2026-06-17T23:00:00Z', pairing: [2, 3] }, // GHA vs PAN  7pm ET
    { id: 24, group: 'K', venue: 'azteca',       dateTimeUtc: '2026-06-18T02:00:00Z', pairing: [2, 3] }, // UZB vs COL  10pm ET Jun17

    // ── ROUND 2 ──────────────────────────────────────────────────────────────
    // June 18
    { id: 25, group: 'A', venue: 'atlanta',      dateTimeUtc: '2026-06-18T16:00:00Z', pairing: [3, 1] }, // CZE vs RSA  12pm ET
    { id: 26, group: 'B', venue: 'los angeles',  dateTimeUtc: '2026-06-18T19:00:00Z', pairing: [3, 1] }, // SUI vs BIH  3pm ET
    { id: 27, group: 'B', venue: 'vancouver',    dateTimeUtc: '2026-06-18T22:00:00Z', pairing: [0, 2] }, // CAN vs QAT  6pm ET
    { id: 28, group: 'A', venue: 'guadalajara',  dateTimeUtc: '2026-06-19T01:00:00Z', pairing: [0, 2] }, // MEX vs KOR  9pm ET Jun18
    // June 19
    { id: 29, group: 'D', venue: 'seattle',      dateTimeUtc: '2026-06-19T19:00:00Z', pairing: [0, 2] }, // USA vs AUS  3pm ET
    { id: 30, group: 'C', venue: 'boston',       dateTimeUtc: '2026-06-19T22:00:00Z', pairing: [3, 1] }, // SCO vs MAR  6pm ET
    { id: 31, group: 'C', venue: 'philadelphia', dateTimeUtc: '2026-06-20T01:00:00Z', pairing: [0, 2] }, // BRA vs HAI  9pm ET Jun19
    { id: 32, group: 'D', venue: 'san francisco',dateTimeUtc: '2026-06-20T04:00:00Z', pairing: [3, 1] }, // TUR vs PAR  midnight ET Jun19
    // June 20
    { id: 33, group: 'F', venue: 'houston',      dateTimeUtc: '2026-06-20T17:00:00Z', pairing: [0, 2] }, // NED vs SWE  1pm ET
    { id: 34, group: 'E', venue: 'toronto',      dateTimeUtc: '2026-06-20T20:00:00Z', pairing: [0, 2] }, // GER vs CIV  4pm ET
    { id: 35, group: 'E', venue: 'kansas',       dateTimeUtc: '2026-06-21T00:00:00Z', pairing: [3, 1] }, // ECU vs CUW  8pm ET Jun20
    { id: 36, group: 'F', venue: 'monterrey',    dateTimeUtc: '2026-06-21T04:00:00Z', pairing: [3, 1] }, // TUN vs JPN  midnight ET Jun20
    // June 21
    { id: 37, group: 'H', venue: 'atlanta',      dateTimeUtc: '2026-06-21T16:00:00Z', pairing: [0, 2] }, // ESP vs KSA  12pm ET
    { id: 38, group: 'G', venue: 'los angeles',  dateTimeUtc: '2026-06-21T19:00:00Z', pairing: [0, 2] }, // BEL vs IRN  3pm ET
    { id: 39, group: 'H', venue: 'miami',        dateTimeUtc: '2026-06-21T22:00:00Z', pairing: [3, 1] }, // URU vs CPV  6pm ET
    { id: 40, group: 'G', venue: 'vancouver',    dateTimeUtc: '2026-06-22T01:00:00Z', pairing: [3, 1] }, // NZL vs EGY  9pm ET Jun21
    // June 22
    { id: 41, group: 'J', venue: 'dallas',       dateTimeUtc: '2026-06-22T17:00:00Z', pairing: [0, 2] }, // ARG vs AUT  1pm ET
    { id: 42, group: 'I', venue: 'philadelphia', dateTimeUtc: '2026-06-22T21:00:00Z', pairing: [0, 2] }, // FRA vs IRQ  5pm ET
    { id: 43, group: 'I', venue: 'new york',     dateTimeUtc: '2026-06-23T00:00:00Z', pairing: [3, 1] }, // NOR vs SEN  8pm ET Jun22
    { id: 44, group: 'J', venue: 'san francisco',dateTimeUtc: '2026-06-23T03:00:00Z', pairing: [3, 1] }, // JOR vs ALG  11pm ET Jun22
    // June 23
    { id: 45, group: 'K', venue: 'houston',      dateTimeUtc: '2026-06-23T17:00:00Z', pairing: [0, 2] }, // POR vs UZB  1pm ET
    { id: 46, group: 'L', venue: 'boston',       dateTimeUtc: '2026-06-23T20:00:00Z', pairing: [0, 2] }, // ENG vs GHA  4pm ET
    { id: 47, group: 'L', venue: 'toronto',      dateTimeUtc: '2026-06-23T23:00:00Z', pairing: [3, 1] }, // PAN vs CRO  7pm ET
    { id: 48, group: 'K', venue: 'guadalajara',  dateTimeUtc: '2026-06-24T02:00:00Z', pairing: [3, 1] }, // COL vs COD  10pm ET Jun23

    // ── ROUND 3 (simultaneous within each group) ──────────────────────────────
    // June 24
    { id: 49, group: 'B', venue: 'vancouver',    dateTimeUtc: '2026-06-24T19:00:00Z', pairing: [3, 0] }, // SUI vs CAN  3pm ET
    { id: 50, group: 'B', venue: 'seattle',      dateTimeUtc: '2026-06-24T19:00:00Z', pairing: [1, 2] }, // BIH vs QAT  3pm ET
    { id: 51, group: 'C', venue: 'miami',        dateTimeUtc: '2026-06-24T22:00:00Z', pairing: [3, 0] }, // SCO vs BRA  6pm ET
    { id: 52, group: 'C', venue: 'atlanta',      dateTimeUtc: '2026-06-24T22:00:00Z', pairing: [1, 2] }, // MAR vs HAI  6pm ET
    { id: 53, group: 'A', venue: 'azteca',       dateTimeUtc: '2026-06-25T01:00:00Z', pairing: [3, 0] }, // CZE vs MEX  9pm ET Jun24
    { id: 54, group: 'A', venue: 'monterrey',    dateTimeUtc: '2026-06-25T01:00:00Z', pairing: [1, 2] }, // RSA vs KOR  9pm ET Jun24
    // June 25
    { id: 55, group: 'E', venue: 'new york',     dateTimeUtc: '2026-06-25T20:00:00Z', pairing: [3, 0] }, // ECU vs GER  4pm ET
    { id: 56, group: 'E', venue: 'philadelphia', dateTimeUtc: '2026-06-25T20:00:00Z', pairing: [1, 2] }, // CUW vs CIV  4pm ET
    { id: 57, group: 'F', venue: 'dallas',       dateTimeUtc: '2026-06-25T23:00:00Z', pairing: [1, 2] }, // JPN vs SWE  7pm ET
    { id: 58, group: 'F', venue: 'kansas',       dateTimeUtc: '2026-06-25T23:00:00Z', pairing: [3, 0] }, // TUN vs NED  7pm ET
    { id: 59, group: 'D', venue: 'los angeles',  dateTimeUtc: '2026-06-26T02:00:00Z', pairing: [3, 0] }, // TUR vs USA  10pm ET Jun25
    { id: 60, group: 'D', venue: 'san francisco',dateTimeUtc: '2026-06-26T02:00:00Z', pairing: [1, 2] }, // PAR vs AUS  10pm ET Jun25
    // June 26
    { id: 61, group: 'I', venue: 'boston',       dateTimeUtc: '2026-06-26T19:00:00Z', pairing: [3, 0] }, // NOR vs FRA  3pm ET
    { id: 62, group: 'I', venue: 'toronto',      dateTimeUtc: '2026-06-26T19:00:00Z', pairing: [1, 2] }, // SEN vs IRQ  3pm ET
    { id: 63, group: 'H', venue: 'houston',      dateTimeUtc: '2026-06-27T00:00:00Z', pairing: [1, 2] }, // CPV vs KSA  8pm ET Jun26
    { id: 64, group: 'H', venue: 'guadalajara',  dateTimeUtc: '2026-06-27T00:00:00Z', pairing: [3, 0] }, // URU vs ESP  8pm ET Jun26
    { id: 65, group: 'G', venue: 'seattle',      dateTimeUtc: '2026-06-27T03:00:00Z', pairing: [1, 2] }, // EGY vs IRN  11pm ET Jun26
    { id: 66, group: 'G', venue: 'vancouver',    dateTimeUtc: '2026-06-27T03:00:00Z', pairing: [3, 0] }, // NZL vs BEL  11pm ET Jun26
    // June 27
    { id: 67, group: 'L', venue: 'new york',     dateTimeUtc: '2026-06-27T21:00:00Z', pairing: [3, 0] }, // PAN vs ENG  5pm ET
    { id: 68, group: 'L', venue: 'philadelphia', dateTimeUtc: '2026-06-27T21:00:00Z', pairing: [1, 2] }, // CRO vs GHA  5pm ET
    { id: 69, group: 'K', venue: 'miami',        dateTimeUtc: '2026-06-27T23:30:00Z', pairing: [3, 0] }, // COL vs POR  7:30pm ET
    { id: 70, group: 'K', venue: 'atlanta',      dateTimeUtc: '2026-06-27T23:30:00Z', pairing: [1, 2] }, // COD vs UZB  7:30pm ET
    { id: 71, group: 'J', venue: 'kansas',       dateTimeUtc: '2026-06-28T02:00:00Z', pairing: [1, 2] }, // ALG vs AUT  10pm ET Jun27
    { id: 72, group: 'J', venue: 'dallas',       dateTimeUtc: '2026-06-28T02:00:00Z', pairing: [3, 0] }, // JOR vs ARG  10pm ET Jun27
];

// Helper to build a LocalizedString date from a UTC ISO string (uses UTC calendar date as fallback)
const utcToLocalizedDate = (iso: string): LocalizedString => {
    const d = new Date(iso);
    const day = d.getUTCDate();
    const month = d.getUTCMonth();
    const year = d.getUTCFullYear();
    const mEn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month];
    const mEs = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][month];
    return { en: `${mEn} ${day}, ${year}`, es: `${day} de ${mEs}, ${year}` };
};

export const generateGroupSchedule = (): Match[] => {
    return SCHEDULE_DATA.map(s => {
        const groupObj = GROUPS.find(g => g.id === s.group);
        if(!groupObj) throw new Error('Invalid Group');

        const homeId = groupObj.teams[s.pairing[0]];
        const awayId = groupObj.teams[s.pairing[1]];

        return {
            id: `M${s.id.toString().padStart(2, '0')}`, // M01, M02…
            homeTeamId: homeId,
            awayTeamId: awayId,
            homeScore: null,
            awayScore: null,
            isFinished: false,
            stage: 'Group',
            group: s.group,
            date: utcToLocalizedDate(s.dateTimeUtc),
            dateTimeUtc: s.dateTimeUtc,
            stadium: findStadium(s.venue)
        };
    });
};