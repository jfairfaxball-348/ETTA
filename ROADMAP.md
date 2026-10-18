# ETTA — practical capability roadmap

| Phase | Goal | Current acceptance |
|---|---|---|
| P0 FOUNDATION | Vite + CI + browser check | PASS CI + browser; owner-reported earlier Vercel site, latest production unverified |
| P1 BODY | Recognisable body, manual control, camera, collision | PASS S003 Chromium |
| **P2 HOME** | Small furnished room, legal doorway, collisions, world-owned objects and one reversible interaction | **PASS S004 first slice: 10/10 Node, 17/17 Chromium** |
| **P3 MIND** | Server-only provider, strict legal actions, inspectable model proposal | NEXT S005; NOT STARTED |
| P4 LIFE | Bounded optional autonomous episodes, drives, continuity and control | NOT STARTED |
| P5 OPEN | Owner-directed experimentation | UNDEFINED |

## S004 delivered
A cutaway studio and porch, with bed, writing table, chair, cabinet, rug, plant and switchable standing lamp. Physics and proximity calculations refer to stable `HOME_OBJECTS` world data. Walk through the open south doorway, remain within walls/furniture and use the visible manual inspector or E to toggle light. Reset restores world and body. No network or model inference.

**Evidence:** [hosted S004 run](https://github.com/jfairfaxball-348/ETTA/actions/runs/39114318840) shows all 10 deterministic tests, build/typecheck and all 17 Chromium desktop/emulated-touch tests passing. Screenshots stored in artifact 12131721675.

**Remaining:** a real-device frame-rate check, independent Vercel production smoke following merge, richer object states/actions, and any persistent storage.

## Next
S005 connects the first deliberately-triggered, authenticated and bounded LLM decision proposal to legal world observations without beginning uncontrolled autonomy. The model proposes; existing engine authorises and moves. See [complete S005 prompt](authoritative/NEXT_SESSION_PROMPT.md).
