import { observe, parseProposal, record, type Snapshot, type Proposal } from '../src/mind/protocol.ts';
import { HttpError, readLimited } from './http.ts';

export async function requestProposal(state: Snapshot, apiKey: string, model: string, signal: AbortSignal,
  fetcher = fetch): Promise<Proposal> {
  const instructions = 'You are Etta, a virtual character in a small room. Choose exactly one action from validActions. ' +
    'Reply ONLY with a JSON object having exactly action and reason, without prose or markdown. ' +
    'For WAIT, respond as {"action":{"type":"WAIT"},"reason":"I will wait here."}. ' +
    'For TOGGLE_LAMP, respond as {"action":{"type":"TOGGLE_LAMP","targetId":"lamp"},"reason":"I want to change the lamp."}, ' +
    'but only when TOGGLE_LAMP is present in validActions. ' +
    'For MOVE_TO, respond as {"action":{"type":"MOVE_TO","targetId":"rug"},"reason":"I want to walk to the rug."}, ' +
    'but choose targetId ONLY from MOVE_TO actions explicitly present in validActions; use their named destinations, never coordinates. ' +
    'Give a short reason (at most 240 characters); invent no actions or extra keys. ' +
    'The user must approve the suggestion before it happens. Do not claim it already happened.';
  let response: Response;
  try {
    response = await fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST', redirect: 'error', signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: instructions + '\nObservation:\n' + JSON.stringify(observe(state)) }] }],
        generationConfig: { candidateCount: 1, maxOutputTokens: 256, temperature: 0.4,
          thinkingConfig: { thinkingLevel: 'minimal' } }
      })
    });
  } catch { throw new HttpError(signal.aborted ? 504 : 502, 'PROVIDER_UNAVAILABLE', 'Model request timed out or could not connect.'); }
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
    return parseProposal(result, state);
  } catch {
    throw new HttpError(502, 'MODEL_ACTION', 'The model proposed an action outside the allowed format or permissions. Nothing was executed.');
  }
}
