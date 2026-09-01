import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { catalogRouter } from './server/catalogRoutes';
import { healthResult } from './server/catalogHandlers';
import { geminiModelName, isGeminiConfigured } from './server/gemini';

// Local dev and self-hosted server: serves the built SPA, proxies through Vite
// in dev, and hosts the /api routes. Gemini is only ever called server-side so
// the API key stays off the client. API routes are registered before the Vite
// middleware, otherwise Vite's catch-all would swallow them.
//
// On Vercel this file does not run at all — the deployment is a static bundle
// plus the serverless functions in api/**. Both transports call the same
// handlers in server/catalogHandlers.ts, so what works here works there.

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Product photos arrive as base64 data URLs, well past Express's 100kb default.
app.use(express.json({ limit: '12mb' }));

// API health check
app.get('/api/health', (_req, res) => {
  const { status, body } = healthResult();
  res.status(status).json(body);
});

app.use('/api/catalog', catalogRouter);

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Craft2Cart server running on http://localhost:${PORT}`);
    console.log(
      isGeminiConfigured()
        ? `Gemini cataloging enabled (${geminiModelName()})`
        : 'Gemini cataloging disabled — set GEMINI_API_KEY in .env.local'
    );
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
