export type Position = 'QB' | 'RB' | 'WR' | 'TE';

export interface PassingStats {
  completions: number;
  attempts: number;
  yards: number;
  touchdowns: number;
  interceptions: number;
}

export interface RushingStats {
  attempts: number;
  yards: number;
  touchdowns: number;
  fumbles: number;
}

export interface ReceivingStats {
  targets: number;
  receptions: number;
  yards: number;
  touchdowns: number;
}

export interface PlayerStats {
  gamesPlayed: number;
  points: number;
  pointsPerGame: number;
  passing?: PassingStats;
  rushing?: RushingStats;
  receiving?: ReceivingStats;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  position: Position;
  stats2024: PlayerStats;
  projectedPoints: number;
  vbdScore: number;
  adp?: number;
  isDrafted: boolean;
  draftedBy?: number;
  draftPick?: number;
}

export interface DraftSettings {
  leagueSize: 10 | 12;
  scoringSettings: ScoringSettings;
}

export interface ScoringSettings {
  passing: {
    yardsPerPoint: number;
    tdPoints: number;
    intPoints: number;
    bonus300: number;
    bonus400: number;
  };
  rushing: {
    yardsPerPoint: number;
    tdPoints: number;
    bonus100: number;
    bonus200: number;
  };
  receiving: {
    receptionPoints: number;
    wrReceptionBonus: number;
    teReceptionBonus: number;
    yardsPerPoint: number;
    tdPoints: number;
    bonus100: number;
    bonus200: number;
  };
  misc: {
    twoPointConversion: number;
    fumbleLost: number;
    fumbleRecoveryTd: number;
  };
}