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

## Reflection
**Performance**
- The server cache is the single source: stable query-key factories, a 30s `staleTime`, no server data in Jotai. Only components that read a query re-render when it changes.
- Routes are code-split (`autoCodeSplitting`) and preloaded on link intent. Loaders start the user and to-do requests in parallel. Optimistic rows swap in place, so there's no list flash.
- **Bundle (measured, `gzip -c`, entry + modulepreloaded chunks + CSS):** app only ≈ **139 KB gz** (JS 136 + CSS 3). With the mock ≈ **293 KB gz**, because `main.tsx` awaits the MSW worker (≈ 155 KB gz) before the first render in every build, so reviewers get the mock backend. A real deployment would gate the mock behind an env flag (e.g. `VITE_ENABLE_MOCKS`) so only the app-only number ships.

**Testing (what I'd do for production)**
- Done: an integration test of the key signal. Two overlapping creates, one fails, and the other must stay and be reconciled, with a single invalidation. Also an accessible validation test (messages tied by `aria-describedby`, focus on the first invalid field).
- Next: unit tests of the zod contracts and the pure list helpers, MSW-backed route tests (404, error and retry), and `vitest-axe` on each page.
- E2E: a Playwright happy path (create a user, assign a to-do, see it on both pages) plus the `?fail=` rollback, and visual regression on the shared primitives.
