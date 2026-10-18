import { defineConfig, loadEnv } from 'vite';
import { createDecisionHandler } from './server/decision.ts';
import { serveDecision } from './server/local.ts';

export default defineConfig(({ mode }) => ({
  plugins: [{ name: 'etta-local-api', configureServer(server) {
    const handler = createDecisionHandler({ ...process.env, ...loadEnv(mode, process.cwd(), '') });
    server.middlewares.use((req, res, next) => {
      if (req.url?.split('?')[0] !== '/api/decision') return next();
      void serveDecision(req, res, handler).catch(() => { res.statusCode = 500; res.end('Local API failed'); });
    });
  }, configurePreviewServer(server) {
    // Static preview remains usable without production credentials.
    const handler = createDecisionHandler({});
    server.middlewares.use((req, res, next) => {
      if (req.url?.split('?')[0] !== '/api/decision') return next();
      void serveDecision(req, res, handler).catch(() => { res.statusCode = 500; res.end('Preview API failed'); });
    });
  } }]
}));
