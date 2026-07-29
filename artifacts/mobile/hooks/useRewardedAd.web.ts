// Web stub — AdMob is native-only
import { useCallback } from 'react';

export function useRewardedAd() {
  const preload = useCallback(() => {}, []);
  const showAd = useCallback((onRewarded: () => void, _onCancelled?: () => void) => {
    // On web: reward immediately (no ad shown)
    onRewarded();
  }, []);
  return { preload, showAd };
}
