import { observe, parseProposal, record, sameSnapshot, PROPOSAL_TTL_MS, type Snapshot, type Proposal, type Decision } from './protocol.ts';
import { destination, type WalkResult } from '../navigation.ts';

export const CLIENT_DECISION_TIMEOUT_MS = 45_000;
export interface MindView {
  status: 'DISABLED' | 'MANUAL' | 'REQUESTING' | 'ERROR' | 'MODEL_DECISION' | 'TEST_FIXTURE';
  message: string; decision: Decision | null; observation: ReturnType<typeof observe> | null;
  pending: boolean; moving: boolean; destination: string | null; history: string[];
}
interface Hooks { snapshot: () => Snapshot; stop: () => void; apply: (proposal: Proposal) => boolean; changed: (view: MindView) => void;
  captureVision?: () => { mimeType: 'image/jpeg'; data: string; width: number; height: number };
  navigation?: { start: (targetId: string) => boolean; step: (dt: number) => WalkResult; cancel: () => void } }

export class MindController {
  readonly view: MindView = { status: 'DISABLED', message: 'Checking mind connection…', decision: null, observation: null, pending: false, moving: false, destination: null, history: [] };
  enabled = false;
  private generation = 0;
  private request: AbortController | null = null;
  private captured: Snapshot | null = null;
  private expires = 0;
  private hooks: Hooks;
  private fetcher: typeof fetch;
  private clock: () => number;
  constructor(hooks: Hooks, fetcher = fetch, clock = () => performance.now()) {
    this.hooks = hooks; this.fetcher = fetcher.bind(globalThis); this.clock = clock;
  }
  protected publish(message?: string) {
    if (message) {
      this.view.message = message;
      this.view.history = [`${this.view.status} · ${message}`, ...this.view.history].slice(0, 6);
    }
    this.hooks.changed(this.view);
  }
  configure(enabled: boolean, message: string) {
    if (!enabled && this.hasWork) this.cancel('Mind permission was removed.');
    this.enabled = enabled;
    this.view.status = enabled ? 'MANUAL' : 'DISABLED';
    this.publish(message);
  }
  cancel(message = 'Stopped. Manual controls are yours.') {
    this.generation++;
    this.request?.abort(); this.request = null; this.captured = null;
    this.hooks.navigation?.cancel();
    this.view.pending = false; this.view.decision = null; this.view.moving = false; this.view.destination = null;
    this.hooks.stop();
    this.view.status = this.enabled ? 'MANUAL' : 'DISABLED';
    this.publish(message);
  }
  get hasWork(): boolean { return this.view.pending || this.view.decision !== null || this.view.moving; }
  async ask(accessCode: string): Promise<void> {
    if (!this.enabled || this.hasWork) return;
    this.cancel('Preparing one proposal.');
    if (!(/^[A-Za-z0-9_-]{32,128}$/.test(accessCode) || /^\d{4}$/.test(accessCode))) {
      this.view.status = 'ERROR'; this.publish('Enter the configured four-digit PIN.'); return;
    }
    const id = this.generation;
    const captured = this.hooks.snapshot(); this.captured = captured;
    this.view.observation = observe(captured);
    let vision;
    try { vision = this.hooks.captureVision?.(); }
    catch {
      this.view.status = 'ERROR'; this.publish('Avatar-eye image could not be captured. No request was made.');
      return;
    }
    const abort = new AbortController(); this.request = abort;
    const timer = setTimeout(() => abort.abort(), CLIENT_DECISION_TIMEOUT_MS);
    this.view.pending = true; this.view.status = 'REQUESTING';
    this.publish('Asking Etta once. No action will run without your approval.');
    try {
      const response = await this.fetcher('/api/decision', { method: 'POST', signal: abort.signal, cache: 'no-store',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessCode}` },
        body: JSON.stringify({ snapshot: captured, ...(vision ? { vision } : {}) }) });
      const data: unknown = await response.json();
      if (id !== this.generation) return;
      if (!response.ok) {
        if (record(data) && data.code === 'DISABLED') this.enabled = false;
        throw new Error(record(data) && typeof data.message === 'string' ? data.message.slice(0, 240) : 'Mind request failed.');
      }
      if (!record(data) || !['MODEL_DECISION', 'TEST_FIXTURE'].includes(data.provenance as string) ||
          typeof data.model !== 'string' || data.model.length > 80 || typeof data.elapsedMs !== 'number' ||
          !Number.isFinite(data.elapsedMs) || data.elapsedMs < 0) throw new Error('Invalid decision response.');
      if (!sameSnapshot(captured, this.hooks.snapshot())) throw new Error('The room changed. Ask Etta again.');
      const proposal = parseProposal(data.proposal, this.hooks.snapshot());
      const provenance = data.provenance as Decision['provenance'];
      this.view.decision = { provenance, proposal, model: data.model, elapsedMs: data.elapsedMs };
      this.view.status = provenance; this.expires = this.clock() + PROPOSAL_TTL_MS;
      const perception = typeof data.perception === 'string' ? data.perception.slice(0,180) : '';
      const intent = typeof data.intent === 'string' ? data.intent.slice(0,160) : '';
      this.publish(provenance === 'TEST_FIXTURE' ? 'Test fixture only. Awaiting manual approval.' :
        (perception && intent ? perception + ' · ' + intent + ' · Awaiting approval.' : 'Etta has proposed an action. Awaiting your approval.'));
    } catch (error) {
      if (id !== this.generation) return;
      this.view.status = this.enabled ? 'ERROR' : 'DISABLED'; this.view.decision = null; this.captured = null;
      this.publish(abort.signal.aborted ? 'The request was stopped or reached the browser time limit. Nothing was executed.' :
        error instanceof Error ? error.message : 'Mind connection failed. Nothing was executed.');
    } finally {
      clearTimeout(timer);
      if (id === this.generation) { this.view.pending = false; this.request = null; this.publish(); }
    }
  }
  tick(dt = 0) {
    if (this.view.moving) {
      const result = this.hooks.navigation?.step(dt) ?? 'BLOCKED';
      if (result === 'MOVING') return;
      const place = this.view.destination;
      this.view.moving = false; this.view.destination = null;
      if (result === 'ARRIVED') this.publish('Arrived at ' + place + '. Ask Etta again whenever you like.');
      else { this.view.status = 'ERROR'; this.hooks.navigation?.cancel(); this.publish('The route was blocked or timed out. Movement stopped safely.'); }
      return;
    }
    if (!this.hasWork || !this.captured) return;
    if (!sameSnapshot(this.captured, this.hooks.snapshot())) this.cancel('The room changed; the proposal was discarded.');
    else if (this.view.decision && this.clock() >= this.expires) this.cancel('The proposal expired. Ask Etta again.');
  }
  approve() {
    this.tick();
    const decision = this.view.decision;
    if (!decision) return;
    // Consume before applying so double clicks can never execute twice.
    this.view.decision = null; this.captured = null;
    try {
      this.hooks.stop();
      const action = decision.proposal.action;
      if (action.type === 'MOVE_TO') {
        if (!this.hooks.navigation?.start(action.targetId)) throw new Error('Route is no longer permitted.');
        this.view.moving = true;
        this.view.destination = destination(action.targetId)?.label ?? action.targetId;
        this.view.status = decision.provenance;
        this.publish('Walking to ' + this.view.destination + ' after manual approval. Stop or move to interrupt.');
      } else {
        if (!this.hooks.apply(decision.proposal)) throw new Error('Action is no longer permitted.');
        this.view.status = decision.provenance;
        this.publish(action.type + ' completed after manual approval.');
      }
    } catch {
      this.view.status = 'ERROR'; this.publish('The world rejected that action. Ask Etta again.');
    }
  }
}
