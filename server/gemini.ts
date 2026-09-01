import { GoogleGenAI, Type } from '@google/genai';

// Single choke point for every Gemini call the server makes (global rule: one
// adapter per concern, selected by env, never scattered across call sites).
// The API key never reaches the browser — the client posts a photo to
// /api/catalog/analyze and this module talks to Google on its behalf.
// Model is env-overridable so a retired id is a config change, not a code change;
// scripts/check-gemini.mjs proves a candidate id still accepts images + JSON.

// Model chain, best first. One id is not enough in practice: on the free tier
// a busy alias answers 503 "high demand" for minutes at a time, and Google
// retires ids without warning (gemini-2.5-flash now 404s for new users). So the
// call walks the chain and uses whichever model is actually up.
// GEMINI_MODEL, when set, is tried first and the rest stay as the safety net.
// Check what is live right now with: node scripts/check-gemini.mjs --all
const FALLBACK_MODELS = ['gemini-flash-latest', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-3.6-flash'];

const MODEL_CHAIN: string[] = [
  ...new Set([...(process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : []), ...FALLBACK_MODELS])
];

const MODEL = MODEL_CHAIN[0];

/**
 * The model that answered the most recent successful call. Tried first next
 * time: during an outage the lead models each burn a full attempt timeout, and
 * without this every photo would pay that same dead time over again.
 */
let lastUsedModel = MODEL;

/** The chain to walk right now — whatever last worked, then the rest in order. */
const currentChain = (): string[] => [...new Set([lastUsedModel, ...MODEL_CHAIN])];

let client: GoogleGenAI | null = null;

/** Null when GEMINI_API_KEY is absent — callers fall back to demo data. */
function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

export const isGeminiConfigured = (): boolean => Boolean(process.env.GEMINI_API_KEY);

/** The catalog fields Gemini fills in from a single product photo. */
export interface CatalogDraft {
  /** False when the photo shows no sellable item — a selfie, a screenshot, a wall. */
  isProduct: boolean;
  /** Why it was rejected, in the seller's own words. Empty when isProduct is true. */
  rejectReason: string;
  rejectReasonTamil: string;
  name: string;
  nameTamil: string;
  category: string;
  material: string;
  description: string;
  descriptionTamil: string;
  tags: string[];
  suggestedPriceMin: number;
  suggestedPriceMax: number;
  priceReason: string;
  isLikelyHandmade: boolean;
  confidence: 'high' | 'medium' | 'low';
  photoTip: string;
}

const CATALOG_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    isProduct: {
      type: Type.BOOLEAN,
      description: 'True only if the photo shows a physical item an artisan could actually sell.'
    },
    rejectReason: {
      type: Type.STRING,
      description:
        'When isProduct is false: one short English sentence (max 14 words) saying what you actually see, addressed to the seller. Empty string otherwise.'
    },
    rejectReasonTamil: { type: Type.STRING, description: 'The same sentence in Tamil. Empty string otherwise.' },
    name: {
      type: Type.STRING,
      description: 'Short marketplace product title in English, 3-6 words, no brand names.'
    },
    nameTamil: { type: Type.STRING, description: 'The same title written in Tamil script.' },
    category: {
      type: Type.STRING,
      description: 'Marketplace category, e.g. "Home Decor", "Bags & Baskets", "Handloom Textiles".'
    },
    material: {
      type: Type.STRING,
      description: 'Main visible material, e.g. "Jute", "Terracotta clay", "Palm leaf".'
    },
    description: {
      type: Type.STRING,
      description: 'Two to three warm sentences a buyer would read on a listing. Mention craft technique and use.'
    },
    descriptionTamil: { type: Type.STRING, description: 'The same description written in Tamil script.' },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '4-6 lowercase search keywords buyers would type.'
    },
    suggestedPriceMin: { type: Type.NUMBER, description: 'Lower end of a fair retail price in Indian rupees.' },
    suggestedPriceMax: { type: Type.NUMBER, description: 'Upper end of a fair retail price in Indian rupees.' },
    priceReason: {
      type: Type.STRING,
      description: 'One short sentence explaining the price range in plain words an artisan understands.'
    },
    isLikelyHandmade: { type: Type.BOOLEAN, description: 'True if the item looks handmade rather than machine made.' },
    confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
    photoTip: {
      type: Type.STRING,
      description: 'One short, kind tip for a better photo, or an empty string when the photo is already good.'
    }
  },
  required: [
    'isProduct',
    'rejectReason',
    'rejectReasonTamil',
    'name',
    'nameTamil',
    'category',
    'material',
    'description',
    'descriptionTamil',
    'tags',
    'suggestedPriceMin',
    'suggestedPriceMax',
    'priceReason',
    'isLikelyHandmade',
    'confidence',
    'photoTip'
  ]
} as const;

const SYSTEM_PROMPT = `You are a cataloging assistant for Craft2Cart, an app used by marginalized
artisans in India to list handmade products on marketplaces such as ONDC, Amazon, Flipkart, GeM
and government craft fairs.

Look at the photo and fill in the listing for the artisan.

Rules:
- Describe only what you can actually see. Never invent a region, community, award or certification.
- Write for an ordinary buyer, in warm plain words. No marketing hype, no exclamation marks.
- Prices are Indian rupees for a single unit at fair retail, based on the craft, size and effort
  visible in the photo. Keep the range realistic for Indian handicraft markets.
- Tamil text must be natural Tamil, not a word-by-word transliteration of the English.
- If the photo is blurry, dark, or the product is hard to see, say so in photoTip and set a lower
  confidence. Still fill in every field with your best reading.

Gatekeeping — decide this first, and set isProduct.

Set isProduct = false when the photo shows anything that cannot be sold as an item, including:
- people, faces, selfies, group photos
- animals or pets
- landscapes, buildings, vehicles, sky, plants growing outdoors
- screenshots, documents, text, memes, logos, drawings or charts
- an empty room, a plain wall, a blank or abstract image
- something so blurry, dark or cluttered that no single item can be made out

Set isProduct = true when one clear sellable item, or a small set of identical items, is the
subject of the photo. It does not have to be handmade — judge that separately in isLikelyHandmade.

When isProduct is false, fill rejectReason and rejectReasonTamil with one short sentence saying
what you actually see, kindly, and still fill in every other field with your best reading of the
image so nothing downstream is left empty. When isProduct is true, leave both reject fields as
empty strings.`;

// No per-model retry: the chain IS the retry. Measured on 2026-09-01, a model
// answering 503 "high demand" kept answering 503 for minutes, so a second try
// on the same id only burns the budget that the next model needs.
const RETRY_DELAYS_MS: number[] = [];

// An overloaded free-tier model does not always fail fast — it accepts the
// request and holds it. One measured call sat for 315 seconds before answering,
// which is indistinguishable from a hang to the person holding the phone. So
// every attempt is capped, and the whole walk down the chain has a hard ceiling.
// A healthy call on a downscaled photo returns in a few seconds; these numbers
// only bite when something is genuinely wrong.
const ATTEMPT_TIMEOUT_MS = 15_000;
const OVERALL_TIMEOUT_MS = 60_000;

/** 503 "high demand" and 429 rate limits are routine and clear on their own. */
function isTransient(err: unknown): boolean {
  const status = typeof err === 'object' && err && 'status' in err ? Number((err as { status: unknown }).status) : 0;
  if (status === 429 || status === 500 || status === 503 || status === 504) return true;
  const message = err instanceof Error ? err.message : String(err);
  return /UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|overloaded|timeout|aborted/i.test(message);
}

/** A retired or misspelled model id — never worth retrying, try the next one. */
function isMissingModel(err: unknown): boolean {
  const status = typeof err === 'object' && err && 'status' in err ? Number((err as { status: unknown }).status) : 0;
  const message = err instanceof Error ? err.message : String(err);
  return status === 404 || /NOT_FOUND|no longer available|is not found/i.test(message);
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Turn a product photo into draft catalog fields.
 * `imageBase64` is raw base64 (no data: prefix).
 *
 * Retries the transient overload errors Gemini returns under load. Without this
 * a single 503 — which happens often enough on the shared free tier — would drop
 * the artisan back to demo values in the middle of a demo.
 */
export async function generateCatalogDraft(
  imageBase64: string,
  mimeType: string
): Promise<CatalogDraft> {
  const ai = getClient();
  if (!ai) throw new Error('GEMINI_API_KEY is not configured on the server.');

  const contents = [
    {
      role: 'user',
      parts: [
        { inlineData: { mimeType, data: imageBase64 } },
        { text: 'Catalog this artisan product for an Indian marketplace listing.' }
      ]
    }
  ];
  const baseConfig = {
    systemInstruction: SYSTEM_PROMPT,
    responseMimeType: 'application/json',
    responseSchema: CATALOG_SCHEMA,
    temperature: 0.4
  };

  const deadline = Date.now() + OVERALL_TIMEOUT_MS;
  let response;
  let lastError: unknown;

  outer: for (const model of currentChain()) {
    for (let attempt = 0; ; attempt++) {
      const budget = Math.min(ATTEMPT_TIMEOUT_MS, deadline - Date.now());
      if (budget <= 0) {
        console.warn('[gemini] out of time walking the model chain.');
        break outer;
      }

      try {
        response = await ai.models.generateContent({
          model,
          contents,
          config: { ...baseConfig, httpOptions: { timeout: budget } }
        });
        lastUsedModel = model;
        break outer;
      } catch (err) {
        lastError = err;

        if (isMissingModel(err)) {
          console.warn(`[gemini] ${model} is gone (404) — dropping to the next model.`);
          break;
        }
        if (!isTransient(err)) throw err;
        if (attempt >= RETRY_DELAYS_MS.length) {
          console.warn(`[gemini] ${model} still busy after ${attempt + 1} tries — trying the next model.`);
          break;
        }

        console.warn(
          `[gemini] ${model} attempt ${attempt + 1} failed (${
            err instanceof Error ? err.message.slice(0, 100) : err
          }); retrying in ${RETRY_DELAYS_MS[attempt]}ms`
        );
        await wait(RETRY_DELAYS_MS[attempt]);
      }
    }
  }

  if (!response) throw lastError ?? new Error('No Gemini model in the chain was available.');

  const text = response.text;
  if (!text) throw new Error('Gemini returned an empty response.');

  const draft = JSON.parse(text) as CatalogDraft;

  // The schema guarantees the keys exist; these guards keep obviously bad
  // numbers out of the UI (a zero or inverted range would look broken).
  if (!(draft.suggestedPriceMin > 0)) draft.suggestedPriceMin = 300;
  if (!(draft.suggestedPriceMax > draft.suggestedPriceMin)) {
    draft.suggestedPriceMax = Math.round(draft.suggestedPriceMin * 1.6);
  }
  if (!Array.isArray(draft.tags)) draft.tags = [];

  // Only an explicit false rejects the photo. A model that omits the field or
  // answers with something odd must not lock the artisan out of their own sale.
  draft.isProduct = draft.isProduct !== false;

  return draft;
}

/** The model that answered last — reported by /api/health and /api/catalog/status. */
export const geminiModelName = (): string => lastUsedModel;
