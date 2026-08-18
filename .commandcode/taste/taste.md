# Taste

- Prefers the assistant to review the entire project/codebase before proposing any changes or expansions ("please go through the complete project... I want to expand this further"). Confidence: 0.8
- Wants the plan explained to them before any implementation begins ("first explain me what is the plan") — expects a written plan/summary to review, not immediate execution. Confidence: 0.9
- Wants explicit approval before the assistant makes any changes; expects the assistant to pause and wait for a go-ahead after presenting the plan (interrupts execution and instructs holding off on all changes until approval; explicitly asks to stay in plan mode: "do not change anything without informing, be on plan mode"). Confidence: 0.95
- When hitting errors, asks "why" and wants the root cause explained (e.g., diagnosis of a `String` vs `string` type mismatch, or a module-resolution/import error), not just a silent fix. Confidence: 0.8
- Keeps project documentation in sync with the code: maintains README.md plus a "complete framework understanding" docx and asks for both to be updated to reflect the latest changes after code/work is done. Confidence: 0.7
