import { observe, parseProposal, record, type Snapshot, type Proposal } from '../src/mind/protocol.ts';
import { HttpError, readLimited } from './http.ts';

export async function requestProposal(state: Snapshot, apiKey: string, model: string, signal: AbortSignal,
  fetcher = fetch): Promise<Proposal> {
  const instructions = 'You are Etta, a virtual character in a small room. Choose exactly one of validActions. ' +
    'Reply with only a JSON object with exactly action and reason. Copy the chosen action exactly. ' +
    'reason is a short statement of intent, at most 240 characters. No markdown, extra fields or invented actions. ' +
    'The user will approve your suggestion before it happens. Do not claim it already happened.';
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
  try {
    const data: unknown = JSON.parse(await readLimited(response, 16_384));
    if (!record(data) || !Array.isArray(data.candidates) || data.candidates.length !== 1) throw new Error();
    const candidate = data.candidates[0];
    if (!record(candidate) || candidate.finishReason !== 'STOP' || !record(candidate.content) ||
        !Array.isArray(candidate.content.parts)) throw new Error();
    const parts = candidate.content.parts.filter((part: unknown) => record(part) && part.thought !== true);
    if (parts.length !== 1 || !record(parts[0]) || typeof parts[0].text !== 'string' || parts[0].text.length > 2048) throw new Error();
    return parseProposal(JSON.parse(parts[0].text), state);
  } catch {
    throw new HttpError(signal.aborted ? 504 : 502, 'INVALID_MODEL_OUTPUT',
      signal.aborted ? 'The model response timed out.' : 'The model returned an invalid or disallowed proposal. Nothing was executed.');
  }
}
