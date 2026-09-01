import { Router } from 'express';
import { analyzePhotoResult, catalogStatusResult } from './catalogHandlers';

// Express transport for smart cataloging, grouped by domain (global rule 4).
// The rules live in catalogHandlers.ts, shared with the Vercel functions in
// api/**, so local dev and production cannot drift apart. These two routes only
// move a body in and a status out.

export const catalogRouter = Router();

catalogRouter.get('/status', (_req, res) => {
  const { status, body } = catalogStatusResult();
  res.status(status).json(body);
});

catalogRouter.post('/analyze', async (req, res) => {
  const { status, body } = await analyzePhotoResult(req.body);
  res.status(status).json(body);
});
