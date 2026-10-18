# S002 engineering review

- **No manufactured AI:** the avatar only moves by human input. Nothing autonomously chooses actions. No backend or model key included.
- **Deterministic core:** simulation has no scene imports; predictable bounded dt, obstacles and separate camera; cosmetic motion never becomes physical truth.
- **Potential defect:** world state mutates at render delta rather than fixed-tick; 50ms cap reduces but does not eliminate differences across frame rates. Test convergence and adjust if browser evidence shows jitter.
- **Input risk:** focus, keyup, blur, simultaneous touch pointers and browser keyboard behaviour need real-browser exercise; source handlers alone are insufficient.
- **Visual risk:** mobile HUD/buttons may overlap and GL failure/low-end GPU issues remain unobserved.
- **Reproducibility risk:** lockfile generation depends on hosted runner permission; must verify before changing CI to `npm ci`.
- **Security:** no provider call and no secrets in frontend, but independently audit built bundle before P3.
- **Future boundary:** not a home, not an LLM or persistent life; no claims of feeling or genuine autonomy.
