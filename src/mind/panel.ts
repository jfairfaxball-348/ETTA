import { MindController } from './controller.ts';
import { applyProposal, snapshot, record } from './protocol.ts';
import type { BodyState } from '../simulation.ts';
import type { WorldState } from '../world.ts';

export function attachMindPanel(body: BodyState, world: WorldState) {
  function el<T extends HTMLElement>(id: string): T {
    const node = document.getElementById(id);
    if (!node) throw new Error('Mind panel is missing ' + id);
    return node as T;
  }
  const ask = el<HTMLButtonElement>('ask-etta');
  const approve = el<HTMLButtonElement>('approve-proposal');
  const code = el<HTMLInputElement>('mind-access-code');
  const controller = new MindController({
    snapshot: () => snapshot(body, world),
    stop: () => { body.vx = 0; body.vz = 0; body.action = 'IDLE'; },
    apply: proposal => applyProposal(proposal, body, world),
    changed: view => {
      el('mind-status').textContent = view.status;
      el('mind-message').textContent = view.message;
      el('mind-panel').setAttribute('aria-busy', String(view.pending));
      ask.disabled = !controller.enabled || view.pending;
      approve.disabled = !view.decision;
      const decision = view.decision;
      el('mind-proposal').textContent = decision ?
        `${decision.proposal.action.type === 'WAIT' ? 'Wait here' : 'Switch the nearby lamp'} — ${decision.proposal.reason}` : 'No action awaiting approval.';
      el('mind-meta').textContent = decision ? `${decision.provenance} · ${decision.model} · ${Math.round(decision.elapsedMs)} ms` : '';
      el('mind-observation').textContent = view.observation ? JSON.stringify(view.observation, null, 2) : 'Ask Etta to capture the room as she can observe it.';
      el('mind-history').textContent = view.history.join('\n');
    }
  });
  ask.addEventListener('click', () => { void controller.ask(code.value.trim()); });
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
