export interface LocalizedString {
  en: string;
  es: string;
}

export interface Team {
  id: string;
  name: LocalizedString;
  code: string;
  flag: string; // URL to flag image
  rating: number; // 1-100 for AI simulation baseline
  confederation: string;
}

export interface Stadium {
  name: string;
  city: LocalizedString;
  country: LocalizedString;
}

export interface Match {
  id: string;
  homeTeamId: string | null; // Null if TBD (knockouts)
  awayTeamId: string | null; // Null if TBD
  homeScore: number | null;
  awayScore: number | null;
  isFinished: boolean;
  stage: 'Group' | 'Round of 32' | 'Round of 16' | 'Quarter-Final' | 'Semi-Final' | 'Final' | 'Third Place';
  group?: string; // Only for group stage (e.g., "A")
  date: LocalizedString; // Formatted date string
  time?: string; // Match time (e.g. "13:00")
  stadium: Stadium;
  commentary?: string;
  winnerId?: string | null; // For knockouts
}

export interface Group {
  id: string; // "A", "B", etc.
  teams: string[]; // Team IDs
}

export interface GroupStanding {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number; // Goals For
  ga: number; // Goals Against
  gd: number; // Goal Difference
  points: number;
}