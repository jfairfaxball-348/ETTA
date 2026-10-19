import { EpisodeMindController } from './episode.ts';
import { applyProposal, snapshot, record } from './protocol.ts';
import type { BodyState } from '../simulation.ts';
import { NavigationRunner, destination } from '../navigation.ts';
import type { WorldState } from '../world.ts';

export function attachMindPanel(body: BodyState, world: WorldState) {
  function el<T extends HTMLElement>(id: string): T {
    const node = document.getElementById(id);
    if (!node) throw new Error('Mind panel is missing ' + id);
    return node as T;
  }
  const ask = el<HTMLButtonElement>('ask-etta');
  const approve = el<HTMLButtonElement>('approve-proposal');
  const autonomy = el<HTMLButtonElement>('start-episode');
  const code = el<HTMLInputElement>('mind-access-code');
  const navigator = new NavigationRunner(body);
  const controller = new EpisodeMindController({
    navigation: navigator,
    snapshot: () => snapshot(body, world),
    stop: () => { body.vx = 0; body.vz = 0; body.action = 'IDLE'; },
    apply: proposal => applyProposal(proposal, body, world),
    changed: view => {
      el('mind-status').textContent = controller.episodeInfo.state === 'ACTIVE' ? 'AUTONOMY ACTIVE' : view.status;
      el('mind-message').textContent = view.message;
      el('mind-panel').setAttribute('aria-busy', String(view.pending));
      ask.disabled = !controller.enabled || controller.hasWork;
      autonomy.disabled = !controller.enabled || controller.hasWork;
      approve.disabled = !view.decision || controller.episodeInfo.state === 'ACTIVE';
      const decision = view.decision;
      const action = decision?.proposal.action;
      const label = action?.type === 'MOVE_TO' ? 'Walk to ' + (destination(action.targetId)?.label ?? action.targetId) :
        action?.type === 'WAIT' ? 'Wait here' : 'Switch the nearby lamp';
      el('mind-proposal').textContent = decision ? label + ' — ' + decision.proposal.reason :
        view.moving ? 'Walking to ' + view.destination + ' (Stop or manual movement interrupts).' : 'No action awaiting approval.';
      el('mind-meta').textContent = decision ? `${decision.provenance} · ${decision.model} · ${Math.round(decision.elapsedMs)} ms` : controller.episodeInfo.provenance ? 'Last episode provenance: ' + controller.episodeInfo.provenance : '';
      const ep = controller.episodeInfo;
      el('episode-observation').textContent = ep.state + ' · Objective: ' + ep.objective +
        ' · Decisions ' + ep.decisions + '/3 · Requests ' + ep.requests + ' · Remaining ' + ep.remaining +
        ' · Elapsed ' + ep.elapsedSeconds + 's / 60s · Last: ' + ep.lastAction + ' · ' + ep.reason;
      el('mode-status').textContent = ep.state === 'ACTIVE' ?
        'AUTONOMY ACTIVE · 3 DECISIONS MAX / 60s · STOP AVAILABLE' : 'MANUAL / DEV · NO AUTONOMY (' + ep.state + ')';
      el('mind-observation').textContent = view.observation ? JSON.stringify(view.observation, null, 2) : 'Ask Etta to capture the room as she can observe it.';
      el('mind-history').textContent = view.history.join('\n');
    }
  });
  ask.addEventListener('click', () => { void controller.ask(code.value.trim()); });
  autonomy.addEventListener('click', () => { controller.startEpisode(code.value.trim()); });
  approve.addEventListener('click', () => controller.approve());
  el('stop-mind').addEventListener('click', () => controller.cancel());
  el('lock-mind').addEventListener('click', () => { code.value = ''; controller.cancel('Access code cleared from this tab.'); });
  window.addEventListener('blur', () => { if (controller.hasWork) controller.cancel('Paused when the window lost focus.'); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && controller.hasWork) controller.cancel('Paused while this tab was hidden.'); });
  window.addEventListener('pagehide', () => { code.value = ''; controller.cancel(); }, { once: true });
  void fetch('/api/decision', { cache: 'no-store', signal: AbortSignal.timeout(5000) }).then(async response => {
    const data: unknown = await response.json();
    if (!response.ok || !record(data) || !['READY', 'DISABLED'].includes(data.status as string) || typeof data.message !== 'string') throw new Error();
    controller.configure(data.status === 'READY', data.message.slice(0, 240));
  }).catch(() => controller.configure(false, 'Mind connection is unavailable. Manual controls still work.'));
  return controller;
}
