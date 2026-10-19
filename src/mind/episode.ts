/** S008: finite, foreground-only opt-in controller over the existing approved world path. */
import { MindController } from './controller.ts';
import type { Provenance } from './protocol.ts';

export const EPISODE_DECISION_CAP = 3;
export const EPISODE_DURATION_MS = 60_000;
export const EPISODE_GAP_MS = 3_000;
export interface EpisodeInfo {
  state: 'OFF' | 'ACTIVE' | 'STOPPED';
  objective: string;
  requests: number;
  decisions: number;
  remaining: number;
  elapsedSeconds: number;
  lastAction: string;
  provenance: Provenance | null;
  reason: string;
}
interface Run { code: string; start: number; nextAt: number; inFlight: boolean }

/** Uses the same HTTP adapter, strict parser, navigation and abort generation as manual Ask Etta. */
export class EpisodeMindController extends MindController {
  readonly episodeInfo: EpisodeInfo = {
    state: 'OFF', objective: 'Explore the home safely', requests: 0, decisions: 0,
    remaining: EPISODE_DECISION_CAP, elapsedSeconds: 0, lastAction: 'None',
    provenance: null, reason: 'Not started.'
  };
  private run: Run | null = null;
  private internalAsk = false;
  private episodeClock: () => number;

  constructor(hooks: ConstructorParameters<typeof MindController>[0],
    fetcher?: typeof fetch, clock: () => number = () => performance.now()) {
    super(hooks, fetcher, clock);
    this.episodeClock = clock;
  }
  override get hasWork(): boolean {
    return (this.run !== null && !this.internalAsk) || super.hasWork;
  }
  override configure(enabled: boolean, message: string) {
    if (!enabled && this.run) this.cancel('Mind permission removed. Episode stopped.');
    super.configure(enabled, message);
  }
  override cancel(message = 'Stopped. Manual controls are yours.') {
    // MindController.ask internally clears its own prior proposal. That one
    // housekeeping call must not revoke the explicit episode opt-in.
    if (!(this.internalAsk && message === 'Preparing one proposal.') && this.run) {
      this.run = null; // drop the access code; abort and discard in-flight output below
      this.episodeInfo.state = 'STOPPED';
      this.episodeInfo.reason = message;
    }
    super.cancel(message);
  }
  startEpisode(code: string): boolean {
    if (!this.enabled || this.hasWork) return false;
    if (!/^[A-Za-z0-9_-]{32,128}$/.test(code)) {
      this.view.status = 'ERROR';
      this.publish('Enter the private access code before enabling autonomy.');
      return false;
    }
    this.cancel('Preparing bounded autonomy.');
    const start = this.episodeClock();
    this.episodeInfo.state = 'ACTIVE';
    this.episodeInfo.requests = 0;
    this.episodeInfo.decisions = 0;
    this.episodeInfo.remaining = EPISODE_DECISION_CAP;
    this.episodeInfo.elapsedSeconds = 0;
    this.episodeInfo.lastAction = 'None';
    this.episodeInfo.provenance = null;
    this.episodeInfo.reason = 'Owner opted in for one bounded episode.';
    this.run = { code, start, nextAt: start, inFlight: false };
    this.publish('AUTONOMY ACTIVE — up to 3 decisions in 60 seconds. Stop is always available.');
    this.tick();
    return true;
  }
  private finish(reason: string) {
    if (!this.run) return;
    this.run = null;
    this.episodeInfo.state = 'STOPPED';
    this.episodeInfo.reason = reason;
    this.view.status = this.enabled ? 'MANUAL' : 'DISABLED';
    this.publish('AUTONOMY STOPPED — ' + reason);
  }
  private async decide(run: Run) {
    try {
      this.internalAsk = true;
      await super.ask(run.code); // No retries; same request budget and provider trust boundary.
      this.internalAsk = false;
      if (this.run !== run) return;
      if (this.episodeClock() - run.start >= EPISODE_DURATION_MS) {
        this.cancel('Episode time limit reached. Late decision discarded.'); return;
      }
      const decision = this.view.decision;
      if (!decision) {
        this.cancel('Decision failed or budget was exhausted: ' + this.view.message);
        return;
      }
      this.episodeInfo.decisions++;
      this.episodeInfo.provenance = decision.provenance;
      const action = decision.proposal.action;
      this.episodeInfo.lastAction = action.type === 'MOVE_TO' ? 'MOVE_TO ' + action.targetId : action.type;
      super.approve(); // World still validates current affordances and collision-safe route.
      if (this.view.status === 'ERROR') {
        this.cancel('The world rejected the episode action.'); return;
      }
      run.nextAt = this.episodeClock() + EPISODE_GAP_MS;
      this.publish(decision.provenance + ' · ' + this.episodeInfo.lastAction + ' completed or walking.');
      // If walking, tick waits for arrival before deciding again.
      if (!this.view.moving && run.inFlight && run === this.run &&
          this.episodeInfo.requests === EPISODE_DECISION_CAP)
        this.finish('Three decisions completed.');
    } catch {
      if (this.run === run) this.cancel('Unexpected decision failure. Episode stopped.');
    } finally {
      this.internalAsk = false;
      run.inFlight = false;
    }
  }
  override tick(dt = 0) {
    super.tick(dt);
    const run = this.run;
    if (!run) return;
    const elapsed = this.episodeClock() - run.start;
    if (!this.enabled || elapsed >= EPISODE_DURATION_MS) {
      this.cancel('Episode ended at its 60-second limit or permission was lost.'); return;
    }
    const seconds = Math.max(0, Math.floor(elapsed / 1000));
    if (seconds !== this.episodeInfo.elapsedSeconds) {
      this.episodeInfo.elapsedSeconds = seconds; this.publish();
    }
    if (run.inFlight || this.view.pending || this.view.moving || this.view.decision) return;
    if (this.episodeInfo.requests === EPISODE_DECISION_CAP) {
      this.finish('Three decisions completed.'); return;
    }
    if (this.episodeClock() < run.nextAt) return;
    run.inFlight = true;
    this.episodeInfo.requests++;
    this.episodeInfo.remaining = EPISODE_DECISION_CAP - this.episodeInfo.requests;
    this.publish('AUTONOMY ACTIVE — requesting decision ' + this.episodeInfo.requests + ' of 3.');
    void this.decide(run);
  }
}
