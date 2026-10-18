/** Test-only HTTP harness: real protected adapter + deterministic provider transport.
 * Never included by Vercel or imported by application code. No outbound traffic.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { createDecisionHandler } from '../server/decision.ts';
import { serveDecision } from '../server/local.ts';

const env = { ETTA_MIND_ENABLED: 'true', ETTA_ACCESS_TOKEN: 'fixture-access-code-never-a-real-secret',
  GEMINI_API_KEY: 'fixture-only', UPSTASH_REDIS_REST_URL: 'https://fixture.upstash.io', UPSTASH_REDIS_REST_TOKEN: 'fixture-only' };
const fakeTransport = async (url, options) => {
  if (String(url).includes('upstash.io')) return Response.json({ result: 0 });
  const prompt = JSON.parse(options.body).contents[0].parts[0].text;
  const observation = JSON.parse(prompt.split('\nObservation:\n')[1]);
  const action = observation.validActions.find(a => a.type === 'TOGGLE_LAMP') || observation.validActions[0];
  return Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ action, reason: 'Deterministic integration fixture; no model was called.' }) }] } }] });
};
const handle = createDecisionHandler(env, fakeTransport);
const root = resolve('dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
createServer(async (req, res) => {
  try {
    if (req.url?.split('?')[0] === '/api/decision') {
      return await serveDecision(req, res, async request => {
        const response = await handle(request);
        if (request.method !== 'POST' || !response.ok) return response;
        const data = await response.json();
        return Response.json({ ...data, provenance: 'TEST_FIXTURE', model: 'fixture-only' }, { headers: response.headers });
      });
    }
    const path = resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
    if (path !== root && !path.startsWith(root + '/')) { res.writeHead(403); return res.end(); }
    const filename = path === root ? resolve(root, 'index.html') : path;
    const bytes = await readFile(filename); res.setHeader('Content-Type', types[extname(filename)] || 'application/octet-stream'); res.end(bytes);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(4174, '127.0.0.1', () => console.log('Fixture integration server on 4174; no live provider.'));
