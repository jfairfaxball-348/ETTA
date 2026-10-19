/** Strict envelope for a small on-demand world-only JPEG. No images are stored. */
import { HttpError } from './http.ts';
import { record } from '../src/mind/protocol.ts';
export interface Vision { mimeType: 'image/jpeg'; data: string; width: number; height: number }
export const VISION_WIDTH = 384;
export const VISION_HEIGHT = 216;
export const MAX_VISION_BYTES = 128 * 1024;
export function parseVision(input: unknown): Vision {
  if (!record(input) || Object.keys(input).sort().join(',') !== 'data,height,mimeType,width' ||
      input.mimeType !== 'image/jpeg' || input.width !== VISION_WIDTH ||
      input.height !== VISION_HEIGHT || typeof input.data !== 'string' ||
      input.data.length < 100 || input.data.length > Math.ceil(MAX_VISION_BYTES / 3) * 4 ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(input.data)) {
    throw new HttpError(400, 'VISION', 'Invalid or oversized avatar-eye image.');
  }
  const bytes = Buffer.from(input.data, 'base64');
  if (bytes.length > MAX_VISION_BYTES || bytes.toString('base64') !== input.data ||
      bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes.at(-2) !== 0xff || bytes.at(-1) !== 0xd9) {
    throw new HttpError(400, 'VISION', 'Invalid or oversized avatar-eye image.');
  }
  // Verify the JPEG's actual SOF dimensions rather than trusting client metadata.
  let pos = 2, correct = false;
  while (pos + 4 < bytes.length) {
    if (bytes[pos++] !== 0xff) break;
    while (bytes[pos] === 0xff) pos++;
    const marker = bytes[pos++];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (pos + 2 > bytes.length) break;
    const length = bytes.readUInt16BE(pos);
    if (length < 2 || pos + length > bytes.length) break;
    if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) {
      correct = length >= 7 && bytes.readUInt16BE(pos + 3) === VISION_HEIGHT &&
        bytes.readUInt16BE(pos + 5) === VISION_WIDTH;
      break;
    }
    pos += length;
  }
  if (!correct) throw new HttpError(400, 'VISION', 'Avatar-eye image dimensions were not valid.');
  return input as unknown as Vision;
}
