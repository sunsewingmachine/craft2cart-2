# Changes in this version (31 Aug 2026)

## Bug fixes
1. **Sell flow crash fixed** — App.tsx passed `detectedTitle` to AICheckScreen which expects `detectedName`; the app went blank after "Use This Photo". 
2. **Spoken price now saved** — the final voice answer (price) was ignored due to stale React state; the fresh value is now passed to `onComplete`.
3. **Edit Product save fixed** — price input had `step="10" min="1"`, which blocked saving any round price (600, 700, 1200...). Now `step="1"`.
4. **"SELL EVERYWHERE" button visible on mobile** — it was hidden behind the bottom navigation bar.
5. **Fair application checkbox enforced** — "SEND APPLICATION" is disabled until you agree to the guidelines.
6. Added `@types/react` / `@types/react-dom` so `npm run lint` actually checks component props.

## New feature: language modes (Hindi replaced)
- **EN** — English only, everywhere (labels, buttons, speech, voice input)
- **தமிழ்** — Tamil only, everywhere
- **த·EN** — Tamil and English together ("தமிழ் · English"); speech plays in Tamil
- Switch from the top bar. All screens updated: Home, Photo, AI Check, Voice Q&A,
  Product Ready, Sell Everywhere, channel modals, My Products, Buyers, Help,
  Profile, Edit Product, Govt Fair flow.

## How to run
npm install
npm run dev        # development on http://localhost:3000
npm run build && npm start   # production
