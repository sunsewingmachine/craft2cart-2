import { Language } from '../types';

// Smart cataloging, client side. The UI hands over the photo and gets back
// listing fields; it never knows a model was involved or where the key lives.
//
// Failure is a first-class result, not an exception: analyzeProductPhoto always
// resolves. On any error it returns the caller's demo fallback marked
// source:'fallback', so the sell flow keeps moving on a dead network — the one
// thing that must never break during a live demo.

export interface CatalogDraft {
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

export interface CatalogResult {
  draft: CatalogDraft;
  source: 'ai' | 'fallback';
  /** Set when source is 'fallback' — why the AI answer was not used. */
  reason?: string;
}

/** The demo values a screen already has, used when the AI cannot be reached. */
export interface CatalogFallback {
  name: string;
  material: string;
}

// The server bounds its own walk down the model chain at 60s; this sits just
// past that so the client shows the real error rather than a premature abort.
const REQUEST_TIMEOUT_MS = 75_000;

function buildFallbackDraft(fallback: CatalogFallback): CatalogDraft {
  return {
    name: fallback.name,
    nameTamil: fallback.name,
    category: 'Handicrafts & Sustainable Living',
    material: fallback.material,
    description: `Handcrafted ${fallback.name.toLowerCase()} made with ${fallback.material}.`,
    descriptionTamil: `${fallback.material} கொண்டு கையால் செய்யப்பட்ட ${fallback.name}.`,
    tags: ['handmade', 'artisan', 'sustainable'],
    suggestedPriceMin: 400,
    suggestedPriceMax: 800,
    priceReason: 'A common price range for handmade crafts of this kind.',
    isLikelyHandmade: true,
    confidence: 'low',
    photoTip: ''
  };
}

/**
 * Ask the server to catalog a product photo.
 * `photoUrl` must be a data URL — demo products already have their details.
 */
export async function analyzeProductPhoto(
  photoUrl: string,
  fallback: CatalogFallback
): Promise<CatalogResult> {
  if (!photoUrl.startsWith('data:')) {
    return { draft: buildFallbackDraft(fallback), source: 'fallback', reason: 'not-a-photo-upload' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch('/api/catalog/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageDataUrl: photoUrl }),
      signal: controller.signal
    });

    const body = (await res.json()) as { ok?: boolean; draft?: CatalogDraft; error?: string };

    if (!res.ok || !body.ok || !body.draft) {
      return {
        draft: buildFallbackDraft(fallback),
        source: 'fallback',
        reason: body.error ?? `http-${res.status}`
      };
    }

    return { draft: body.draft, source: 'ai' };
  } catch (err) {
    const reason = err instanceof Error && err.name === 'AbortError' ? 'timeout' : 'network';
    return { draft: buildFallbackDraft(fallback), source: 'fallback', reason };
  } finally {
    clearTimeout(timer);
  }
}

/** Pick the AI title/description for the artisan's chosen language. */
export const draftName = (draft: CatalogDraft, lang: Language): string =>
  lang === 'ta' ? draft.nameTamil : lang === 'both' ? `${draft.nameTamil} · ${draft.name}` : draft.name;

export const draftDescription = (draft: CatalogDraft, lang: Language): string =>
  lang === 'ta'
    ? draft.descriptionTamil
    : lang === 'both'
      ? `${draft.descriptionTamil}\n${draft.description}`
      : draft.description;

/** Midpoint of the AI range, rounded to the nearest ₹10 — what we pre-fill. */
export const suggestedPrice = (draft: CatalogDraft): number =>
  Math.round((draft.suggestedPriceMin + draft.suggestedPriceMax) / 2 / 10) * 10;
