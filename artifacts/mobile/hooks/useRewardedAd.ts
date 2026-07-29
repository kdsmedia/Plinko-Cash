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

  const preload = useCallback(() => {
    if (!RewardedAd) return;
    try {
      const ad = RewardedAd.createForAdRequest(REWARDED_UNIT_ID, {
        requestNonPersonalizedAdsOnly: false,
      });
      adRef.current = ad;
      loadedRef.current = false;

      ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        loadedRef.current = true;
      });
      ad.addAdEventListener(RewardedAdEventType.ERROR, () => {
        loadedRef.current = false;
      });
      ad.load();
    } catch {}
  }, []);

  /**
   * Show rewarded ad.
   * - onRewarded: called when user completes the ad and earns reward.
   * - onCancelled: called when user closes ad early OR ad fails — always
   *   resolves so callers are never stuck in a loading state.
   * Falls back to calling onRewarded immediately if AdMob unavailable (Expo Go).
   */
  const showAd = useCallback(
    (onRewarded: () => void, onCancelled?: () => void) => {
      if (!RewardedAd || !adRef.current || !loadedRef.current) {
        // No native ads — reward immediately (Expo Go / dev without native build)
        onRewarded();
        preload();
        return;
      }
      try {
        const ad = adRef.current;
        let rewarded = false;

        const unsubReward = ad.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          () => {
            rewarded = true;
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
            // If ad closed without reward (dismissed early), call onCancelled
            if (!rewarded) {
              onCancelled?.();
            }
          }
        );
        ad.show();
      } catch {
        // Ad show failed — treat as cancelled so UI resets cleanly
        onCancelled?.();
        preload();
      }
    },
    [preload]
  );

  return { preload, showAd };
}
