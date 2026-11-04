# Users & To-dos: senior frontend take-home

A Vite + React 19 + TypeScript app in a pnpm + Turborepo monorepo. The task is in `senior-frontend-engineer/instructions.md`, and the template's README is kept as `TEMPLATE-README.md`. The AI usage log is in [`ai-journey/`](ai-journey/).

## Run it
Requires Node ≥ 22.12 (`.nvmrc`: 24) and pnpm 10 (`corepack enable`).
```sh
pnpm install
pnpm dev          # http://localhost:5173 (MSW mock backend in the browser)
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```
To see the rollback, open `http://localhost:5173/todos?fail=todos.create` and add a to-do. The item appears straight away, the mock returns 500 after 600 ms, and only that item is removed. A status message is announced.

## Requirements coverage
Checked against [`senior-frontend-engineer/instructions.md`](senior-frontend-engineer/instructions.md) and the template's [AI journey section](TEMPLATE-README.md#ai-journey-required). §-refs are its headings.

| Requirement | Status | Evidence |
|---|---|---|
| User: create a user by username (§The task) | ✅ met | [`users/new.tsx`](apps/web/src/routes/users/new.tsx), [`CreateUserForm.tsx`](packages/users/src/ui/CreateUserForm.tsx) |
| User: detail view by ID (§The task) | ✅ met, with a 404 view for unknown IDs | [`users/$userId.tsx`](apps/web/src/routes/users/$userId.tsx), [`UserCard.tsx`](packages/users/src/ui/UserCard.tsx) |
| To-do: create with title + assignee (§The task) | ✅ met | [`CreateTodoForm.tsx`](packages/todos/src/ui/CreateTodoForm.tsx), [`AssigneeField.tsx`](apps/web/src/components/AssigneeField.tsx) |
| To-do: list all items for a given user (§The task) | ✅ met, on `/todos?assignee=` and the user page | [`todos.tsx`](apps/web/src/routes/todos.tsx), [`TodoList.tsx`](packages/todos/src/ui/TodoList.tsx) |
| Turborepo with `apps/web` + `users`, `todos`, `shared` packages (§Monorepo structure) | ✅ met | [`turbo.json`](turbo.json), [`pnpm-workspace.yaml`](pnpm-workspace.yaml), [Why this split](#why-this-split) |
| Features don't import each other; shared logic goes through `shared` (§Monorepo structure) | ✅ met, enforced by lint, not only by convention | [`eslint.config.js`](eslint.config.js) (`no-restricted-imports`), [`packages/shared/src/index.ts`](packages/shared/src/index.ts) |
| Minimal turbo pipeline (§Monorepo structure) | ✅ met: build / typecheck / lint / test / dev, no caching work | [`turbo.json`](turbo.json) |
| React + TypeScript + Vite (§Technical requirements) | ✅ met | [`vite.config.ts`](apps/web/vite.config.ts), [`tsconfig.base.json`](tsconfig.base.json) |
| TanStack Router: routes, params, navigation (§Technical requirements) | ✅ met: file-based, `$userId` parsed to a branded id, code-split | [`routes/`](apps/web/src/routes/), [`router.tsx`](apps/web/src/router.tsx) |
| TanStack Query with a mock backend; loading, error, caching (§Technical requirements) | ✅ met: MSW, loaders with `ensureQueryData`, 30s `staleTime` | [`handlers.ts`](apps/web/src/mocks/handlers.ts), [`query-client.ts`](packages/shared/src/query-client.ts), [`queries.ts`](packages/users/src/model/queries.ts) |
| Optimistic create of a to-do with correct rollback (§Technical requirements) | ✅ met, per-item rollback; tested with two overlapping creates where one fails | [`useCreateTodo.ts`](packages/todos/src/model/useCreateTodo.ts), [`optimistic.ts`](packages/todos/src/model/optimistic.ts), [`optimistic-create.test.tsx`](apps/web/src/test/optimistic-create.test.tsx), `/todos?fail=todos.create` |
| Jotai for at least one cross-cutting UI concern (§Technical requirements) | ✅ met: one atom, the "working as" user id; the URL wins | [`active-user.ts`](apps/web/src/state/active-user.ts), [`ActiveUserSelect.tsx`](apps/web/src/components/ActiveUserSelect.tsx) |
| TailwindCSS, applied consistently (§Technical requirements) | ✅ met: Tailwind v4, zinc palette, one brand token | [`index.css`](apps/web/src/index.css), [`packages/shared/src/ui/`](packages/shared/src/ui/) |
| Separation of business logic, data access, presentation (§Technical requirements) | ✅ met: `api/`, `model/`, `ui/` folders in each feature | [`packages/todos/src/`](packages/todos/src/), [`packages/users/src/`](packages/users/src/) |
| Basic accessibility: semantic HTML, labels, keyboard (§Technical requirements) | ✅ met: labelled fields, focus management, live status; axe 0 violations on 4 pages in the last review round (not in CI) | [`Field.tsx`](packages/shared/src/ui/Field.tsx), [a11y review](ai-journey/reviews/uma-design-a11y-review.md), [extras review](ai-journey/reviews/uma-extras-review.md) |
| Form validation with meaningful messages, choice justified (§Technical requirements) | ✅ met: Zod, messages tied with `aria-describedby`, focus on first invalid field | [`contracts.ts`](packages/shared/src/contracts.ts), [`validation.test.tsx`](apps/web/src/test/validation.test.tsx), [Key decisions](#key-decisions-and-trade-offs) |
| Source code in the repository (§Deliverables) | ✅ met | this repo |
| Short README: architecture, trade-offs, why this split (§Deliverables) | ⚠️ partial: everything is covered, but it is longer than half a page | [Why this split](#why-this-split), [Key decisions](#key-decisions-and-trade-offs) |
| Reflection: performance (§Deliverables) | ✅ met | [Reflection](#reflection) |
| Reflection: testing strategy (§Deliverables) | ✅ met as an outline; only 2 tests are implemented, and the [extra] features have none | [Reflection](#reflection), [`apps/web/src/test/`](apps/web/src/test/) |
| Install and run instructions (§Deliverables) | ✅ met | [Run it](#run-it) |
| `ai-journey/`: plan, key prompts, tools, overrides (§Deliverables, AI journey) | ✅ met | [`plan.md`](ai-journey/plan.md), [`prompts.md`](ai-journey/prompts.md), [`toolchain.md`](ai-journey/toolchain.md), [`judgment.md`](ai-journey/judgment.md), [`decisions.md`](ai-journey/decisions.md), [`journal.md`](ai-journey/journal.md), [`reviews/`](ai-journey/reviews/) |
| Time box of 2–4 hours (§Time box) | ⚠️ partial: the core build stayed inside the box, but planning plus the [extra] pass went past 4h of wall-clock time | [Key decisions → Time](#key-decisions-and-trade-offs), [`journal.md`](ai-journey/journal.md) |
| E2E tests (Playwright) | ✂️ cut to stay in the time box; outlined only | [Reflection](#reflection) |
| Hosted deploy | ✂️ cut, not asked for (CI/CD is out of scope per §What you do NOT need to do) | — |
| Bundle size | ⚠️ measured, but there is no budget gate. Measured 2026-11-04 16:27 UTC+7 at a562a89, gzipped entry + preloaded chunks + CSS: app only ≈ 146 KB; with the MSW worker ≈ 305 KB. The earlier 139 / 293 KB figures were from 14:45, before the [extra] pass | [Reflection](#reflection) |

## Why this split
| Package | Owns | May import |
|---|---|---|
| `apps/web` | routes, providers, MSW mock, Jotai atom, **composition of features** | everything |
| `packages/users` | user api, query keys, hooks, `CreateUserForm`, `UserCard`, `UserSelect` | `shared` |
| `packages/todos` | todo api, query keys, optimistic create, `CreateTodoForm`, `TodoList` | `shared` |
| `packages/shared` | contracts only: branded `UserId`, zod schemas, `apiRequest`, `createQueryClient`, form primitives | — |

A feature is the unit of ownership. The to-do form needs a user picker but must not import `users`, so it takes a `renderAssigneeField` slot and `apps/web` passes in `UserSelect`. `shared` holds contracts only, so a tenth feature adds no sideways dependencies. The boundaries are enforced, not just documented. ESLint `no-restricted-imports` fails `pnpm lint` on a `todos → users` import, and each package's `exports` exposes only its `index.ts`. pnpm's strict `node_modules` stops undeclared imports but not declared ones, which is why the lint rule exists.

## Key decisions and trade-offs
- **State ownership:** the URL handles navigation (`/users/$userId`, `/todos?assignee=`). TanStack Query owns server state. Jotai holds one cross-cutting UI value: the "working as" user, as an id only. It pre-fills the assignee and is the default `/todos` filter, and the URL always wins.
- **Optimistic create:** `onMutate` cancels the list fetch and inserts a `temp-` row. `onError` removes only that row. A snapshot restore, as in the docs example, would also delete another create still in flight. `onSuccess` swaps the row in place. `onSettled` invalidates only when the last create settles (`isMutating({ mutationKey }) === 1`), because an earlier refetch would overwrite pending rows. That count includes the settling mutation, which isn't documented, so a test guards it. The alternative is rendering pending `variables` via `useMutationState`, with no cache writes. It's simpler, but the list cache would no longer be the single source.
- **Validation: Zod.** One schema validates the form, parses every API response at the boundary, and validates the mock's input. Types are inferred, so they can't drift.
- **Mock: MSW** runs at the network level, so the data layer is production code calling `fetch`. The same handlers serve the browser and the Vitest node server. An in-memory client would be simpler, but it skips the network boundary.
- **Routing:** file-based TanStack Router with `autoCodeSplitting`. Loaders call `ensureQueryData` and prefetch the to-dos in parallel, so there's no waterfall. The `userId` param is parsed into the brand. A 404 shows `notFoundComponent`. `routeTree.gen.ts` is committed, so typecheck works on a clean clone.
- **Cut to stay in the 4h box:** Playwright, a deploy, a failure panel (the URL flag is enough), design-system styling, and dependency-cruiser.
- **Time:** planning and plan review took about 3h on 2026-11-04 (11:46–14:23 UTC+7, agent work plus my decisions). The build ran from the first build commit `6930f67` (14:25) to `a39ce19` (14:34), as an agent run I directed and reviewed. A design/a11y review fix pass followed (first commit 14:43, see the journal for the end). Timestamps are from git; details are in `ai-journey/journal.md`.

## [extra] Beyond the brief (minimal pass)
Added after the core build, on purpose kept small (commits 29eae91–ab5bf45, 15:01–15:03 UTC+7 on 2026-11-04 per git; agent run I scoped down to "minimal"; a design/a11y review fix pass followed, 61b2729 at 15:06 and fc12244–cb30efc at 15:15–15:17):
- **Toggle and delete to-dos**, both optimistic with per-item rollback (same `isMutating === 1` settle rule as create). Delete shows "Deleted … Undo" in the list's status line. Undo re-creates the to-do at its original position (new id, back to open); a deferred delete would keep the id but adds timers, so I chose the simpler one. Keeping the position after the refetch relies on a mock-only `index` hint on POST; a real API would need an undelete or position field. Focus moves to Undo after a delete and back to the row's checkbox after Undo or a failed delete.
- **Delete user** with a native `<dialog>` confirm. The mock cascades to their to-dos. The users package only cleans its own cache; `apps/web` drops that user's to-do cache, clears the "working as" atom if it pointed at them, and goes home.
- **`?status=all|open|done` filter** (segmented control, exactly one tab `aria-current`) with counts on `/todos` and the user page (URL-owned, zod-validated, bad values fall back to All).
- **Look:** slate → zinc, one `--color-brand` (indigo-700) token in `@theme`.
- Mock fail flags: `?fail=todos.update`, `?fail=todos.delete`, `?fail=users.delete`.
- **Not done:** new tests for these (existing 2 still pass), inline edit, toasts.

## Reflection
**Performance**
- The server cache is the single source: stable query-key factories, a 30s `staleTime`, no server data in Jotai. Only components that read a query re-render when it changes.
- Routes are code-split (`autoCodeSplitting`) and preloaded on link intent. Loaders start the user and to-do requests in parallel. Optimistic rows swap in place, so there's no list flash.
- **Bundle (measured, `gzip -c`, entry + modulepreloaded chunks + CSS, at a562a89 on 2026-11-04 16:27 UTC+7, including the [extra] features):** app only ≈ **146 KB gz**. With the mock ≈ **305 KB gz**, because `main.tsx` awaits the MSW worker (≈ 159 KB gz) before the first render in every build, so reviewers get the mock backend. The earlier 139 / 293 KB figures were measured at 14:45, before the [extra] pass. A real deployment would gate the mock behind an env flag (e.g. `VITE_ENABLE_MOCKS`) so only the app-only number ships.

**Testing (what I'd do for production)**
- Done: an integration test of the key signal. Two overlapping creates, one fails, and the other must stay and be reconciled, with a single invalidation. Also an accessible validation test (messages tied by `aria-describedby`, focus on the first invalid field).
- Next: unit tests of the zod contracts and the pure list helpers, MSW-backed route tests (404, error and retry), and `vitest-axe` on each page.
- E2E: a Playwright happy path (create a user, assign a to-do, see it on both pages) plus the `?fail=` rollback, and visual regression on the shared primitives.
