/** World-owned, deterministic body state. No Three.js and no model dependency. */
export interface Vec2 { x: number; z: number }
export interface Obstacle { minX: number; maxX: number; minZ: number; maxZ: number }
export interface BodyState {
  x: number; z: number; vx: number; vz: number; yaw: number;
  radius: number; grounded: boolean; action: 'IDLE' | 'WALK' | 'RUN';
}
export interface ManualIntent { side: number; forward: number; run: boolean }
export const ARENA_HALF_SIZE = 7.5;
export const OBSTACLES: readonly Obstacle[] = [
  { minX: -2.2, maxX: -0.6, minZ: -3.3, maxZ: -1.7 },
  { minX: 2.0, maxX: 3.1, minZ: 0.8, maxZ: 2.4 }
];
const WALK_SPEED = 2.5, RUN_SPEED = 4.4, ACCELERATION = 13;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export function spawnBody(): BodyState {
  return { x: 0, z: 2.6, vx: 0, vz: 0, yaw: 0, radius: 0.32, grounded: true, action: 'IDLE' };
}
export function resetBody(body: BodyState): void { Object.assign(body, spawnBody()); }
function overlaps(x: number, z: number, radius: number, o: Obstacle): boolean {
  return x > o.minX - radius && x < o.maxX + radius && z > o.minZ - radius && z < o.maxZ + radius;
}
export function isPositionLegal(x: number, z: number, radius = 0.32): boolean {
  if (Math.abs(x) > ARENA_HALF_SIZE - radius || Math.abs(z) > ARENA_HALF_SIZE - radius) return false;
  return !OBSTACLES.some(o => overlaps(x, z, radius, o));
}
/** Collision is solved separately on X then Z, allowing wall sliding.
 * dt capped at 50ms, avoiding resume-frame penetration or teleportation.
 */
export function stepBody(body: BodyState, intent: ManualIntent, cameraYaw: number, rawDt: number): void {
  const dt = clamp(Number.isFinite(rawDt) ? rawDt : 0, 0, 0.05);
  if (!dt) return;
  let side = clamp(Number.isFinite(intent.side) ? intent.side : 0, -1, 1);
  let forward = clamp(Number.isFinite(intent.forward) ? intent.forward : 0, -1, 1);
  const length = Math.hypot(side, forward);
  if (length > 1) { side /= length; forward /= length; }
  const yaw = Number.isFinite(cameraYaw) ? cameraYaw : 0;
  const dx = side * Math.cos(yaw) - forward * Math.sin(yaw);
  const dz = -side * Math.sin(yaw) - forward * Math.cos(yaw);
  const speed = intent.run ? RUN_SPEED : WALK_SPEED;
  const blend = 1 - Math.exp(-ACCELERATION * dt);
  body.vx += (dx * speed - body.vx) * blend;
  body.vz += (dz * speed - body.vz) * blend;
  let nx = clamp(body.x + body.vx * dt, -ARENA_HALF_SIZE + body.radius, ARENA_HALF_SIZE - body.radius);
  if (OBSTACLES.some(o => overlaps(nx, body.z, body.radius, o))) { nx = body.x; body.vx = 0; }
  body.x = nx;
  let nz = clamp(body.z + body.vz * dt, -ARENA_HALF_SIZE + body.radius, ARENA_HALF_SIZE - body.radius);
  if (OBSTACLES.some(o => overlaps(body.x, nz, body.radius, o))) { nz = body.z; body.vz = 0; }
  body.z = nz;
  const motion = Math.hypot(body.vx, body.vz);
  if (motion > 0.06) {
    const target = Math.atan2(body.vx, -body.vz);
    const delta = Math.atan2(Math.sin(target - body.yaw), Math.cos(target - body.yaw));
    body.yaw += delta * (1 - Math.exp(-11 * dt));
  }
  body.grounded = true; // Flat arena; no vertical physics in S002.
  body.action = motion < 0.08 ? 'IDLE' : intent.run && length > 0 ? 'RUN' : 'WALK';
}
