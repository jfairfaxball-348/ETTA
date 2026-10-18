/** HTTP bridge used by Vite development and the local integration-test server. */
import { Readable } from 'node:stream';
import type { IncomingMessage, ServerResponse } from 'node:http';

export async function serveDecision(req: IncomingMessage, res: ServerResponse, handler: (request: Request) => Promise<Response>) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  const init: RequestInit & { duplex: 'half' } = { method: req.method, headers, duplex: 'half' };
  if (!['GET', 'HEAD'].includes(req.method || 'GET')) init.body = Readable.toWeb(req) as ReadableStream<Uint8Array>;
  const response = await handler(new Request(`http://${req.headers.host}${req.url}`, init));
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(await response.text());
}
