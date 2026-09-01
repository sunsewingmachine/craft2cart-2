import { healthResult } from '../server/catalogHandlers';

// Vercel serverless transport. In production the app is a static Vite bundle on
// Vercel's CDN, so Express never runs and these files are the only thing serving
// /api — without them every AI call 404s and the app silently falls back to demo
// values. Locally the same logic is reached through Express (server.ts); both
// call into server/catalogHandlers.ts so neither can drift.

export const maxDuration = 10;

export function GET(): Response {
  const { status, body } = healthResult();
  return Response.json(body, { status });
}
