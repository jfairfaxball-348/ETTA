/** Shared, renderer-free contract. The server derives affordances from canonical geometry. */
import { isPositionLegal, type BodyState } from '../simulation.ts';
import { createWorld, distanceToObject, interact, INTERACTION_RANGE, type WorldState } from '../world.ts';
import { reachableDestinations, type DestinationId } from '../navigation.ts';

export type Action = { type: 'WAIT' } | { type: 'TOGGLE_LAMP'; targetId: 'lamp' } | { type: 'MOVE_TO'; targetId: DestinationId };
export interface Proposal { action: Action; reason: string }
export interface Snapshot { version: 1; body: { x: number; z: number; yaw: number }; lampOn: boolean }
export type Provenance = 'MODEL_DECISION' | 'TEST_FIXTURE';
export interface Decision { provenance: Provenance; proposal: Proposal; model: string; elapsedMs: number }
export const PROPOSAL_TTL_MS = 60_000;

export function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function keys(value: Record<string, unknown>, expected: string[]): boolean {
  return Object.keys(value).length === expected.length && expected.every(key => Object.hasOwn(value, key));
}
export function snapshot(body: BodyState, world: WorldState): Snapshot {
  return { version: 1, body: { x: body.x, z: body.z, yaw: Math.atan2(Math.sin(body.yaw), Math.cos(body.yaw)) }, lampOn: world.lampOn };
}
export function parseSnapshot(value: unknown): Snapshot {
  if (!record(value) || !keys(value, ['version', 'body', 'lampOn']) || value.version !== 1 ||
      typeof value.lampOn !== 'boolean' || !record(value.body) || !keys(value.body, ['x', 'z', 'yaw'])) {
    throw new Error('Invalid world snapshot.');
  }
  const { x, z, yaw } = value.body;
  if (typeof x !== 'number' || typeof z !== 'number' || typeof yaw !== 'number' ||
      !isPositionLegal(x, z) || !Number.isFinite(yaw) || Math.abs(yaw) > Math.PI) {
    throw new Error('Invalid body position or facing.');
  }
  return { version: 1, body: { x, z, yaw }, lampOn: value.lampOn };
}
export function observe(state: Snapshot) {
  const nearby = createWorld().objects
    .filter(o => !['floor', 'wall', 'threshold', 'rug'].includes(o.kind))
    .map(o => ({ id: o.id, label: o.label, distance: distanceToObject(state.body.x, state.body.z, o) }))
    .filter(o => o.distance <= 2.15).sort((a, b) => a.distance - b.distance);
  const validActions: Action[] = [{ type: 'WAIT' }];
  if (nearby.some(o => o.id === 'lamp' && o.distance <= INTERACTION_RANGE)) {
    validActions.push({ type: 'TOGGLE_LAMP', targetId: 'lamp' });
  }
  const destinations=reachableDestinations(state.body);
  for (const place of destinations) validActions.push({ type: 'MOVE_TO', targetId: place.id });
  return { body: state.body, nearby, lampOn: state.lampOn, destinations: destinations.map(d=>({id:d.id,label:d.label})), validActions };
}
export function parseProposal(value: unknown, state: Snapshot): Proposal {
  if (!record(value) || !keys(value, ['action', 'reason']) || !record(value.action) ||
      typeof value.reason !== 'string' || !value.reason.trim() || value.reason.length > 240) {
    throw new Error('Invalid proposal format.');
  }
  const action = value.action;
  let parsed: Action;
  if (action.type === 'WAIT' && keys(action, ['type'])) parsed = { type: 'WAIT' };
  else if (action.type === 'TOGGLE_LAMP' && action.targetId === 'lamp' && keys(action, ['type', 'targetId'])) {
    parsed = { type: 'TOGGLE_LAMP', targetId: 'lamp' };
  } else if (action.type === 'MOVE_TO' && (action.targetId === 'rug' || action.targetId === 'table') && keys(action, ['type','targetId'])) {
    parsed = {type:'MOVE_TO', targetId:action.targetId};
  } else throw new Error('Unknown action or target.');
  if (!observe(state).validActions.some(a => a.type === parsed.type &&
    (a.type === 'WAIT' || ('targetId' in parsed && a.targetId === parsed.targetId)))) throw new Error('Action is not currently permitted.');
  return { action: parsed, reason: value.reason.trim() };
}
export function sameSnapshot(a: Snapshot, b: Snapshot): boolean {
  return a.body.x === b.body.x && a.body.z === b.body.z && a.body.yaw === b.body.yaw && a.lampOn === b.lampOn;
}
/** Called only after manual approval; still rechecks live world permissions. */
export function applyProposal(value: Proposal, body: BodyState, world: WorldState): boolean {
  const { action } = parseProposal(value, snapshot(body, world));
  if (action.type === 'WAIT') return true;
  if (action.type === 'TOGGLE_LAMP') return interact(world, body.x, body.z, action.targetId);
  return false; // MOVE_TO is handled only by the deterministic NavigationRunner.
}
