import { createDecisionHandler } from '../server/decision.ts';

// Vercel Node Web Standard entry point. Never imported by browser code.
export default { fetch: createDecisionHandler(process.env) };
