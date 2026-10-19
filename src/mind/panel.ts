import { EpisodeMindController } from './episode.ts';
import { applyProposal, snapshot, record } from './protocol.ts';
import type { BodyState } from '../simulation.ts';
import { NavigationRunner, destination } from '../navigation.ts';
import type { WorldState } from '../world.ts';

/** The UI is scene-first. The PIN is tab-memory-only and is never persisted. */
export function attachMindPanel(body: BodyState, world: WorldState,
  captureVision?: () => { mimeType: 'image/jpeg'; data: string; width: number; height: number }) {
  function el<T extends HTMLElement>(id: string): T {
    const node = document.getElementById(id);
    if (!node) throw new Error('Mind panel is missing ' + id);
    return node as T;
  }
  const ask = el<HTMLButtonElement>('ask-etta');
  const approve = el<HTMLButtonElement>('approve-proposal');
  const autonomy = el<HTMLButtonElement>('start-episode');
  const code = el<HTMLInputElement>('mind-access-code');
  const aiSwitch = el<HTMLButtonElement>('ai-switch');
  const accessArea = el<HTMLElement>('mind-access-area');
  const navigator = new NavigationRunner(body);
  let accessMode: 'PIN' | 'LEGACY' = 'PIN';
  let aiOn = false;
  let ready = false;
  const controller = new EpisodeMindController({
    navigation: navigator,
    captureVision,
    snapshot: () => snapshot(body, world),
    stop: () => { body.vx = 0; body.vz = 0; body.action = 'IDLE'; },
    apply: proposal => applyProposal(proposal, body, world),
    changed: view => {
      const available = ready && (accessMode === 'LEGACY' || aiOn);
      el('mind-status').textContent = !ready ? 'DISABLED' : !available && accessMode === 'PIN' ? 'AI OFF' :
        controller.episodeInfo.state === 'ACTIVE' ? 'AUTONOMY ACTIVE' : view.status;
      el('mind-message').textContent = view.message;
      el('mind-panel').setAttribute('aria-busy', String(view.pending));
      ask.disabled = !controller.enabled || !available || controller.hasWork;
      autonomy.disabled = !controller.enabled || !available || controller.hasWork;
      approve.disabled = !view.decision || controller.episodeInfo.state === 'ACTIVE';
      const decision = view.decision;
      const action = decision?.proposal.action;
      const label = action?.type === 'MOVE_TO' ? 'Walk to ' + (destination(action.targetId)?.label ?? action.targetId) :
        action?.type === 'WAIT' ? 'Wait here' : 'Switch the nearby lamp';
      el('mind-proposal').textContent = decision ? label + ' — ' + decision.proposal.reason :
        view.moving ? 'Walking to ' + view.destination + ' (Stop or steering interrupts).' : '';
      el('mind-meta').textContent = decision ? `${decision.provenance} · ${decision.model} · ${Math.round(decision.elapsedMs)} ms` :
        controller.episodeInfo.provenance ? 'Last episode: ' + controller.episodeInfo.provenance : '';
      const ep = controller.episodeInfo;
      el('episode-observation').textContent = ep.state + ' · Objective: ' + ep.objective +
        ' · Decisions ' + ep.decisions + '/3 · Requests ' + ep.requests +
        ' · Elapsed ' + ep.elapsedSeconds + 's / 60s · Last: ' + ep.lastAction + ' · ' + ep.reason;
      el('mode-status').textContent = ep.state === 'ACTIVE' ?
        'AUTONOMY ACTIVE · 3 DECISIONS / 60s MAX' : 'MANUAL · NO AUTONOMY';
      el('mind-observation').textContent = view.observation ? JSON.stringify(view.observation, null, 2) : 'No observation sent.';
      el('mind-history').textContent = view.history.join('\n');
      aiSwitch.textContent = accessMode === 'LEGACY' ? 'LEGACY ACCESS' : aiOn ? 'AI ON' : 'AI OFF';
      aiSwitch.setAttribute('aria-pressed', String(aiOn));
      aiSwitch.disabled = !ready;
    }
  });
  function repaint(message?: string) {
    if (message) el('mind-message').textContent = message;
    // Refresh the controller view by a harmless configure only when not in motion.
    aiSwitch.textContent = accessMode === 'LEGACY' ? 'LEGACY ACCESS' : aiOn ? 'AI ON' : 'AI OFF';
    aiSwitch.setAttribute('aria-pressed', String(aiOn));
    const enabled = ready && (accessMode === 'LEGACY' || aiOn) && controller.enabled;
    ask.disabled = !enabled || controller.hasWork;
    autonomy.disabled = !enabled || controller.hasWork;
    el('mind-status').textContent = !ready ? 'DISABLED' : accessMode === 'PIN' && !aiOn ? 'AI OFF' : controller.view.status;
  }
  async function unlock() {
    if (!ready) return;
    if (accessMode !== 'PIN') { aiOn = true; repaint(); return; }
    const pin = code.value;
    if (!/^\d{4}$/.test(pin)) {
      repaint('Enter exactly four digits to turn AI on.');
      code.focus(); return;
    }
    const button = el<HTMLButtonElement>('pin-unlock');
    button.disabled = true; aiSwitch.disabled = true;
    try {
      const response = await fetch('/api/decision', {
        method:'POST', cache:'no-store', signal:AbortSignal.timeout(7000),
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${pin}`},
        body:JSON.stringify({kind:'unlock'})
      });
      const value: unknown = await response.json();
      if (!response.ok || !record(value) || value.status !== 'UNLOCKED') {
        throw new Error(record(value) && typeof value.message === 'string' ?
          value.message.slice(0,160) : 'PIN was not accepted.');
      }
      aiOn = true; accessArea.hidden = true;
      repaint('AI ON. Ask Etta for a choice, or start one short supervised episode.');
    } catch (error) {
      aiOn = false;
      repaint(error instanceof Error ? error.message : 'PIN could not be verified.');
    } finally {
      button.disabled = false; aiSwitch.disabled = !ready;
    }
  }
  aiSwitch.addEventListener('click', () => {
    if (!ready) return;
    if (aiOn) {
      aiOn = false; code.value = ''; controller.cancel('AI OFF. Manual controls remain available.');
      accessArea.hidden = true; repaint(); return;
    }
    if (accessMode === 'LEGACY') { accessArea.hidden = false; code.focus(); return; }
    accessArea.hidden = false; code.focus();
    if (/^\d{4}$/.test(code.value)) void unlock();
    else repaint('Enter your four-digit private PIN to enable AI.');
  });
  el<HTMLButtonElement>('pin-unlock').addEventListener('click', () => { void unlock(); });
  code.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); void unlock(); } });
  ask.addEventListener('click', () => { if (accessMode === 'LEGACY' || aiOn) void controller.ask(code.value.trim()); });
  autonomy.addEventListener('click', () => { if (accessMode === 'LEGACY' || aiOn) controller.startEpisode(code.value.trim()); });
  approve.addEventListener('click', () => controller.approve());
  el('stop-mind').addEventListener('click', () => controller.cancel());
  el('lock-mind').addEventListener('click', () => {
    code.value = ''; aiOn = false; controller.cancel('Access cleared from this tab.');
    if (accessMode === 'PIN') accessArea.hidden = true;
    repaint();
  });
  window.addEventListener('blur', () => { if (controller.hasWork) controller.cancel('Paused when the window lost focus.'); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && controller.hasWork) controller.cancel('Paused while this tab was hidden.');
  });
  window.addEventListener('pagehide', () => { code.value = ''; aiOn = false; controller.cancel(); }, { once: true });
  void fetch('/api/decision', { cache: 'no-store', signal: AbortSignal.timeout(5000) }).then(async response => {
    const data: unknown = await response.json();
    if (!response.ok || !record(data) || !['READY','DISABLED'].includes(data.status as string) ||
        typeof data.message !== 'string') throw new Error();
    ready = data.status === 'READY';
    accessMode = data.accessMode === 'LEGACY' ? 'LEGACY' : 'PIN';
    // Safe deployment transition: until ETTA_ACCESS_PIN exists server-side,
    // the old long token still works in an explicitly labelled legacy field.
    if (ready && accessMode === 'LEGACY') {
      accessArea.hidden = false; aiOn = true;
      code.maxLength = 128; code.inputMode = 'text'; code.placeholder = 'Existing site access code';
      el('mind-access-area').querySelector('label')!.textContent = 'Legacy access code';
    }
    controller.configure(ready, data.message.slice(0,240));
    repaint();
  }).catch(() => { ready = false; controller.configure(false, 'Mind connection is unavailable. Manual controls still work.'); repaint(); });
  return controller;
}
