import './style.css';
import { createStage } from './scene';
import { spawnBody, resetBody, stepBody } from './simulation';
import { FollowCamera } from './camera';
import { ManualControls } from './input';
import { createWorld, resetWorld, nearbyObject, interact, INTERACTION_RANGE } from './world';
import { attachMindPanel } from './mind/panel';
import type { MindController } from './mind/controller';

function required<T extends HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error('ETTA markup missing: ' + selector);
  return el;
}
const mount = required<HTMLDivElement>('#scene');
const renderStatus = required<HTMLElement>('#render-status');
const hud = required<HTMLElement>('#debug-hud');
const telemetry = required<HTMLElement>('#telemetry');
const mode = required<HTMLElement>('#mode-status');
const reset = required<HTMLButtonElement>('#reset-button');
const toggle = required<HTMLButtonElement>('#hud-toggle');
const body = spawnBody();
const world = createWorld();
let mind: MindController | undefined;
const objectName = required<HTMLElement>('#object-name');
const objectDetail = required<HTMLElement>('#object-detail');
const interactButton = required<HTMLButtonElement>('#interact-button');
function manualInteract() {
  mind?.cancel('Manual lamp control took over.');
  const nearby=nearbyObject(world,body.x,body.z);
  if(nearby) interact(world,body.x,body.z,nearby.object.id);
}
interactButton.addEventListener('click',manualInteract);
const cameraRig = new FollowCamera();
let visible = false;
hud.hidden = true;
toggle.setAttribute('aria-pressed', 'false');
mode.textContent = 'MANUAL / DEV · NO AUTONOMY (OFF)';
try {
  const stage = createStage(mount);
  mind = attachMindPanel(body, world, () => stage.captureEye(body));
  const control = new ManualControls(mount, {
    orbit: (dx, dy) => cameraRig.orbit(dx, dy),
    zoom: delta => cameraRig.zoom(delta),
    reset: () => { mind?.cancel('Room reset.'); resetBody(body); resetWorld(world); cameraRig.reset(); },
    interact: manualInteract,
    toggleHud: () => {
      visible = !visible; hud.hidden = !visible;
      toggle.setAttribute('aria-pressed', String(visible));
    }
  });
  document.getElementById('ask-etta')?.addEventListener('click', () => control.clear());
  document.getElementById('start-episode')?.addEventListener('click', () => control.clear());
  document.getElementById('stop-mind')?.addEventListener('click', () => control.clear());
  reset.addEventListener('click', () => {
    mind?.cancel('Room reset.'); control.clear(); resetBody(body); resetWorld(world); cameraRig.reset(); mount.focus({ preventScroll: true });
  });
  toggle.addEventListener('click', () => {
    visible = !visible; hud.hidden = !visible;
    toggle.setAttribute('aria-pressed', String(visible));
  });
  let previous = performance.now(), frames = 0, fps = 0, lastFpsAt = previous, elapsed = 0, stopped = false;
  let raf = 0;
  function frame(now: number) {
    if (stopped) return;
    const dt = Math.min(0.05, Math.max(0, (now - previous) / 1000));
    previous = now; elapsed += dt;
    const intent = control.snapshot();
    if (mind?.hasWork && (intent.side || intent.forward)) mind.cancel('Manual movement took over.');
    if (mind?.view.moving) mind.tick(dt);
    else { stepBody(body, intent, cameraRig.yaw, dt); mind?.tick(); }
    cameraRig.apply(stage.camera, body);
    stage.update(body, elapsed,world);
    const nearby=nearbyObject(world,body.x,body.z);
    objectName.textContent=nearby?nearby.object.label:'Nothing in reach';
    objectDetail.textContent=nearby?nearby.object.detail:'Walk towards a furnishing to inspect it.';
    const canToggle=!!nearby && nearby.object.kind==='lamp' && nearby.distance<=INTERACTION_RANGE;
    interactButton.disabled=!canToggle;
    interactButton.textContent=canToggle?(world.lampOn?'Turn light off · E':'Turn light on · E'):'No manual action';
    frames++;
    if (now - lastFpsAt >= 500) {
      fps = frames * 1000 / (now - lastFpsAt);
      frames = 0; lastFpsAt = now;
    }
    {
      telemetry.textContent =
        'POSITION X ' + body.x.toFixed(2) + ' · Z ' + body.z.toFixed(2) +
        '\nFACING ' + (body.yaw * 180 / Math.PI).toFixed(0) + '° · ' + body.action +
        '\nVELOCITY ' + Math.hypot(body.vx, body.vz).toFixed(2) + ' m/s · GROUNDED ' + body.grounded +
        '\nCAMERA ' + cameraRig.distance.toFixed(1) + 'm · ' + fps.toFixed(0) + ' FPS' +
        '\nLAMP ' + (world.lampOn ? 'ON' : 'OFF');
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  renderStatus.textContent = 'BODY ONLINE · HOME / MANUAL';
  mount.focus({ preventScroll: true });
  window.addEventListener('pagehide', () => {
    stopped = true; cancelAnimationFrame(raf); control.dispose(); stage.dispose();
  }, { once: true });
} catch (error) {
  renderStatus.textContent = 'WEBGL UNAVAILABLE';
  mount.replaceChildren();
  const paragraph = document.createElement('p');
  paragraph.className = 'render-error';
  paragraph.textContent = 'WebGL could not start. ETTA requires a browser with 3D graphics support; no simulation is running.';
  mount.appendChild(paragraph);
  console.error('[ETTA] Stage failed', error);
}
