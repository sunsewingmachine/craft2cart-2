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

The gatekeeping idea is kept. It is being rebuilt on the layered pipeline above —
one Gemini call in `server/gemini.ts` that both catalogs the item *and* returns
the verdict — rather than as a second, separate vision call, so a photo is not
sent to the model twice.

## Roadmap

- [x] Real Gemini cataloging behind `/api/catalog/analyze`
- [x] Firebase sign-in: Google and phone OTP
- [x] Photo upload to Firebase Storage, products in Firestore
- [x] Three language modes across every screen
- [ ] Reject non-product photos before they become a listing
- [ ] One verified end-to-end pass: Gemini → Storage upload → Firestore write
- [ ] Real marketplace linkage (ONDC and friends) instead of the demo channel cards
