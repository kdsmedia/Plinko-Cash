import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import * as Haptics from 'expo-haptics';
import { storage } from '@/utils/storage';
import { GameSettings, PlayerStats, HistoryRecord, BallType } from '@/types/game';

interface GameContextType {
  cash: number;
  ballsCount: number;
  settings: GameSettings;
  stats: PlayerStats;
  history: HistoryRecord[];
  isAutoDropping: boolean;
  dropTrigger: number;
  isLoaded: boolean;
  // Modal visibility
  isDailyOpen: boolean;
  isInfoOpen: boolean;
  isSpinWheelOpen: boolean;
  isWithdrawOpen: boolean;
  isAdRewardOpen: boolean;
  setSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  setIsAutoDropping: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDailyOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsInfoOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSpinWheelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsWithdrawOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAdRewardOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleDropBall: () => void;
  handleBallLanded: (payout: number, multiplier: number, ballType: BallType, goldenPegsHit: number) => void;
  handleClaimDaily: (amount: number) => void;
  handleWinSpinWheel: (type: 'cash' | 'balls', value: number) => void;
  handleWithdraw: (amount: number) => void;
  handleClaimAdBalls: (count: number) => void;
  handleExchangePoints: (pointsDeducted: number, ballsGained: number) => void;
  handleResetData: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [cash, setCash] = useState(5000);
  const [ballsCount, setBallsCount] = useState(30);
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    language: 'id',
    autoDropSpeed: 400,
  });
  const [stats, setStats] = useState<PlayerStats>({
    totalDrops: 0,
    totalSpent: 0,
    totalEarned: 0,
    highestMultiplier: 0,
    highestSingleWin: 0,
    stagesCompleted: 0,
    goldenPegsHit: 0,
    lastDailyBonus: 0,
  });
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [isAutoDropping, setIsAutoDropping] = useState(false);
  const [dropTrigger, setDropTrigger] = useState(0);
  // Modals
  const [isDailyOpen, setIsDailyOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isSpinWheelOpen, setIsSpinWheelOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isAdRewardOpen, setIsAdRewardOpen] = useState(false);

  // Load persisted data on mount
  useEffect(() => {
    (async () => {
      const [c, b, s, st, h] = await Promise.all([
        storage.getCash(),
        storage.getBalls(),
        storage.getSettings(),
        storage.getStats(),
        storage.getHistory(),
      ]);
      setCash(c);
      setBallsCount(b);
      setSettings(s);
      setStats(st);
      setHistory(h);
      setIsLoaded(true);
    })();
  }, []);

  // Persist cash
  useEffect(() => { if (isLoaded) storage.setCash(cash); }, [cash, isLoaded]);
  // Persist balls
  useEffect(() => { if (isLoaded) storage.setBalls(ballsCount); }, [ballsCount, isLoaded]);
  // Persist settings
  useEffect(() => { if (isLoaded) storage.saveSettings(settings); }, [settings, isLoaded]);
  // Persist stats
  useEffect(() => { if (isLoaded) storage.saveStats(stats); }, [stats, isLoaded]);

  const handleDropBall = useCallback(() => {
    if (ballsCount <= 0) {
      setIsAutoDropping(false);
      setIsAdRewardOpen(true);
      return;
    }
    setBallsCount((prev) => Math.max(0, prev - 1));
    setDropTrigger((prev) => prev + 1);
    setStats((prev) => ({ ...prev, totalDrops: prev.totalDrops + 1 }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [ballsCount]);

  const handleBallLanded = useCallback(
    (payout: number, multiplier: number, ballType: BallType, goldenPegsHit: number) => {
      setCash((prev) => prev + payout);
      const record: HistoryRecord = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        timestamp: Date.now(),
        bet: 1,
        multiplier,
        payout,
        ballType,
        risk: 'high',
        rows: 20,
      };
      storage.addHistory(record);
      setHistory((prev) => [record, ...prev.slice(0, 49)]);
      setStats((prev) => ({
        ...prev,
        totalEarned: prev.totalEarned + payout,
        highestMultiplier: Math.max(prev.highestMultiplier, multiplier),
        highestSingleWin: Math.max(prev.highestSingleWin, payout),
        goldenPegsHit: prev.goldenPegsHit + goldenPegsHit,
      }));
      if (multiplier >= 25) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
    []
  );

  const handleClaimDaily = useCallback((amount: number) => {
    setCash((prev) => prev + amount);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleWinSpinWheel = useCallback((type: 'cash' | 'balls', value: number) => {
    if (type === 'cash') setCash((prev) => prev + value);
    else setBallsCount((prev) => prev + value);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleWithdraw = useCallback((amount: number) => {
    setCash((prev) => Math.max(0, prev - amount));
  }, []);

  const handleClaimAdBalls = useCallback((count: number) => {
    setBallsCount((prev) => prev + count);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleExchangePoints = useCallback((pointsDeducted: number, ballsGained: number) => {
    setCash((prev) => Math.max(0, prev - pointsDeducted));
    setBallsCount((prev) => prev + ballsGained);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleResetData = useCallback(async () => {
    await storage.resetData();
    setCash(5000);
    setBallsCount(30);
    setStats({
      totalDrops: 0, totalSpent: 0, totalEarned: 0,
      highestMultiplier: 0, highestSingleWin: 0, stagesCompleted: 0,
      goldenPegsHit: 0, lastDailyBonus: 0,
    });
    setHistory([]);
  }, []);

  return (
    <GameContext.Provider
      value={{
        cash, ballsCount, settings, stats, history,
        isAutoDropping, dropTrigger, isLoaded,
        isDailyOpen, isInfoOpen, isSpinWheelOpen, isWithdrawOpen, isAdRewardOpen,
        setSettings, setIsAutoDropping,
        setIsDailyOpen, setIsInfoOpen, setIsSpinWheelOpen, setIsWithdrawOpen, setIsAdRewardOpen,
        handleDropBall, handleBallLanded, handleClaimDaily,
        handleWinSpinWheel, handleWithdraw, handleClaimAdBalls,
        handleExchangePoints, handleResetData,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
