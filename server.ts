import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { catalogRouter } from './server/catalogRoutes';
import { geminiModelName, isGeminiConfigured } from './server/gemini';

// App server: serves the built SPA in production, proxies through Vite in dev,
// and hosts the /api routes. Gemini is only ever called from here so the API
// key stays off the client. API routes are registered before the Vite
// middleware, otherwise Vite's catch-all would swallow them.

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Product photos arrive as base64 data URLs, well past Express's 100kb default.
app.use(express.json({ limit: '12mb' }));

// API health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Craft2Cart',
    gemini: isGeminiConfigured() ? geminiModelName() : 'not-configured',
    time: new Date().toISOString()
  });
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
