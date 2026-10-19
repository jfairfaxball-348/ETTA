# S008.5 — implementation plan
1. Add configured server-side ETTA_ACCESS_PIN 4-digit option with staged legacy-token compatibility, atomic Upstash rejected-attempt lockout and no secret exposure. Keep model budget separate.
2. Redesign home for dominant responsive scene, compact AI ON/OFF+Stop, optional controls/dev telemetry; preserve keyboard/touch and manual lamp/route.
3. Capture 384×216 JPEG from a separate avatar-eye WebGL camera only when a model choice is requested; exclude UI and avatar head. Validate MIME/dimensions/bytes server-side; require screenshot in PIN mode. Send text canonical observation and image in a single Gemma generateContent call.
4. Separate cognition summaries from strict action validation; no freeform action or extra provider retries.
5. Test in Node, actual Redis, Vercel packaging and real fixture Chromium with desktop/mobile screenshots; review CI before merging. Document owner PIN setup and live image-understanding walkthrough. Install deferred S009 only after successful closeout.
