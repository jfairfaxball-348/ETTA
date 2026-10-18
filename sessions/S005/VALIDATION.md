# S005 validation

## TESTED_LOCAL

Node 24.19.0: server/client typecheck and production Vite build PASS; 23/23 Node tests PASS (13 mind contract/security/controller, 6 physics, 4 scaffold). Browser bundle scan confirms no provider/Redis credentials or provider key header. Build retains the existing >500 kB Three.js bundle warning.

## Pending or not run

First hosted run [39118748441](https://github.com/jfairfaxball-348/ETTA/actions/runs/39118748441), source `b5f0932ae35fd4836f310a8ce80c883d30d22ae7`: 23/23 Node, production build, actual Redis Lua limits and 17/17 room Chromium checks passed. Mind-browser checks exposed a native browser fetch receiver bug (Illegal invocation); fixed by binding the transport to globalThis. The first run is FAILED overall; the corrected source requires another hosted run.

Local Chromium was attempted but the workspace denied socket creation (Operation not permitted), before any browser check ran. This is BLOCKED_LOCAL, not a product failure or browser pass. Hosted CI/Chromium and actual Redis script checks are pending. Actual Google/hosted Upstash requests NOT_RUN: no configured credentials. Vercel function deployment NOT_VERIFIED. Owner separately reported S004 deployed room/movement/proximity/lamp working; this is OWNER_REPORTED, not this session's observation. No paid service or billing enabled. Physical phone benchmark NOT_RUN.
