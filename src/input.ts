import type { ManualIntent } from './simulation';

type ControlHooks = { orbit: (dx: number, dy: number) => void; zoom: (delta: number) => void; reset: () => void; toggleHud: () => void; interact: () => void };
const directionKeys: Record<string, 'forward' | 'backward' | 'left' | 'right'> = {
  KeyW: 'forward', ArrowUp: 'forward', KeyS: 'backward', ArrowDown: 'backward',
  KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right'
};
export class ManualControls {
  private keys = new Set<string>();
  private touch = new Map<number, string>();
  private dragging: { id: number; x: number; y: number } | null = null;
  private abort = new AbortController();
  constructor(private readonly mount: HTMLElement, hooks: ControlHooks) {
    const signal = this.abort.signal;
    window.addEventListener('keydown', e => {
      if (e.code === 'F1') { e.preventDefault(); hooks.toggleHud(); return; }
      if (!this.inGameFocus()) return;
      if (e.code === 'KeyE' && !e.repeat) { e.preventDefault(); hooks.interact(); return; }
      if (e.code === 'KeyR' && !e.repeat) { e.preventDefault(); this.clear(); hooks.reset(); return; }
      if (directionKeys[e.code] || e.code.startsWith('Shift')) {
        e.preventDefault();
        this.keys.add(e.code);
      }
    }, { signal });
    window.addEventListener('keyup', e => { this.keys.delete(e.code); }, { signal });
    window.addEventListener('blur', () => this.clear(), { signal });
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.clear(); }, { signal });
    mount.addEventListener('focusout', e => {
      if (!mount.contains(e.relatedTarget as Node | null)) {
        // Touch buttons are outside the canvas focus tree. Blur must release keyboard
        // holds, but must NOT erase an actively held touch pointer on those buttons.
        this.keys.clear();
        this.dragging = null;
      }
    }, { signal });
    mount.addEventListener('pointerdown', e => {
      if (e.target instanceof HTMLButtonElement) return;
      mount.focus({ preventScroll: true });
      this.dragging = { id: e.pointerId, x: e.clientX, y: e.clientY };
      mount.setPointerCapture(e.pointerId);
    }, { signal });
    mount.addEventListener('pointermove', e => {
      if (!this.dragging || e.pointerId !== this.dragging.id) return;
      hooks.orbit(e.clientX - this.dragging.x, e.clientY - this.dragging.y);
      this.dragging.x = e.clientX; this.dragging.y = e.clientY;
    }, { signal });
    const endPointer = (e: PointerEvent) => {
      if (this.dragging?.id === e.pointerId) this.dragging = null;
    };
    mount.addEventListener('pointerup', endPointer, { signal });
    mount.addEventListener('pointercancel', endPointer, { signal });
    mount.addEventListener('lostpointercapture', endPointer, { signal });
    mount.addEventListener('wheel', e => { e.preventDefault(); hooks.zoom(e.deltaY); }, { signal, passive: false });
    document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(button => {
      button.addEventListener('pointerdown', e => {
        e.preventDefault(); this.touch.set(e.pointerId, button.dataset.direction || '');
        button.setPointerCapture(e.pointerId);
      }, { signal });
      const release = (e: PointerEvent) => { this.touch.delete(e.pointerId); };
      button.addEventListener('pointerup', release, { signal });
      button.addEventListener('pointercancel', release, { signal });
      button.addEventListener('lostpointercapture', release, { signal });
    });
  }
  private inGameFocus(): boolean {
    const a = document.activeElement;
    return a === this.mount || (a !== null && this.mount.contains(a));
  }
  snapshot(): ManualIntent {
    const dirs = [...this.keys].map(key => directionKeys[key]).filter(Boolean);
    dirs.push(...this.touch.values() as Iterable<'forward' | 'backward' | 'left' | 'right'>);
    return {
      forward: Number(dirs.includes('forward')) - Number(dirs.includes('backward')),
      side: Number(dirs.includes('right')) - Number(dirs.includes('left')),
      run: this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || [...this.touch.values()].includes('run')
    };
  }
  clear(): void { this.keys.clear(); this.touch.clear(); this.dragging = null; }
  dispose(): void { this.clear(); this.abort.abort(); }
}
