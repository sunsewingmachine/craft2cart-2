// Purpose: Probe the live Gemini API with the repo's GEMINI_API_KEY before we hardcode a model id.
// Verifies (a) the key works, (b) which models the key can actually see, and with --probe
// (c) that the chosen model still honours JSON structured output + image input.
// Usage:  node scripts/check-gemini.mjs [--probe]
// Origin: craft2cart-2, created 2026-09-01. Keep for reuse (global rule 15b / 18).

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    /* no .env.local — rely on the ambient environment */
  }
}

loadEnvLocal();

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error('GEMINI_API_KEY is not set (looked in the environment and .env.local).');
  process.exit(1);
}

const BASE = 'https://generativelanguage.googleapis.com/v1beta';

async function listModels() {
  const res = await fetch(`${BASE}/models?key=${KEY}&pageSize=200`);
  const body = await res.json();
  if (!res.ok) {
    console.error(`ListModels failed (${res.status}):`, JSON.stringify(body, null, 2));
    process.exit(1);
  }
  const usable = (body.models ?? [])
    .filter((m) => (m.supportedGenerationMethods ?? []).includes('generateContent'))
    .map((m) => m.name.replace('models/', ''))
    .sort();
  console.log(`Key is valid. ${usable.length} models support generateContent:\n`);
  for (const name of usable) console.log('  ' + name);
  return usable;
}

// A 1x1 red PNG — enough to prove the model accepts inlineData without shipping a fixture file.
const TINY_PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

async function probe(model) {
  console.log(`\nProbing ${model} for image input + JSON structured output...`);
  const res = await fetch(`${BASE}/models/${model}:generateContent?key=${KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: 'Reply with the dominant colour of this image as JSON.' },
            { inlineData: { mimeType: 'image/png', data: TINY_PNG } },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: { colour: { type: 'STRING' } },
          required: ['colour'],
        },
      },
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    console.error(`  FAILED (${res.status}):`, JSON.stringify(body, null, 2));
    return false;
  }
  const text = body.candidates?.[0]?.content?.parts?.[0]?.text ?? '(no text)';
  console.log('  OK →', text.trim());
  return true;
}

const models = await listModels();

// The candidates the app is willing to run on, best first. Keep this in step
// with FALLBACK_MODELS in server/gemini.ts.
const PREFERRED = ['gemini-flash-latest', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-3.6-flash'];

if (process.argv.includes('--all')) {
  // Which candidates are answering right now — the free tier returns 503
  // "high demand" on a busy alias, and that is a runtime fact, not a config bug.
  const results = [];
  for (const model of PREFERRED.filter((m) => models.includes(m))) {
    results.push([model, await probe(model)]);
  }
  console.log('\nSummary:');
  for (const [model, ok] of results) console.log(`  ${ok ? 'OK  ' : 'DOWN'}  ${model}`);
  process.exit(results.some(([, ok]) => ok) ? 0 : 1);
}

if (process.argv.includes('--probe')) {
  const target = PREFERRED.find((m) => models.includes(m)) ?? models[0];
  const ok = await probe(target);
  process.exit(ok ? 0 : 1);
}
