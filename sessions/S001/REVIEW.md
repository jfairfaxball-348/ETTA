# S001 review — hostile engineering lens

1. **No body, no world, no mind:** a successful empty-stage render is only a foundation gate.
2. **WebGL uncertainty:** compile/CI builds cannot prove browser rendering or reliable GPU behavior; test in a real browser.
3. **Hosting uncertainty:** Vite development middleware from aStar would fail when deployed statically. This new repo has no such middleware or production API yet. Do not claim that cloud LLM works until P3.
4. **Secrets:** owner tested a key in prior private conversation; it is not stored or implied to be a Vercel environment variable here. Browser builds may not contain model credentials.
5. **Quality debt:** dependency lockfile intentionally deferred to S002, limiting reproducibility until then; CI install must be converted to npm ci.
6. **Environment limitation:** static source audit cannot certify in-browser performance, user experience or live endpoint.
7. **Cost / autonomy:** no hosted model calls or persistent worker are enabled; 24/7 autonomy would require a separate architecture and limits.
8. **Process burden:** session artifacts must remain proportionate to software complexity; do not let protocol displace feature delivery.

S002's body milestone should focus on genuine interaction evidence, not just more documents.
