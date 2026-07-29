---
name: Plinko Cash App Architecture
description: Key decisions for the Plinko Cash Expo mobile app in artifacts/mobile
---

# Plinko Cash — Key Decisions

## Identity
- App name: Plinko Cash | Developer: ALTOMEDIA
- Package: `com.altomedia.plinkocash` (android.package + ios.bundleIdentifier in app.json)
- AdMob App ID: `ca-app-pub-6881903056221433~3983256819`
- Banner unit: `ca-app-pub-6881903056221433/5160607111`
- Rewarded unit: `ca-app-pub-6881903056221433/6525779813`

## Currency: POIN (not cash/Rp)
- All in-game earnings are POIN stored in `cash` state variable
- Withdrawal converts: 1000 POIN = Rp10 (rate = 0.01)
- Header shows "POIN" label, WithdrawModal shows Rp equivalent

## Physics Board
- Plinko physics runs inside a `react-native-webview` WebView (see `constants/plinkoHtml.ts`)
- Drop triggered by `dropTrigger` counter in GameContext → `injectJavaScript("window.dropBall(...)")` in PlinkoBoard
- Results sent back via `window.ReactNativeWebView.postMessage(JSON.stringify({type:"BALL_LANDED",...}))`
- **WebView shows "not supported" in browser preview — this is expected, works on mobile**

## AdMob
- `react-native-google-mobile-ads` requires native build (not Expo Go)
- Platform-specific files handle graceful fallback:
  - `BannerAdBlock.web.tsx` — stub for web bundler
  - `hooks/useRewardedAd.web.ts` — rewards immediately on web
  - `BannerAdBlock.tsx` + `hooks/useRewardedAd.ts` — lazy require() for native
- Rewarded ad fires on ALL claim/bonus buttons: DailyRewardModal, SpinWheelModal, AdRewardModal exchange
- Banner ad sits between PlinkoBoard and drop buttons in ControlPanel

## APK Build Notes
- `android.googleServicesFile` must NOT be in app.json unless the actual file exists (causes config parse error)
- `@babel/runtime` must be installed as a dependency
- `expo-glass-effect` / `isLiquidGlassAvailable` removed from _layout — caused web bundler crash
- `KeyboardProvider` from `react-native-keyboard-controller` not needed for game — removed

**Why:** These were all discovered via build errors and fixed to make `eas build --platform android` viable.
