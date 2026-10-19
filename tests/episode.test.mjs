import test from 'node:test';
import assert from 'node:assert/strict';
import { EpisodeMindController, EPISODE_GAP_MS, EPISODE_DURATION_MS } from '../src/mind/episode.ts';
import { spawnBody } from '../src/simulation.ts';
import { createWorld } from '../src/world.ts';
import { snapshot, applyProposal } from '../src/mind/protocol.ts';
import { NavigationRunner } from '../src/navigation.ts';

const code = 'fixture-access-code-never-a-real-secret';
const wait = { action: { type: 'WAIT' }, reason: 'Test fixture. No live model.' };
const lamp = { action: { type: 'TOGGLE_LAMP', targetId: 'lamp' }, reason: 'Test fixture.' };
const rug = { action: { type: 'MOVE_TO', targetId: 'rug' }, reason: 'Test fixture.' };
const fixture = proposal => Response.json({ provenance: 'TEST_FIXTURE', proposal, model: 'fixture-only', elapsedMs: 1 });
const flush = () => new Promise(resolve => setImmediate(resolve));
function setup(fetcher = async () => fixture(wait)) {
  let now = 0, calls = 0;
  const body = spawnBody(), world = createWorld(), navigation = new NavigationRunner(body);
  const controller = new EpisodeMindController({
    snapshot: () => snapshot(body, world),
    apply: proposal => applyProposal(proposal, body, world),
    stop: () => { body.vx = body.vz = 0; body.action = 'IDLE'; },
    navigation, changed: () => {}
  }, (...args) => { calls++; return fetcher(...args); }, () => now);
  controller.configure(true, 'Fixture enabled.');
  return { controller, body, world, navigation, get calls() { return calls; }, setNow: value => { now = value; } };
}

test('default OFF, explicit consent, three requests maximum and at least 3s between choices', async () => {
  const t = setup();
  assert.equal(t.controller.episodeInfo.state, 'OFF');
  t.controller.tick();
  assert.equal(t.calls, 0);
  assert.equal(t.controller.startEpisode(code), true);
  assert.equal(t.controller.startEpisode(code), false, 'No overlapping episode');
  await flush();
  assert.equal(t.calls, 1);
  assert.equal(t.controller.episodeInfo.decisions, 1);
  assert.equal(t.controller.view.decision, null, 'No stale manual approval');
  t.setNow(EPISODE_GAP_MS - 1); t.controller.tick();
  assert.equal(t.calls, 1, 'WAIT must not spin');
  t.setNow(EPISODE_GAP_MS); t.controller.tick(); await flush();
  assert.equal(t.calls, 2);
  t.setNow(EPISODE_GAP_MS * 2); t.controller.tick(); await flush();
  assert.equal(t.calls, 3);
  assert.equal(t.controller.episodeInfo.state, 'STOPPED');
  assert.equal(t.controller.episodeInfo.requests, 3);
  assert.equal(t.controller.episodeInfo.decisions, 3);
  t.setNow(EPISODE_GAP_MS * 100); t.controller.tick();
  assert.equal(t.calls, 3);
  assert.equal(t.controller.hasWork, false);
});

test('finite route must complete before second request; manual override cancels route', async () => {
  let n = 0;
  const t = setup(async () => fixture(++n === 1 ? rug : wait));
  t.controller.startEpisode(code); await flush();
  assert.equal(t.controller.view.moving, true);
  t.setNow(10_000);
  t.controller.tick(0.016);
  assert.equal(t.calls, 1, 'Cannot overlap a live walk');
  let iterations = 0;
  while (t.controller.view.moving && iterations++ < 500) t.controller.tick(0.05);
  assert.equal(t.controller.view.moving, false);
  t.controller.tick(); await flush();
  assert.equal(t.calls, 2);
  assert.equal(t.controller.episodeInfo.provenance, 'TEST_FIXTURE');
  t.controller.cancel('Manual movement took over.');
  assert.equal(t.controller.episodeInfo.state, 'STOPPED');
  assert.equal(t.navigation.active, false);
  assert.equal(t.controller.hasWork, false);
});

test('Stop aborts pending fetch; a stale provider response never executes', async () => {
  let release;
  const t = setup(() => new Promise(resolve => { release = resolve; }));
  t.controller.startEpisode(code);
  assert.equal(t.calls, 1);
  t.controller.cancel('Stopped by owner.');
  release(fixture(lamp)); await flush();
  assert.equal(t.world.lampOn, true);
  assert.equal(t.controller.episodeInfo.state, 'STOPPED');
  assert.equal(t.controller.view.decision, null);
  t.setNow(9000); t.controller.tick();
  assert.equal(t.calls, 1);
});

test('deadline cancels in-flight work and discards late response', async () => {
  let release;
  const t = setup(() => new Promise(resolve => { release = resolve; }));
  t.controller.startEpisode(code);
  t.setNow(EPISODE_DURATION_MS); t.controller.tick();
  assert.equal(t.controller.episodeInfo.state, 'STOPPED');
  release(fixture(lamp)); await flush();
  assert.equal(t.world.lampOn, true);
  assert.equal(t.calls, 1);
});

test('quota rejection, malformed action and missing permission stop with no fallback/retry', async () => {
  for (const response of [
    () => Response.json({ message: 'Budget exhausted' }, { status: 429 }),
    () => fixture({ action: { type: 'TELEPORT', x: 99 }, reason: 'Invalid fixture' }),
    () => fixture({ action: { type: 'TOGGLE_LAMP', targetId: 'plant' }, reason: 'Invalid fixture' })
  ]) {
    const t = setup(async () => response());
    t.controller.startEpisode(code); await flush();
    assert.equal(t.calls, 1);
    assert.equal(t.controller.episodeInfo.state, 'STOPPED');
    assert.equal(t.world.lampOn, true);
    t.setNow(30_000); t.controller.tick();
    assert.equal(t.calls, 1);
  }
});

test('permission removal and invalid access code fail closed', async () => {
  const t = setup(async () => fixture(wait));
  assert.equal(t.controller.startEpisode('short'), false);
  assert.equal(t.calls, 0);
  t.controller.startEpisode(code); await flush();
  t.controller.configure(false, 'Disabled');
  assert.equal(t.controller.episodeInfo.state, 'STOPPED');
  t.setNow(9000); t.controller.tick();
  assert.equal(t.calls, 1);
});
