import './style.css';
import { createStage } from './scene';
import { spawnBody, resetBody, stepBody } from './simulation';
import { FollowCamera } from './camera';
import { ManualControls } from './input';

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
const cameraRig = new FollowCamera();
let visible = true;
mode.textContent = 'MANUAL / DEV · NO AUTONOMY';
try {
  const stage = createStage(mount);
  const control = new ManualControls(mount, {
    orbit: (dx, dy) => cameraRig.orbit(dx, dy),
    zoom: delta => cameraRig.zoom(delta),
    reset: () => { resetBody(body); cameraRig.reset(); },
    toggleHud: () => {
      visible = !visible; hud.hidden = !visible;
      toggle.setAttribute('aria-pressed', String(visible));
    }
  });
  reset.addEventListener('click', () => {
    control.clear(); resetBody(body); cameraRig.reset(); mount.focus({ preventScroll: true });
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
    stepBody(body, control.snapshot(), cameraRig.yaw, dt);
    cameraRig.apply(stage.camera, body);
    stage.update(body, elapsed);
    frames++;
    if (now - lastFpsAt >= 500) {
      fps = frames * 1000 / (now - lastFpsAt);
      frames = 0; lastFpsAt = now;
    }
    if (visible) {
      telemetry.textContent =
        'POSITION X ' + body.x.toFixed(2) + ' · Z ' + body.z.toFixed(2) +
        '\nFACING ' + (body.yaw * 180 / Math.PI).toFixed(0) + '° · ' + body.action +
        '\nVELOCITY ' + Math.hypot(body.vx, body.vz).toFixed(2) + ' m/s · GROUNDED ' + body.grounded +
        '\nCAMERA ' + cameraRig.distance.toFixed(1) + 'm · ' + fps.toFixed(0) + ' FPS';
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  renderStatus.textContent = 'BODY ONLINE · MANUAL CONTROL';
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
