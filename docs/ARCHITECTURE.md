# ETTA architecture — S004 home

```
index.html / src/main.ts
  ├─ src/input.ts        Manual keyboard, touch, camera and E interaction intent
  ├─ src/world.ts        Immutable room object IDs/bounds, proximity, lamp world state
  ├─ src/simulation.ts   World-owned body + movement collision using world colliders
  ├─ src/camera.ts       Follow/orbit/zoom; never writes world state
  └─ src/scene.ts        Three.js visual meshes reflecting the world definitions
```

The room definition is `HOME_OBJECTS`: each object has a stable ID, kind, footprint, height, collision flag and description. The renderer chooses meshes based on that state rather than acting as a physics source. The south wall has a real gap leading onto a bounded porch. `isPositionLegal` and `stepBody` perform conservative collision checks on the same footprints. Decorative pillows, window trim and table legs do not grant additional interactions.

`WorldState` currently contains only `lampOn`, reset to on. `nearbyObject` computes Euclidean distance from the avatar to furniture bounds. `interact` only accepts the lamp within a fixed range. Input or an on-screen button triggers this **manual** action, and the visual light follows state. Other furniture is intentionally non-interactive.

There is no persistent world, cloud API, autonomous worker or LLM decision. The browser reload starts a fresh deterministic state. For future P3 keep provider credentials in a server-only endpoint with typed, enumerated actions. The existing Vercel target is static; a protected serverless function will be new work.

Browser evidence: [S004 actual Chromium check](https://github.com/jfairfaxball-348/ETTA/actions/runs/39114318840), 17/17; Node unit tests 10/10. Mobile was emulated, not physical. The old architecture record before S004 is superseded.
