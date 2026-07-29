# Plinko Cash

Game mobile hiburan di mana pemain menjatuhkan bola ke papan Plinko untuk mengumpulkan POIN, lalu menukar POIN ke Rupiah via DANA.

## Run & Operate

- `pnpm --filter @workspace/mobile run start` — start Expo dev server (mobile preview)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (React Native) — `artifacts/mobile`
- API: Express 5 — `artifacts/api-server`
- DB: PostgreSQL + Drizzle ORM — `lib/db`
- AdMob: `react-native-google-mobile-ads`

## App Identity

- **App Name:** Plinko Cash
- **Package:** `com.altomedia.plinkocash`
- **Developer:** ALTOMEDIA
- **AdMob App ID:** `ca-app-pub-6881903056221433~3983256819`
- **Banner Unit:** `ca-app-pub-6881903056221433/5160607111`
- **Rewarded Unit:** `ca-app-pub-6881903056221433/6525779813`

## Where things live

- `artifacts/mobile/` — Expo mobile app (main game)
- `artifacts/mobile/contexts/GameContext.tsx` — all game state + daily ball logic
- `artifacts/mobile/utils/storage.ts` — AsyncStorage persistence + `DAILY_BALL_QUOTA`
- `artifacts/mobile/constants/plinkoHtml.ts` — Plinko physics WebView HTML
- `artifacts/mobile/components/modals/` — all modal screens
- `artifacts/mobile/hooks/useRewardedAd.ts` — AdMob rewarded ad hook (native)
- `artifacts/mobile/hooks/useRewardedAd.web.ts` — web stub (rewards immediately)
- `artifacts/mobile/google-services.json` — Firebase config for Android AdMob

## Architecture decisions

- **POIN system:** All in-game earnings are POIN stored in `cash` state. Withdrawal converts 1000 POIN = Rp10 (rate = 0.01).
- **Daily ball quota = 10:** On each new calendar day, `ballsCount` resets to 10. Tracked via `lastBallResetDate` in stats.
- **Ad reward on ALL claim/bonus buttons:** DailyRewardModal, SpinWheelModal, AdRewardModal, WithdrawModal all call `showAd()` before granting reward/processing.
- **Plinko physics in WebView:** Physics runs inside `react-native-webview`. Drop triggered by `dropTrigger` counter → `injectJavaScript("window.dropBall(...)")`. Results sent back via `postMessage`.
- **AdMob lazy-load:** `react-native-google-mobile-ads` is `require()`d inside try/catch so it doesn't crash in Expo Go. Web stubs exist for web bundler.
- **Daily Bonus cooldown:** 24-hour cooldown enforced in `DailyRewardModal`. `lastDailyBonus` timestamp stored in stats.

## Gotchas

- `android.googleServicesFile` must be present in `app.json` for AdMob to work on Android builds.
- AdMob requires a native build (`eas build`) — does NOT work in Expo Go.
- WebView shows "not supported" in browser preview — expected; works on device.
- `@babel/runtime` must be installed as a dependency for EAS builds.

## User preferences

- Language: Indonesian (id) by default
- All text supports both Indonesian and English

## Build APK

```bash
cd artifacts/mobile
npx eas build --platform android --profile production
```
