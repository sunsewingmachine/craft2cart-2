// Purpose: End-to-end check of the smart-cataloging path — fetch a real craft
// photo, run it through server/gemini.ts exactly as the /api/catalog/analyze
// route does, and print the listing fields Gemini produced.
// Proves the model, the JSON schema and the Tamil output actually work before
// anyone opens the app. Does not need the dev server or Firebase.
// Usage:  npx tsx scripts/test-catalog.ts [imageUrlOrLocalPath]
// Origin: craft2cart-2, created 2026-09-01. Keep for reuse (global rule 18).

import { readFile } from 'node:fs/promises';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const { generateCatalogDraft, geminiModelName, isGeminiConfigured } = await import('../server/gemini');

// One of the app's own demo craft photos, so the run reflects real input.
const DEFAULT_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCLH6bRHq3rAzbbw3XPl3p803tF261Tvc8ol4La8t7dSft3VZutPHGe9J-nPrYYx-JVD22O_RcoavEYQb4obS4iU8sk8s3ssvzimuRORmK7WSDZoWodBA8HeSR-PAxQ7-Nctr4-F9cfEBimlGD0g1-JhHTFSKZW8Gkc5_53DQEXWlbFeY4PvcksipcoZFBPyhsD8LZiQii1TdXhHSwaMM---qxUAbFN5GUEgqmDYWM6a9P8y3VCqe54';

async function loadImage(source: string): Promise<{ base64: string; mimeType: string }> {
  if (/^https?:\/\//.test(source)) {
    const res = await fetch(source);
    if (!res.ok) throw new Error(`Could not fetch the image: HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    return {
      base64: buffer.toString('base64'),
      mimeType: res.headers.get('content-type')?.split(';')[0] ?? 'image/jpeg'
    };
  }

  const buffer = await readFile(source);
  const mimeType = source.endsWith('.png') ? 'image/png' : 'image/jpeg';
  return { base64: buffer.toString('base64'), mimeType };
}

if (!isGeminiConfigured()) {
  console.error('GEMINI_API_KEY is not set. Add it to .env.local.');
  process.exit(1);
}

const source = process.argv[2] ?? DEFAULT_IMAGE;
console.log(`Model : ${geminiModelName()}`);
console.log(`Image : ${source.slice(0, 80)}${source.length > 80 ? '...' : ''}\n`);

const started = performance.now();
const { base64, mimeType } = await loadImage(source);
const draft = await generateCatalogDraft(base64, mimeType);
const elapsed = Math.round(performance.now() - started);

console.log(`Name        : ${draft.name}`);
console.log(`Name (ta)   : ${draft.nameTamil}`);
console.log(`Category    : ${draft.category}`);
console.log(`Material    : ${draft.material}`);
console.log(`Handmade    : ${draft.isLikelyHandmade}`);
console.log(`Confidence  : ${draft.confidence}`);
console.log(`Price       : Rs ${draft.suggestedPriceMin} - Rs ${draft.suggestedPriceMax}`);
console.log(`Price why   : ${draft.priceReason}`);
console.log(`Tags        : ${draft.tags.join(', ')}`);
console.log(`Photo tip   : ${draft.photoTip || '(none)'}`);
console.log(`\nDescription :\n${draft.description}`);
console.log(`\nDescription (ta):\n${draft.descriptionTamil}`);
console.log(`\nDone in ${elapsed} ms.`);
