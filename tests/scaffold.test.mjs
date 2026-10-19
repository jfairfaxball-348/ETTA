import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd(), read = p => readFileSync(join(root, p), 'utf8');

test('S008.5 CI closed out and installed complete deferred S009 scope', () => {
  const state = JSON.parse(read('authoritative/STATE.json'));
  const roadmap = read('ROADMAP.md');
  const nextPrompt = read('authoritative/NEXT_SESSION_PROMPT.md');
  const closeout = read('sessions/S008/CLOSEOUT.md');
  const s0085 = read('sessions/S008.5/CLOSEOUT.md');
  const deferred = read('authoritative/DEFERRED_S009_PROMPT.md');
  assert.equal(state.project, 'ETTA');
  assert.equal(state.last_completed_session, 'S008.5');
  assert.equal(state.last_executed_session, 'S008.5');
  assert.match(state.last_session_status, /S008_5/);
  assert.equal(state.next_session, 'S009');
  assert.equal(state.next_session_status, 'INSTALLED_FUTURE_NOT_EXECUTED');
  assert.match(nextPrompt, /S009.*FUTURE \/ NOT EXECUTED/);
  assert.match(deferred, /S009.*FUTURE \/ NOT EXECUTED/);
  assert.ok(closeout.includes(deferred), 'Historical S008 closeout retains full original S009 prompt');
  assert.ok(s0085.includes('S009'), 'S008.5 closeout hands over intact S009 target');
  assert.match(read('sessions/S008.5/VALIDATION.md'), /CI_PASS/);
  assert.match(nextPrompt, /four-digit/i);
  assert.match(nextPrompt, /avatar-eye/i);
  assert.match(roadmap, /Owner-approved direction/);
  for (let s = 7; s <= 14; s++) assert.ok(roadmap.includes('S' + String(s).padStart(3, '0')));
  for (const phase of ['P0','P1','P2','P3','P4','P5']) {
    assert.ok(state.phases[phase]);
    assert.match(roadmap, new RegExp(phase));
  }
  assert.match(read('docs/PHASE_GATES.md'), /OWNER_REPORTED/);
  assert.match(roadmap, /not Google's Gemma quota/);
});
test('body modules and S002 evidence spine exist', () => {
  for (const path of [
    'src/main.ts','src/world.ts','src/simulation.ts','src/scene.ts','src/camera.ts','src/input.ts','src/style.css',
    'sessions/S002/INPUT.md','sessions/S002/PLAN.md','sessions/S002/VALIDATION.md',
    'sessions/S002/REVIEW.md','sessions/S002/CLOSEOUT.md',
    'sessions/S003/INPUT.md','sessions/S003/PLAN.md','sessions/S003/VALIDATION.md',
    'sessions/S003/REVIEW.md','sessions/S003/CLOSEOUT.md',
    'sessions/S004/INPUT.md','sessions/S004/PLAN.md','sessions/S004/VALIDATION.md',
    'sessions/S004/REVIEW.md','sessions/S004/CLOSEOUT.md',
    'sessions/S005/INPUT.md','sessions/S005/PLAN.md','sessions/S005/VALIDATION.md',
    'sessions/S005/REVIEW.md','sessions/S005/CLOSEOUT.md',
    'sessions/S006/INPUT.md','sessions/S006/PLAN.md','sessions/S006/VALIDATION.md',
    'sessions/S006/REVIEW.md','sessions/S006/CLOSEOUT.md',
    'sessions/S007/INPUT.md','sessions/S007/PLAN.md','sessions/S007/VALIDATION.md',
    'sessions/S007/REVIEW.md','sessions/S007/CLOSEOUT.md',
    'sessions/S008/INPUT.md','sessions/S008/PLAN.md','sessions/S008/VALIDATION.md',
    'sessions/S008/REVIEW.md','sessions/S008/CLOSEOUT.md','src/mind/episode.ts','tests/episode.test.mjs',
    'src/navigation.ts','tests/navigation.test.mjs',
    'tests/browser-smoke.mjs','docs/ARCHITECTURE.md',
    'docs/DECISIONS.md','docs/PHASE_GATES.md','docs/OPERATIONS.md'
  ]) assert.ok(existsSync(join(root, path)), path);
});
test('manual control is explicit; code has explicit manual operation, without a claimed AI mind', () => {
  assert.match(read('index.html'), /MANUAL · NO AUTONOMY/);
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
