# Craft2Cart

An app that lets an artisan photograph a handmade product, answer a few spoken
questions, and end up with a marketplace listing — a title, a description, tags
and a fair price — in Tamil, English, or both. Built for SIH problem statement
26090 (AI-assisted cataloging and market linkage for artisans).

## How to run

```bash
npm install
npm run dev
```

The dev server runs on <http://localhost:3000> — one Express process that serves
the API and proxies the React app through Vite in middleware mode. For a
production run: `npm run build && npm start`. `npm run lint` is `tsc --noEmit`.

Secrets live in `.env.local`; `.env.example` lists the names, never the values.

## How it is put together

```
UI (src/components/**)
  → client data layer (src/services/**)
    → HTTP (/api/**)
      → server routes (server/**)
        → Gemini / Firebase
```

- **`server/gemini.ts`** — the only place the app talks to Gemini. Holds the
  catalog prompt, the JSON response schema, and a chain of model ids that it
  walks until one answers, because free-tier models go 503 under load and Google
  retires ids without notice. The API key never leaves the server.
- **`server/catalogRoutes.ts`** — `POST /api/catalog/analyze` (photo in, draft
  listing out) and `GET /api/catalog/status`.
- **`src/services/catalogService.ts`** — the client side of the same thing.
  Never throws: if the network or the model is down it returns the caller's demo
  values marked `source: 'fallback'`, so a dead connection cannot blank out the
  sell flow mid-demonstration.
- **`src/services/authService.ts`** — Google popup and phone OTP sign-in, with
  Firebase's error codes mapped onto a small set the UI can explain in plain
  words.
- **`src/services/mediaService.ts` / `artisanStore.ts`** — photo upload to
  Firebase Storage and the artisan's own product records.
- **`src/components/language/LanguageDialog.tsx`** — the single language chooser
  (English / தமிழ் / both), shared by the sign-in wall and the top bar.

## Photo gatekeeping — work from commit `ac14590`

`ac14590` ("Reject non-product photos with a real Gemini vision check", primeirfu,
1 Sep 2026) was written in parallel with the cataloging work above and is recorded
here so nothing about it is lost. What it did:

- **The problem it found.** The AI check screen was hardcoded — every uploaded
  photo became "Handmade Artisan Craft". A selfie or a screenshot passed straight
  through into a listing. The Gemini SDK and the API key were both present in the
  project and nothing ever called them.
- **`POST /api/analyze-photo`** in `server.ts`: sends the photo to
  `gemini-3.5-flash-lite` behind a JSON response schema
  (`isProduct`, `productName`, `material`, `reason`, `reasonTa`) at
  `temperature: 0` and minimal thinking, so the verdict comes back in a couple of
  seconds instead of ~17. Express's JSON limit raised to 15mb for base64 photos.
- **`src/utils/analyzePhoto.ts`**: shrinks the frame to a 512px JPEG before
  posting, and turns the reply into one of three verdicts — `product`,
  `not-product`, `unavailable`.
- **In the UI**: "Use This Photo" waits for the verdict. A rejected photo shows an
  *Invalid photo* card with the reason in Tamil and English and offers only
  *Retake*; an accepted photo carries Gemini's detected name and material into the
  AI check screen. New strings in `src/data/translations.ts`
  (`checkingPhoto`, `invalidPhotoTitle`, `invalidPhotoBody`, `checkUnavailable`,
  `continueAnyway`).
- **Its judgement call**: infrastructure failures (missing key, offline) warn but
  let the seller continue. Only a genuine "not a product" verdict blocks the flow.

### How it works here now

The gatekeeping is kept, rebuilt on the layered pipeline above. The difference is
that it is **not a second vision call**: the one catalog request in
`server/gemini.ts` now also returns `isProduct`, `rejectReason` and
`rejectReasonTamil`, so a photo is never sent to the model twice and a valid
product is catalogued and cleared in the same round trip.

When the verdict is false, `AICheckScreen` replaces the whole confirm flow with an
*This is not a product photo* card carrying Gemini's own reason in the artisan's
language, and the only control is *Take another photo* — there is nothing to
confirm or correct on a photo of a wall.

Two guards keep it from locking anyone out:

- Only an **explicit** `isProduct: false` from a real AI answer rejects. A
  fallback draft — no key, offline, a timed-out model — is always marked
  `isProduct: true`, so a flat network can never accuse an artisan of
  photographing the wrong thing.
- A missing or malformed field is read as "product". The failure direction is
  always towards letting the sale through.

Verify it against the live model with the reusable script:

```bash
node scripts/test-api-analyze.mjs http://localhost:3000 <image-url>
```

Measured 1 Sep 2026 on `gemini-3.5-flash`: a jute tote came back
`isProduct: true` in 21s (cold), a photo of a person came back `isProduct: false`
in 7s with the reason in both Tamil and English.

## Deploying (Vercel)

The production deployment is **not** this Express server. Vercel builds the Vite
bundle and serves `dist/` from the CDN, so `server.ts` never runs there. `/api`
is served instead by the serverless functions in `api/**`.

Both transports are thin wrappers over `server/catalogHandlers.ts`, which holds
the actual rules — what counts as a valid photo, the size ceiling, what a failure
looks like. Add an endpoint in one place and wire it in both, or the two
environments drift and the difference only shows up in production.

Watch for the failure this arrangement had: with no `api/**` the deployed app
answered 404 to every AI call, and because `catalogService` is built never to
throw, it looked like it was working — it had quietly dropped to demo values.
`curl https://<deployment>/api/health` is the honest check.

### Environment variables on the host

These must be set in the Vercel project, not just in `.env.local`:

| Variable | Needed for |
| --- | --- |
| `GEMINI_API_KEY` | The AI cataloging and the photo gatekeeper. Server-side only. |
| `VITE_FIREBASE_*` (7 of them) | Sign-in, cloud storage, Firestore. |

The `VITE_*` ones are inlined by Vite **at build time**, so changing them needs a
redeploy, not just a restart. When they are absent the app is not broken — it
starts in demo mode with no login wall and local-only storage, which is exactly
what a missing variable looks like from the outside.

## Roadmap

- [x] Real Gemini cataloging behind `/api/catalog/analyze`
- [x] Firebase sign-in: Google and phone OTP
- [x] Photo upload to Firebase Storage, products in Firestore
- [x] Three language modes across every screen
- [x] Reject non-product photos before they become a listing
- [ ] Set `GEMINI_API_KEY` and `VITE_FIREBASE_*` on Vercel so production leaves demo mode
- [ ] One verified end-to-end pass: Gemini → Storage upload → Firestore write
- [ ] Real marketplace linkage (ONDC and friends) instead of the demo channel cards
