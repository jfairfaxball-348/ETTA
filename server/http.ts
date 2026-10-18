export class HttpError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) { super(message); this.status = status; this.code = code; }
}
/** Count bytes while streaming, including requests without a Content-Length header. */
export async function readLimited(message: Request | Response, limit: number): Promise<string> {
  if (Number(message.headers.get('content-length')) > limit) {
    throw new HttpError(413, 'TOO_LARGE', 'Payload is too large.');
  }
  const reader = message.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new HttpError(413, 'TOO_LARGE', 'Payload is too large.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}
