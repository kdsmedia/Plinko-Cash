import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayerStats, GameSettings, HistoryRecord } from '@/types/game';

const KEYS = {
  CASH: 'plinko_cash_balance',
  BALLS: 'plinko_balls_count',
  STATS: 'plinko_player_stats',
  SETTINGS: 'plinko_game_settings',
  HISTORY: 'plinko_drop_history',
};

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  language: 'id',
  autoDropSpeed: 400,
};

const DEFAULT_STATS: PlayerStats = {
  totalDrops: 0,
  totalSpent: 0,
  totalEarned: 0,
  highestMultiplier: 0,
  highestSingleWin: 0,
  stagesCompleted: 0,
  goldenPegsHit: 0,
  lastDailyBonus: 0,
};

export const storage = {
  getCash: async (): Promise<number> => {
    try {
      const val = await AsyncStorage.getItem(KEYS.CASH);
      return val !== null ? parseFloat(val) : 5000;
    } catch { return 5000; }
  },
  setCash: async (amount: number): Promise<void> => {
    try { await AsyncStorage.setItem(KEYS.CASH, amount.toString()); } catch {}
  },
  getBalls: async (): Promise<number> => {
    try {
      const val = await AsyncStorage.getItem(KEYS.BALLS);
      return val !== null ? parseInt(val, 10) : 30;
    } catch { return 30; }
  },
  setBalls: async (count: number): Promise<void> => {
    try { await AsyncStorage.setItem(KEYS.BALLS, count.toString()); } catch {}
  },
  getSettings: async (): Promise<GameSettings> => {
    try {
      const val = await AsyncStorage.getItem(KEYS.SETTINGS);
      return val ? { ...DEFAULT_SETTINGS, ...JSON.parse(val) } : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  },
  saveSettings: async (settings: GameSettings): Promise<void> => {
    try { await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings)); } catch {}
  },
  getStats: async (): Promise<PlayerStats> => {
    try {
      const val = await AsyncStorage.getItem(KEYS.STATS);
      return val ? { ...DEFAULT_STATS, ...JSON.parse(val) } : DEFAULT_STATS;
    } catch { return DEFAULT_STATS; }
  },
  saveStats: async (stats: PlayerStats): Promise<void> => {
    try { await AsyncStorage.setItem(KEYS.STATS, JSON.stringify(stats)); } catch {}
  },
  getHistory: async (): Promise<HistoryRecord[]> => {
    try {
      const val = await AsyncStorage.getItem(KEYS.HISTORY);
      return val ? JSON.parse(val) : [];
    } catch { return []; }
  },
  addHistory: async (record: HistoryRecord): Promise<void> => {
    try {
      const history = await storage.getHistory();
      history.unshift(record);
      if (history.length > 50) history.pop();
      await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
    } catch {}
  },
  resetData: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([KEYS.CASH, KEYS.BALLS, KEYS.STATS, KEYS.HISTORY]);
    } catch {}
  },
};
