/** Public, concise interpretation/choice, never private model reasoning. */
import { parseProposal, record, type Snapshot, type Proposal } from './protocol.ts';
export interface CognitiveChoice { proposal: Proposal; perception?: string; intent?: string }
export function parseCognitiveChoice(value: unknown, state: Snapshot): CognitiveChoice {
  if (!record(value)) throw new Error('Not an object');
  const columns = Object.keys(value).sort().join(',');
  if (columns === 'action,reason') return { proposal: parseProposal(value, state) }; // Legacy fixture/rollout.
  if (columns !== 'action,intent,perception,reason' || typeof value.perception !== 'string' ||
      typeof value.intent !== 'string' || !value.perception.trim() || !value.intent.trim() ||
      value.perception.length > 180 || value.intent.length > 160) throw new Error('Invalid cognitive summary');
  return { proposal: parseProposal({ action: value.action, reason: value.reason }, state),
    perception: value.perception.trim(), intent: value.intent.trim() };
}
