import test from 'node:test';
import assert from 'node:assert/strict';
import { ARENA_HALF_SIZE, OBSTACLES, isPositionLegal, spawnBody, resetBody, stepBody } from '../src/simulation.ts';

const idle = { side: 0, forward: 0, run: false };
function run(body, input, cameraYaw, frames = 120, dt = 1 / 60) {
  for (let i = 0; i < frames; i++) stepBody(body, input, cameraYaw, dt);
}
test('spawn is grounded, legal and stationary', () => {
  const b = spawnBody();
  assert.equal(b.action, 'IDLE');
  assert.equal(b.grounded, true);
  assert.ok(isPositionLegal(b.x, b.z, b.radius));
});
test('W and D move relative to the third-person camera', () => {
  const b = spawnBody();
  run(b, { ...idle, forward: 1 }, 0, 40);
  assert.ok(b.z < 2.6);
  const c = spawnBody();
  run(c, { ...idle, forward: 1 }, Math.PI / 2, 40);
  assert.ok(c.x < -0.6);
  const d = spawnBody();
  run(d, { ...idle, side: 1 }, 0, 40);
  assert.ok(d.x > 0.6);
});
test('diagonal movement is not faster than forward movement', () => {
  const f = spawnBody(), diagonal = spawnBody();
  stepBody(f, { ...idle, forward: 1 }, 0, 0.016);
  stepBody(diagonal, { ...idle, forward: 1, side: 1 }, 0, 0.016);
  assert.ok(Math.abs(Math.hypot(f.vx, f.vz) - Math.hypot(diagonal.vx, diagonal.vz)) < 1e-8);
});
test('running moves faster, key release settles to a full stop', () => {
  const a = spawnBody(), b = spawnBody();
  run(a, { ...idle, forward: 1 }, 0, 25);
  run(b, { ...idle, forward: 1, run: true }, 0, 25);
  assert.ok(Math.hypot(b.vx, b.vz) > Math.hypot(a.vx, a.vz) * 1.5);
  run(a, idle, 0, 100);
  assert.ok(Math.hypot(a.vx, a.vz) < 0.001);
  assert.equal(a.action, 'IDLE');
});
test('walls keep body within arena bounds through long runs', () => {
  const b = spawnBody();
  run(b, { ...idle, forward: 1, side: 1, run: true }, 0, 3000);
  assert.ok(Math.abs(b.x) <= ARENA_HALF_SIZE - b.radius);
  assert.ok(Math.abs(b.z) <= ARENA_HALF_SIZE - b.radius);
  assert.ok(isPositionLegal(b.x, b.z, b.radius));
});
test('collider blocks body and preserves slide tangent', () => {
  const b = spawnBody(), o = OBSTACLES[0];
  b.x = o.minX - b.radius - 0.2;
  b.z = (o.minZ + o.maxZ) / 2;
  run(b, { ...idle, side: 1, run: true }, 0, 200);
  assert.ok(b.x <= o.minX - b.radius + 1e-7);
  assert.ok(isPositionLegal(b.x, b.z, b.radius));
  run(b, { ...idle, forward: 1 }, 0, 90);
  assert.ok(isPositionLegal(b.x, b.z, b.radius));
});
test('reset restores spawn and motion without leaving velocity', () => {
  const b = spawnBody();
  run(b, { ...idle, forward: 1 }, 0, 25);
  resetBody(b);
  assert.deepEqual(b, spawnBody());
});
test('frame time is bounded and results are comparable across step sizes', () => {
  const large = spawnBody(), small = spawnBody();
  stepBody(large, { ...idle, forward: 1 }, 0, 8);
  assert.ok(Math.abs(large.z - 2.6) < 0.25);
  run(small, { ...idle, forward: 1 }, 0, 60, 1 / 60);
  const coarse = spawnBody();
  run(coarse, { ...idle, forward: 1 }, 0, 30, 1 / 30);
  assert.ok(Math.abs(small.z - coarse.z) < 0.10);
});
