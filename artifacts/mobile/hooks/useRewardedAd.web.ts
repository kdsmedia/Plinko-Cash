// Web stub — AdMob is native-only
import { useCallback } from 'react';

export function useRewardedAd() {
  const preload = useCallback(() => {}, []);
  const showAd = useCallback((onRewarded: () => void) => {
    // On web: reward immediately
    onRewarded();
  }, []);
  return { preload, showAd };
}
