import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd(), read = p => readFileSync(join(root, p), 'utf8');

test('authoritative S004 state agrees with next S005 instruction', () => {
  const state = JSON.parse(read('authoritative/STATE.json'));
  assert.equal(state.project, 'ETTA');
  assert.equal(state.last_completed_session, 'S004');
  assert.equal(state.next_session, 'S005');
  assert.equal(state.next_session_status, 'INSTALLED_FUTURE_NOT_EXECUTED');
  assert.match(read('authoritative/NEXT_SESSION_PROMPT.md'), /S005.*FUTURE \/ NOT EXECUTED/);
  for (const phase of ['P0','P1','P2','P3','P4','P5']) {
    assert.ok(state.phases[phase]);
    assert.match(read('ROADMAP.md'), new RegExp(phase));
  }
});
test('body modules and S002 evidence spine exist', () => {
  for (const path of [
    'src/main.ts','src/world.ts','src/simulation.ts','src/scene.ts','src/camera.ts','src/input.ts','src/style.css',
    'sessions/S002/INPUT.md','sessions/S002/PLAN.md','sessions/S002/VALIDATION.md',
    'sessions/S002/REVIEW.md','sessions/S002/CLOSEOUT.md',
    'sessions/S003/INPUT.md','sessions/S003/PLAN.md','sessions/S003/VALIDATION.md',
    'sessions/S003/REVIEW.md','sessions/S003/CLOSEOUT.md',
    'sessions/S004/INPUT.md','sessions/S004/PLAN.md','sessions/S004/VALIDATION.md',
    'sessions/S004/REVIEW.md','sessions/S004/CLOSEOUT.md','tests/browser-smoke.mjs','docs/ARCHITECTURE.md',
    'docs/DECISIONS.md','docs/PHASE_GATES.md','docs/OPERATIONS.md'
  ]) assert.ok(existsSync(join(root, path)), path);
});
test('manual control is explicit; code has explicit manual operation, without a claimed AI mind', () => {
  assert.match(read('index.html'), /MANUAL \/ DEV/);
  assert.match(read('index.html'), /data-direction="forward"/);
  assert.match(read('src/main.ts'), /WEBGL UNAVAILABLE/);
  assert.match(read('src/input.ts'), /visibilitychange/);
  assert.match(read('src/input.ts'), /pointercancel/);
  assert.match(read('src/simulation.ts'), /HOME_OBJECTS/);
});
test('project keeps credentials outside browser bundle', () => {
  assert.match(read('.gitignore'), /^\.env\s*$/m);
  assert.match(read('.env.example'), /^GEMINI_API_KEY=\s*$/m);
  for (const path of ['src/main.ts', 'src/simulation.ts', 'index.html', 'README.md']) {
    assert.doesNotMatch(read(path), /AQ\.[A-Za-z0-9_-]{20,}/);
  }
});
