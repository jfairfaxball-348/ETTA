# S005 validation

## TESTED_LOCAL

Node 24.19.0: server/client typecheck and production Vite build PASS; 23/23 Node tests PASS (13 mind contract/security/controller, 6 physics, 4 scaffold). Browser bundle scan confirms no provider/Redis credentials or provider key header. Build retains the existing >500 kB Three.js bundle warning.

## Pending or not run

First hosted run [39118748441](https://github.com/jfairfaxball-348/ETTA/actions/runs/39118748441), source `b5f0932ae35fd4836f310a8ce80c883d30d22ae7`: 23/23 Node, production build, actual Redis Lua limits and 17/17 room Chromium checks passed. Mind-browser checks exposed a native browser fetch receiver bug (Illegal invocation); fixed by binding the transport to globalThis. The first run is FAILED overall; the corrected source requires another hosted run.

Local Chromium was attempted but the workspace denied socket creation (Operation not permitted), before any browser check ran. This is BLOCKED_LOCAL, not a product failure or browser pass. Hosted CI/Chromium and actual Redis script checks are pending. Actual Google/hosted Upstash requests NOT_RUN: no configured credentials. Vercel function deployment NOT_VERIFIED. Owner separately reported S004 deployed room/movement/proximity/lamp working; this is OWNER_REPORTED, not this session's observation. No paid service or billing enabled. Physical phone benchmark NOT_RUN.

Second hosted run [39139409956](https://github.com/jfairfaxball-348/ETTA/actions/runs/39139409956), source `53c6c064c9116e298c9f5c649d6d7d7806a0e750`: build, 23 Node tests and actual Redis passed; 16/17 room checks passed. The existing arrow-key test assumed a fixed 520 ms hold produced sufficient engine displacement under software WebGL. Changed it to wait for observed movement using the existing bounded movement helper; key-release assertion is preserved. Run FAILED overall; mind browser step did not execute.

Third hosted run [39139611456](https://github.com/jfairfaxball-348/ETTA/actions/runs/39139611456), source `c8efada8b9c129a5bc5afa4be0e47172500948d8`: build/Node/Redis passed; room 16/17. The arrow test then compared post-deceleration position with the pre-keyup sample returned by moveUntil. Corrected it to require observed engine velocity below 0.08, then verify stable position; this still fails a stuck key. CI now executes both browser suites even if one fails, while preserving an overall failure exit.

Fourth hosted run [39139806957](https://github.com/jfairfaxball-348/ETTA/actions/runs/39139806957), source `df03eee9b6ca1d505aa22dc340fb2403b9688c4c`: 23 Node, actual Redis and 17/17 room checks passed. Mind suite 9/10 passed; the remaining test read innerText from the closed observation details element. Fixed the walkthrough to open that inspector before asserting its visible contents; this is a test interaction correction. The native browser fetch fix is now exercised successfully. Overall run remains FAILED pending the corrected full suite.
