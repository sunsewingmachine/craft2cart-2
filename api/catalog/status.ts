import { catalogStatusResult } from '../../server/catalogHandlers.js';

// Whether Gemini is configured on this deployment, and which model answered
// last. See api/health.ts for why the /api surface exists twice.

export const maxDuration = 10;

export function GET(): Response {
  const { status, body } = catalogStatusResult();
  return Response.json(body, { status });
}
