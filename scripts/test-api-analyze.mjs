// Purpose: Verify the running server's smart-cataloging endpoint the same way the
// browser calls it — POST a real photo as a data URL to /api/catalog/analyze and
// print what comes back. Catches wiring faults that a direct module test misses:
// route registration, JSON body limits, error shape, Vite middleware ordering.
// Usage:  node scripts/test-api-analyze.mjs [baseUrl] [imageUrl]
//         (dev server must already be running — see .claude/launch.json)
// Origin: craft2cart-2, created 2026-09-01. Keep for reuse (global rule 18).

const BASE = process.argv[2] ?? 'http://localhost:3000';

// One of the app's own demo craft photos, requested at 768px so the payload
// matches what the client sends after downscaling.
const IMAGE =
  process.argv[3] ??
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCLH6bRHq3rAzbbw3XPl3p803tF261Tvc8ol4La8t7dSft3VZutPHGe9J-nPrYYx-JVD22O_RcoavEYQb4obS4iU8sk8s3ssvzimuRORmK7WSDZoWodBA8HeSR-PAxQ7-Nctr4-F9cfEBimlGD0g1-JhHTFSKZW8Gkc5_53DQEXWlbFeY4PvcksipcoZFBPyhsD8LZiQii1TdXhHSwaMM---qxUAbFN5GUEgqmDYWM6a9P8y3VCqe54=w768';

async function main() {
  const health = await fetch(`${BASE}/api/health`).then((r) => r.json());
  console.log('health   :', JSON.stringify(health));

  const status = await fetch(`${BASE}/api/catalog/status`).then((r) => r.json());
  console.log('catalog  :', JSON.stringify(status));

  const imageRes = await fetch(IMAGE);
  if (!imageRes.ok) throw new Error(`Could not fetch the test image: HTTP ${imageRes.status}`);
  const buffer = Buffer.from(await imageRes.arrayBuffer());
  const mime = imageRes.headers.get('content-type')?.split(';')[0] ?? 'image/jpeg';
  const imageDataUrl = `data:${mime};base64,${buffer.toString('base64')}`;
  console.log(`payload  : ${Math.round(imageDataUrl.length / 1024)} KB data URL\n`);

  const started = Date.now();
  const res = await fetch(`${BASE}/api/catalog/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageDataUrl })
  });
  const body = await res.json();
  const elapsed = Date.now() - started;

  console.log(`HTTP ${res.status} in ${elapsed} ms`);
  if (!body.ok) {
    console.error('FAILED:', JSON.stringify(body, null, 2));
    process.exit(1);
  }

  const d = body.draft;
  console.log(`model    : ${body.model}`);
  console.log(`name     : ${d.name}`);
  console.log(`name(ta) : ${d.nameTamil}`);
  console.log(`category : ${d.category}`);
  console.log(`material : ${d.material}`);
  console.log(`price    : Rs ${d.suggestedPriceMin} - Rs ${d.suggestedPriceMax}`);
  console.log(`tags     : ${d.tags.join(', ')}`);
  console.log(`confidence: ${d.confidence}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
