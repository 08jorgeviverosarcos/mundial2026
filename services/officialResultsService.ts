/// <reference types="vite/client" />

export interface OfficialResult {
  matchId: string;
  homeScore: number;
  awayScore: number;
  penaltyWinner?: string; // código de equipo de 3 letras (ej: 'ARG')
}

const CSV_URL = import.meta.env.VITE_OFFICIAL_RESULTS_CSV_URL as string | undefined;

function parseCSV(raw: string): OfficialResult[] {
  const lines = raw.trim().split('\n');
  const results: OfficialResult[] = [];

  for (let i = 1; i < lines.length; i++) { // skip header row
    const cols = lines[i].split(',');
    const matchId = cols[0]?.trim();
    const rawHome  = cols[1]?.trim();
    const rawAway  = cols[2]?.trim();
    const rawPen   = cols[3]?.trim();

    // Solo incluir si ambos scores son números válidos (incluyendo 0)
    if (
      matchId &&
      rawHome !== '' && rawHome !== undefined &&
      rawAway !== '' && rawAway !== undefined &&
      !isNaN(Number(rawHome)) && !isNaN(Number(rawAway))
    ) {
      results.push({
        matchId,
        homeScore: Number(rawHome),
        awayScore: Number(rawAway),
        penaltyWinner: rawPen || undefined,
      });
    }
  }
  return results;
}

export async function fetchOfficialResults(): Promise<Map<string, OfficialResult>> {
  const map = new Map<string, OfficialResult>();
  if (!CSV_URL) return map;

  try {
    const response = await fetch(CSV_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    parseCSV(text).forEach(r => map.set(r.matchId, r));
  } catch (e) {
    console.warn('[OfficialResults] No se pudo cargar el CSV. La app sigue funcionando sin bloqueos.', e);
  }

  return map;
}
