import { observe, record, type Snapshot } from '../src/mind/protocol.ts';
import { parseCognitiveChoice } from '../src/mind/cognition.ts';
import type { Vision } from './vision.ts';
import { HttpError, readLimited } from './http.ts';

export async function requestProposal(state: Snapshot, apiKey: string, model: string, signal: AbortSignal,
  fetcher = fetch, vision?: Vision) {
  const instructions = 'You are Etta, a virtual character in a small room. The image is what your eyes can see, ' +
    'while the following canonical geometric observation is the ONLY authority for valid actions. ' +
    'Briefly report what is visible (perception), state one simple intention (intent), and choose exactly one action ' +
    'listed in validActions. Reply ONLY in JSON with exactly perception, intent, action, reason. ' +
    'Each summary must be short and public-facing, not internal private reasoning. ' +
    'For WAIT use action {"type":"WAIT"}; for TOGGLE_LAMP use {"type":"TOGGLE_LAMP","targetId":"lamp"} ' +
    'only when allowed; for MOVE_TO choose only a targetId explicitly offered in validActions. ' +
    'Never invent coordinates, commands, interactions or extra keys. Reason must be at most 240 characters. ' +
    'In manual mode the user must approve before anything happens; do not claim the action already occurred.';
  let response: Response;
  try {
    response = await fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST', redirect: 'error', signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: instructions + '\nObservation:\n' + JSON.stringify(observe(state)) },
          ...(vision ? [{ inlineData: { mimeType: vision.mimeType, data: vision.data } }] : [])] }],
        generationConfig: { candidateCount: 1, maxOutputTokens: 256, temperature: 0.4,
          thinkingConfig: { thinkingLevel: 'minimal' } }
      })
    });
  } catch {
    if (signal.aborted) throw new HttpError(504, 'PROVIDER_TIMEOUT',
      'Gemma did not respond within the request time limit. Nothing was executed.');
    throw new HttpError(502, 'PROVIDER_UNAVAILABLE',
      'The connection to Google failed. Nothing was executed.');
  }
  if (!response.ok) {
    void response.body?.cancel();
    throw new HttpError(response.status === 429 ? 429 : 502, 'PROVIDER_ERROR',
      response.status === 429 ? 'Google’s model quota is exhausted. Try again later.' : 'Google rejected the model request. Check the server configuration.');
  }
  let data: unknown;
  try {
    data = JSON.parse(await readLimited(response, 16_384));
  } catch {
    throw new HttpError(signal.aborted ? 504 : 502, 'MODEL_RESPONSE',
      'The model response could not be read. Nothing was executed.');
  }
  if (!record(data) || !Array.isArray(data.candidates) || data.candidates.length !== 1 ||
      !record(data.candidates[0])) {
    throw new HttpError(502, 'MODEL_RESPONSE', 'The model did not return a usable response. Nothing was executed.');
  }
  const candidate = data.candidates[0];
  if (candidate.finishReason === 'MAX_TOKENS') {
    throw new HttpError(502, 'MODEL_TRUNCATED',
      'The model ran out of response tokens before completing its action. Nothing was executed.');
  }
  if (candidate.finishReason !== 'STOP' || !record(candidate.content) ||
      !Array.isArray(candidate.content.parts) ||
      candidate.content.parts.some((part: unknown) => !record(part))) {
    throw new HttpError(502, 'MODEL_RESPONSE', 'The model did not finish a usable response. Nothing was executed.');
  }
  // Gemma can return an empty thought part and split final text across several parts.
  // Never accept a non-text final part or turn an unauthorized action into a legal one.
  const finalParts = candidate.content.parts.filter((part: unknown) => record(part) && part.thought !== true);
  if (finalParts.length === 0 || finalParts.some(part => typeof part.text !== 'string')) {
    throw new HttpError(502, 'MODEL_FORMAT', 'The model did not return a text action. Nothing was executed.');
  }
  const output = finalParts.map(part => part.text).join('');
  if (!output.trim() || output.length > 2048) {
    throw new HttpError(502, 'MODEL_FORMAT', 'The model action was empty or oversized. Nothing was executed.');
  }
  const trimmed = output.trim();
  // Accept only a single complete JSON object or a single complete JSON code fence.
  // Do not extract arbitrary JSON from a larger model narrative.
  const fence = /^\x60{3}(?:json)?[ \t]*\r?\n([\s\S]*?)\r?\n\x60{3}$/i.exec(trimmed);
  let result: unknown;
  try {
    result = JSON.parse(fence ? fence[1] : trimmed);
  } catch {
    throw new HttpError(502, 'MODEL_FORMAT', 'The model response was not valid JSON. Nothing was executed.');
  }
  try {
    return parseCognitiveChoice(result, state);
  } catch {
    throw new HttpError(502, 'MODEL_ACTION', 'The model proposed an action outside the allowed format or permissions. Nothing was executed.');
  }
}
