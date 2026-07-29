export type RiskLevel = 'low' | 'medium' | 'high';
export type BallType = 'standard' | 'golden' | 'splitter' | 'bomb' | 'magnet';

export interface HistoryRecord {
  id: string;
  timestamp: number;
  bet: number;
  multiplier: number;
  payout: number;
  ballType: BallType;
  risk: RiskLevel;
  rows: number;
}

export interface PlayerStats {
  totalDrops: number;
  totalSpent: number;
  totalEarned: number;
  highestMultiplier: number;
  highestSingleWin: number;
  stagesCompleted: number;
  goldenPegsHit: number;
  lastDailyBonus: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  language: 'id' | 'en';
  autoDropSpeed: number;
}
