import { generateCatalogDraft, geminiModelName, isGeminiConfigured } from './gemini';

// Transport-free core of the catalog API: status in, status + JSON body out.
// It exists because the app is served two different ways — Express locally
// (server.ts), Vercel serverless functions in production (api/**) — and the
// rules about what a valid photo is, how big it may be, and what a failure
// looks like must be the same in both. Each transport is a five-line wrapper
// around these functions; nothing about parsing or Gemini lives in them.

export interface ApiResult {
  status: number;
  body: unknown;
}

/** Decoded photo ceiling. A 1024px JPEG from the client is ~100-400 KB. */
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/** Split a `data:image/jpeg;base64,...` URL into its mime type and payload. */
function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(dataUrl.trim());
  if (!match) return null;
  return { mimeType: match[1], base64: match[2] };
}

export function healthResult(): ApiResult {
  return {
    status: 200,
    body: {
      status: 'ok',
      app: 'Craft2Cart',
      gemini: isGeminiConfigured() ? geminiModelName() : 'not-configured',
      time: new Date().toISOString()
    }
  };
}

export function catalogStatusResult(): ApiResult {
  return { status: 200, body: { configured: isGeminiConfigured(), model: geminiModelName() } };
}

/**
 * Catalog one product photo. `payload` is the raw request body, untrusted.
 * Never throws: every failure comes back as ok:false with a machine-readable
 * error, because the client turns any of them into demo values rather than a
 * dead end.
 */
export async function analyzePhotoResult(payload: unknown): Promise<ApiResult> {
  const imageDataUrl =
    typeof payload === 'object' && payload && 'imageDataUrl' in payload
      ? (payload as { imageDataUrl: unknown }).imageDataUrl
      : undefined;

  if (!imageDataUrl || typeof imageDataUrl !== 'string') {
    return { status: 400, body: { ok: false, error: 'missing-image' } };
  }

  const parsed = parseDataUrl(imageDataUrl);
  if (!parsed) {
    return { status: 400, body: { ok: false, error: 'not-a-data-url' } };
  }

  // base64 inflates by 4/3; compare against the decoded size.
  if ((parsed.base64.length * 3) / 4 > MAX_IMAGE_BYTES) {
    return { status: 413, body: { ok: false, error: 'image-too-large' } };
  }

  if (!isGeminiConfigured()) {
    return { status: 503, body: { ok: false, error: 'gemini-not-configured' } };
  }

  try {
    const draft = await generateCatalogDraft(parsed.base64, parsed.mimeType);
    return { status: 200, body: { ok: true, draft, model: geminiModelName() } };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[catalog/analyze] failed:', message);
    return { status: 502, body: { ok: false, error: 'gemini-failed', detail: message } };
  }
}
