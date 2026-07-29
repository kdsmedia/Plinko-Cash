import { useCallback, useRef } from 'react';

const REWARDED_UNIT_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/5224354917'
  : 'ca-app-pub-6881903056221433/6525779813';

// Lazy-load AdMob to avoid crash in Expo Go
let RewardedAd: any = null;
let RewardedAdEventType: any = null;

try {
  const ads = require('react-native-google-mobile-ads');
  RewardedAd = ads.RewardedAd;
  RewardedAdEventType = ads.RewardedAdEventType;
} catch {}

export function useRewardedAd() {
  const adRef = useRef<any>(null);
  const loadedRef = useRef(false);
  const listenersRef = useRef<(() => void)[]>([]);

  const preload = useCallback(() => {
    if (!RewardedAd) return;
    try {
      const ad = RewardedAd.createForAdRequest(REWARDED_UNIT_ID, {
        requestNonPersonalizedAdsOnly: false,
      });
      adRef.current = ad;
      loadedRef.current = false;

      const unsub1 = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        loadedRef.current = true;
      });
      const unsub2 = ad.addAdEventListener(RewardedAdEventType.ERROR, () => {
        loadedRef.current = false;
      });
      listenersRef.current = [unsub1, unsub2];
      ad.load();
    } catch {}
  }, []);

  /**
   * Show rewarded ad, then call onRewarded.
   * Falls back to calling onRewarded immediately if AdMob is unavailable (Expo Go).
   */
  const showAd = useCallback(
    (onRewarded: () => void) => {
      if (!RewardedAd || !adRef.current || !loadedRef.current) {
        // No native ads — reward immediately (Expo Go / dev without native build)
        onRewarded();
        preload();
        return;
      }
      try {
        const ad = adRef.current;
        const unsubReward = ad.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          () => {
            onRewarded();
          }
        );
        const unsubClose = ad.addAdEventListener(
          RewardedAdEventType.CLOSED,
          () => {
            unsubReward();
            unsubClose();
            loadedRef.current = false;
            preload();
          }
        );
        ad.show();
      } catch {
        onRewarded();
        preload();
      }
    },
    [preload]
  );

  return { preload, showAd };
}
