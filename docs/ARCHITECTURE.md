# ETTA architecture — after S002

```
index.html / src/main.ts
  ├─ src/input.ts        Keyboard/pointer/touch → ManualIntent
  ├─ src/simulation.ts   World-owned 2D transform, facing, velocity and colliders
  ├─ src/camera.ts       Follow/orbit/zoom camera (never mutates body)
  └─ src/scene.ts        Three.js visual humanoid, arena and live renderer
```

`stepBody` is a pure world-state transition mutating explicit state and taking input, camera heading and bounded `dt`; simulation imports no Three.js, no network code and no model provider. Obstacles and arena bounds in the simulation are reused for the Three.js geometry. S002 is intentionally flat-ground: `grounded` is constant and jumping is not claimed.

The renderer owns display geometry only. Etta's mesh turns and follows her physical transform; cosmetic bobbing cannot change collisions. Dragging/zooming only changes the camera. UI telemetry reads actual body state. Keyboard input is gated to stage focus, reset and blur clears input, and touch controls expose a minimal on-screen pad.

**Currently absent:** P2 home, interactive objects, P3 provider inference, P4 autonomy/persistence. Production needs a server-side provider adapter with explicit authentication/rate limits and no `VITE_` secrets. aStar remains reference only; no legacy code imported.

**S003 obligation:** prove keyboard/camera/collision/focus/touch controls in an actual browser; source-level tests alone are not sufficient.
