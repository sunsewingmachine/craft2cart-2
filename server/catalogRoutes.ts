import { Router } from 'express';
import { generateCatalogDraft, geminiModelName, isGeminiConfigured } from './gemini';

// HTTP surface for smart cataloging, grouped by domain (global rule 4).
// POST /api/catalog/analyze takes the photo the artisan just captured and
// returns draft listing fields. The route always answers with a usable shape:
// on any failure it reports ok:false and the client keeps its demo values, so a
// flat network or a bad key can never blank out the sell flow mid-demo.

export const catalogRouter = Router();

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

interface AnalyzeBody {
  imageDataUrl?: string;
}

/** Split a `data:image/jpeg;base64,...` URL into its mime type and payload. */
function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(dataUrl.trim());
  if (!match) return null;
  return { mimeType: match[1], base64: match[2] };
}

catalogRouter.get('/status', (_req, res) => {
  res.json({ configured: isGeminiConfigured(), model: geminiModelName() });
});

catalogRouter.post('/analyze', async (req, res) => {
  const { imageDataUrl } = req.body as AnalyzeBody;

  if (!imageDataUrl || typeof imageDataUrl !== 'string') {
    res.status(400).json({ ok: false, error: 'missing-image' });
    return;
  }

  const parsed = parseDataUrl(imageDataUrl);
  if (!parsed) {
    res.status(400).json({ ok: false, error: 'not-a-data-url' });
    return;
  }

  // base64 inflates by 4/3; compare against the decoded size.
  if ((parsed.base64.length * 3) / 4 > MAX_IMAGE_BYTES) {
    res.status(413).json({ ok: false, error: 'image-too-large' });
    return;
  }

  if (!isGeminiConfigured()) {
    res.status(503).json({ ok: false, error: 'gemini-not-configured' });
    return;
  }

  try {
    const draft = await generateCatalogDraft(parsed.base64, parsed.mimeType);
    res.json({ ok: true, draft, model: geminiModelName() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[catalog/analyze] failed:', message);
    res.status(502).json({ ok: false, error: 'gemini-failed', detail: message });
  }
});
