import { analyzePhotoResult } from '../../server/catalogHandlers';

// Photo in, draft listing out — the production twin of the Express route in
// server/catalogRoutes.ts. See api/health.ts for why both exist.

// server/gemini.ts bounds its own walk down the model chain at 60s. This sits
// just past that, so a slow model is reported as a Gemini failure the client can
// explain rather than as a killed function.
export const maxDuration = 75;

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'bad-json' }, { status: 400 });
  }

  const { status, body } = await analyzePhotoResult(payload);
  return Response.json(body, { status });
}
