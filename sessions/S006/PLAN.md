# S006 plan

Primary objective stays the live mind gate. Documented scope change: the live gate is blocked by a concrete integration defect, so S006 first fixes it.

1. Reproduce the 500 with a local `vercel build` (Vercel CLI 50.44.0) and load the packaged function under Node.
2. Fix packaging; add a Node regression test (per-file TypeScript emit as Vercel does) and a CI step that runs a real pinned `vercel build` and invokes the packaged function with no credentials.
3. PR → hosted checks → merge → observe the redeployed `/api/decision`.
4. Only if it reports READY and the owner enters the private access code themselves in the browser: one deliberate Ask Etta, approve a legal proposal, check Stop. Otherwise record the exact missing setup; live gate stays OPEN.
