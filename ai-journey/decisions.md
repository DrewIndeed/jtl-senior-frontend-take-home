# Decision log

Condensed from my Decision Guide (D1–D22, written during planning). Each line is the decision, then why, then the trade-off.

| # | Decision | Why | Trade-off |
|---|---|---|---|
| D1 | pnpm workspaces | Strict `node_modules` blocks undeclared imports, and `workspace:*` is explicit | Doesn't block *declared* cross-feature deps, so D6 is still needed |
| D2 | Turborepo, minimal pipeline | Required by the brief, which also says not to invest in caching | No remote cache |
| D3 | Vite | Required, and the same as JTL Cloud Apps | — |
| D4 | React 19, strict TS (`noUncheckedIndexedAccess`) | Contracts between packages only matter if types are strict | Some libraries may lag (none did) |
| D5 | `apps/web` + `users` + `todos` + `shared` | The feature is the unit of ownership. `shared` = contracts only | Four packages for a small app; that's the point of the exercise |
| D6 | ESLint `no-restricted-imports` + `exports` maps | A rule that only lives in a README gets broken. The lint fails on violations | Lint-level, not a dependency-graph tool (fine at this size) |
| D7 | Slot/render-prop for the assignee picker | `todos` only knows it needs a `UserId` field | One more prop vs DI via context (overkill here) |
| D8 | File-based TanStack Router, `autoCodeSplitting`, committed `routeTree.gen.ts` | Type-safe params/search, generated tree, code splitting | Codegen step, so the tree is committed for clean clones |
| D9 | Query v5 optimistic create with per-item rollback + last-settle invalidate | Snapshot restore breaks overlapping creates | More code than the docs' example. `isMutating` semantics are undocumented, so a test guards them |
| D10 | Jotai: one atom, the active user id | Cross-cutting UI state; never server data | Persisted to localStorage, which is a small extra |
| D11 | Plain Tailwind v4 | Required. The design-system package wasn't asked for | Less polish |
| D12 | Zod | One schema for form, API parse and mock | One dependency (~tens of KB) |
| D13 | A11y basics | Labels, `aria-describedby`, `aria-invalid`, focus on the first error, `role=status` live region for optimistic/rollback, skip link, 44px buttons | No axe run yet (see reflection) |
| D14 | MSW + `?fail=todos.create` | Network-level mock, so data-access code is production code. Reviewers can see the rollback | Service worker setup; the worker chunk is large |
| D15 | 2 Vitest tests | The key signal (overlap + rollback) and validation | Rest is outlined, not built |
| D16 | Playwright | **Cut** (4h cap) | — |
| D17 | Exact pins; jotai 3.0.1, msw 2.15.0, TS 5.9.3 | Reproducible installs; peer ranges checked | Not on every "latest" |
| D18 | Perf | Code splitting, intent preload, parallel loader prefetch, stable keys | Mock worker is demo-only weight |
| D19 | No deploy | Cut by scope | Reviewers run it locally |
| D20 | Small conventional commits, no squash | History is a signal | — |
| D21 | `ai-journey/` | Required, weighed like code | — |
| D22 | Ask early | Open questions answered in planning (submit when done, todo list in both places, plain Tailwind) | — |
| D23 | Package scope `@jtl/*` (the plan said `@app/*`) | A naming choice made during scaffolding. The reason wasn't recorded at the time. | Purely cosmetic. The lint boundary patterns use `@jtl/*` |
| D24 | Mock worker stays on the first-load path | Reviewers need the mock in every build | First load ≈ 293 KB gz vs ≈ 139 KB app-only. A real deployment would gate it with an env flag |
