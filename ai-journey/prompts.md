# Key prompts

These are in the order I gave them. **[real]** prompts are my own words, translated faithfully into English where I wrote in Vietnamese. **[reconstructed]** marks steps that ran as part of an automated agent run where I gave no separate prompt. For those I wrote the prompt I would have given for that step, so the reasoning can be followed. Each prompt's outcome is in `journal.md`.

## Planning (chief-of-staff agent)
1. **[real]** "Investigate this to prepare it strategically, and always keep diary-style notes step by step: https://github.com/jtl-software/take-home-tasks. Only do the frontend, okay? We passed the round-1 interview, so this is the take-home. Think it through really carefully, then give me the best plan. Make it something genuinely distinctive, then ask Uma to polish the UI/UX to perfection (Uma is really good), and for technical questions just ask Sofia."
2. **[real]** "Make the plan and the journal into two pages for me to view. Keep your own copies to work from, but I need pages to read."
3. **[real]** "Also add my prompts to the journal. Where they relate to a journal section, log them there. Not every prompt, but log the original prompt verbatim."
4. **[real]** "Add one more file for me (one md for you, one page for me), just for me. It should guide me in depth, so that I could do the things you do myself, and when I reread it I understand why the code is the way it is." → the Decision Guide (`decisions.md`).
5. **[real]** "1. What is routeTree.gen.ts? 2. '(TkDodo's blog pattern, not checked against official docs)'? Repo: doesn't matter. Hosted demo: doesn't matter. platform-ui-react: they don't ask for it, don't care. Todo list: both then, as Sofia decided. Going over 2–4h: no. Does the no-AI rule cover the presentation? Yes: help with the code, but guide me for the presentation."
6. **[real]** "We submit whenever we're done; that's not a problem."

## Technical review (code-review agent)
7. **[reconstructed]** "Review this plan as a senior frontend engineer before I approve it. Is the stack right for a 2–4h scope? Should I pin jotai/msw 3 or 2.x? Check on npm. Is the optimistic rollback correct when two creates overlap? Fact-check the decision records against the official docs via Context7. What's missing or risky?"
8. **[real]** "'Not checked against official docs'? Check it against them now." → the `isMutating === 1` rule was verified by a script against query-core 5.105.3 (`reviews/sofia-plan-review.md` §6).

## Build (code agent on my machine)
9. **[real]** "I approve the plan, go ahead. My home machine is still on, so just use it for speed. Remember this part: 'An ai-journey/ folder documenting how you used AI … This is required and weighs significantly in the evaluation.' I know you'll mostly automate things, so there won't be many key prompts. Where I have no prompt, write the English prompt yourself to fill the 'key prompts'. And remember to log all the changes, the code, the steps and the decisions fully, so I understand."
10. **[real]** "Remember to clone the repo so I can view it in GitHub Desktop."
11. **[real, relayed]** "I'm watching from my work machine. Push after every commit or small batch, and update the journal as you go."
12. **[reconstructed]** "Scaffold a pnpm + Turborepo workspace with exact pins only, a minimal turbo.json and strict TS. Add an ESLint flat config where each feature package fails lint if it imports the other feature."
13. **[reconstructed]** "Create @jtl/shared with contracts only: a branded UserId, zod schemas with human error messages, a fetch helper that zod-parses every response, and a QueryClient factory that doesn't retry 4xx. No feature logic."
14. **[reconstructed]** "Build the todos feature. The optimistic create inserts a temp-id row, rolls back only that row on error, swaps it in place on success, and invalidates only when the last create settles (isMutating === 1 inside the useMutation options onSettled). Keep the list helpers pure so they're testable."
15. **[reconstructed]** "The todo form needs a user picker but must not import users. Give it a render slot, and compose UserSelect into it from apps/web."
16. **[reconstructed]** "Write the one test that proves the key signal. Two overlapping creates where the first fails: the second must stay pending, then be reconciled, with exactly one invalidation. Then show the test fails if the rule is changed to === 0 or removed."
17. **[reconstructed]** "Prove the boundary rule: add a todos → users import, run lint, capture the error, revert."

## Design review fix pass
18. **[reconstructed]** "Apply Uma's batched design and a11y review in one pass: the P0s first (Tailwind not scanning packages, the 409 error on the field with focus, a clear rollback alert), then the P1s and the cheap optional items. Keep the commits small, keep the tests green, push once at the end, and log the review, the fixes and what the AI missed."
