# Journal

Every build step in order. Times are UTC+7. Hashes are the commits on `main`.

## Planning (2026-11-04, before any code)
| Time | Step |
|---|---|
| 11:46 | The chief-of-staff agent read the template README and `senior-frontend-engineer/instructions.md` in full and listed the required items and the evaluation criteria. |
| 11:48 | Researched the team's public stack (Vite, React, file-based TanStack Router, Tailwind). Checked npm: jotai 3 and msw 3 are new majors. |
| 11:50 | Strategy: depth on the graded signals (optimistic correctness, boundaries, AI journey), not more features. Per-item rollback, slot composition, URL/Query/Jotai ownership, lint-enforced boundaries, MSW with a failure toggle. |
| 11:55 | Wrote the plan (`plan.md`). |
| ~12:10 | The code-review agent reviewed the plan (`reviews/sofia-plan-review.md`). Verdicts: keep the required stack and cut the extras; pin msw 2.15.0; fix the optimistic pattern (temp id + keys returned from onMutate, last-settle invalidate); "autoSplit" is really `autoCodeSplitting`; pnpm doesn't block declared deps. |
| 12:18 | I chose msw 2.15.0 and committing `routeTree.gen.ts`. |
| 12:51 | I answered the open questions: hard 4h cap, plain Tailwind, to-do list in both places, no deploy, presentation without AI. |
| 12:55 | `isMutating === 1` verified with a script against query-core 5.105.3; not in the official docs (`reviews/sofia-plan-review.md` §6). |
| 14:23 | I approved plan v2.1. |

## Build

| Time | Commit | What changed | Why |
|---|---|---|---|
| 14:23 | — | Andrew approved plan v2.1. | Planning is done; start the build. |
| 14:24 | 734d52c | Created the repo from the `jtl-software/take-home-tasks` template (private) with `gh repo create --template`. | The brief asks for a repo created from the template. |
| 14:24 | — | Corepack failed to fetch pnpm 12.16.1 (`MODULE_NOT_FOUND`). Pinned `packageManager: pnpm@10.33.4`, a version already on the machine. | A broken toolchain is not worth debugging inside a 4h box. |
| 14:25 | 6930f67 | Root `package.json` (exact pins, `engines.node >=22.12`), `pnpm-workspace.yaml`, `.npmrc save-exact`, minimal `turbo.json` (build/lint/typecheck/test/dev), `tsconfig.base.json` (strict), flat ESLint config with `no-restricted-imports` boundary rules per feature. | Brief: a minimal Turborepo pipeline. Boundaries enforced by lint instead of only being documented. |
| 14:25 | de81a15 | `@jtl/shared`: zod contracts (branded `UserId`, User/Todo, create-input schemas with messages), `apiRequest` (fetch + zod parse), `createQueryClient` (no retry on 4xx, mutations `retry:false`), `Field`/`Button` primitives. | One schema is used for form validation, API parsing and the mock types. Shared holds contracts only. |
| 14:26 | 44b8b8f | `@jtl/users`: api, query-key factory + `queryOptions`, `useCreateUser`, `CreateUserForm` (zod, focus on error, `role=alert`), `UserCard`, `UserSelect`. | This is the first feature package. It exports `UserSelect` so `apps/web` can slot it into todos without todos importing users. |
| 14:26 | — | Typescript pinned to 5.9.3, not npm-latest 7.0.2. | `typescript-eslint` 8.72.1 peers `typescript >=4.8.4 <6.1.0` (checked with `npm view`). |
| 14:28 | 84462a2 | `@jtl/todos`: `todoKeys` factory, `TodoRow` (`pending` flag), pure list helpers (`insertPending`/`removeById`/`replaceById`), `useCreateTodo` (`mutationKey`, `cancelQueries`, temp id, per-item rollback, in-place swap on success, invalidate only when `isMutating({mutationKey}) === 1`), `TodoList` (skeleton/error+retry/empty/pending row with `aria-busy`), `CreateTodoForm` (assignee slot, `role=status` live region). | This is the key graded signal. Per-item rollback keeps a concurrent pending create when another one fails. |
| 14:29 | (amended before push) | Fix: the assignee slot no longer overrides the `Field` id (the label's `for` would have broken). Focus on the invalid field now goes through a wrapper ref. | Self-review caught a broken label association. |
| 14:31 | d5354a6 | Root `"type": "module"` and the lockfile. | ESLint warned that the config was parsed as CJS. |
| 14:31 | 21cccd3 | `apps/web` scaffold: Vite 8.3.5, `tanstackRouter({ autoCodeSplitting: true })` placed **before** `react()`, Tailwind 4 plugin, `msw init public`. | Router docs require the plugin order. Checked that Vite 8 works with router-plugin 1.168.48 and plugin-react 6.2.1: `vite build` passed (this was an open item in the review). |
| 14:31 | a7da1f1 | MSW handlers + in-memory db (seed: alice/u1, bob/u2), 600 ms latency (0 in tests), `?fail=todos.create` returns 500. Server-side validation reuses the zod schemas; duplicate username returns 409. | Lets a reviewer watch the optimistic item appear and then roll back. The mock lives in the app, not `shared`. |
| 14:31 | dd07733 | Jotai `activeUserIdAtom` (`atomWithStorage`, id only). `ActiveUserSelect` in the header. `renderAssigneeField` composes `UserSelect` into the todos form. | Cross-cutting UI state without server data. Feature composition stays in the app layer. |
| 14:31 | ff051e0 | `main.tsx` (worker start, then render; Jotai, Query and Router providers). `router.tsx` (router context `{ queryClient }`, preload on intent). | Loaders can call `ensureQueryData` through the context. |
| 14:31 | 8eda6f3 | Routes `/`, `/users/new`, `/users/$userId` (zod `params.parse`, loader prefetches to-dos in parallel with `ensureQueryData(user)`, 404 → `notFound()`, pending/error/notFound components), `/todos` (`validateSearch` + `loaderDeps`; the URL wins, the Jotai user is the default). `routeTree.gen.ts` committed. | Matches the plan's routing row. Committing the generated tree keeps typecheck working on a clean clone. |
| 14:31 | — | `pnpm typecheck` failed once: TS18046, `error` was `unknown` in `errorComponent`. Fixed with an `instanceof Error` guard. Typecheck and lint then passed (4/4 tasks). | |
| 14:32 | 8356d1e | Tests: (1) two overlapping creates, A fails at 150 ms, B succeeds at 400 ms. Asserts both pending → only A removed and B still pending with **no** invalidation → B swapped for the server item (non-temp id) → exactly **one** invalidation. (2) Validation: `aria-invalid`, messages via `aria-describedby`, focus on the first invalid field, whitespace trimmed. MSW `setupServer` in `setupFiles`, `resetHandlers` + `resetDb` after each test, `onUnhandledRequest: 'error'`, a fresh QueryClient with `retry:false`. | Proves the key signal. |
| 14:32 | — | First run failed: the 20 ms failure landed before `waitFor` polled (50 ms default), so the pending state was never seen. Fixed with longer mock delays and a 5 ms poll interval. The assertion was not weakened. | |
| 14:32 | — | **Guard check:** temporarily set `=== 0` → test fails. Temporarily invalidated unconditionally → test fails. Restored. | Shows the test really guards the undocumented `isMutating` behaviour. |
| 14:33 | — | **Boundary check:** temporarily added `import { UserCard } from '@jtl/users'` to `packages/todos`. `eslint src` → `error '@jtl/users' import is restricted … Feature packages must not depend on each other` (1 error). Reverted. | Proves the lint rule works. |
| 14:33 | — | `pnpm build` passed. `pnpm dev --port 5199` booted; `GET /` → 200; then stopped. Gzipped chunks: app entry 76.7 KB, router/link 21.4 KB, others 26.5 / 10.0 KB, MSW browser worker 159.8 KB (demo only). | |
| 14:34 | 80dd914, cd3e358 | README: run steps, split table, trade-offs (ownership, rollback design + `useMutationState` alternative, Zod, MSW, routing), cuts, honest time, reflection (3 perf, 3 testing). | Brief deliverables. |
| 14:34 | aa0bfe6 … d5f9302 | ai-journey: `plan.md` (approved plan as-is, recruiter names and email draft removed), `reviews/`, `decisions.md`, `prompts.md`, `toolchain.md`, `judgment.md`. | Required, and weighed like the code. |
| 14:34 | — | Clean re-run from an empty `node_modules`: `pnpm install --frozen-lockfile` ✅, `pnpm typecheck` ✅ 4/4, `pnpm lint` ✅ 4/4, `pnpm test` ✅ 2/2, `pnpm build` ✅. | Final verification before push. |
| 14:34 | — | **Cut:** Playwright (not trivially cheap: browser download plus config), deploy, failure panel, design-system look. **Not verified by hand:** clicking through the UI in a real browser, including the `?fail=` flow (verified only by the automated tests and the dev-server boot). | Honest scope. |

## Design review fix pass (Uma's single batched review, applied in one pass)
_Times below are git commit times. The earlier rows above at 14:38/14:40 were corrected to 14:34, the time of the last build commit `a39ce19`._

| Time | Commit | What changed | Why |
|---|---|---|---|
| 14:43 | 5a336f8 | `@source "../../../packages";` in `index.css`. | P0: Tailwind v4 wasn't scanning the packages, so the feature UI was unstyled. Missed by every automated check (see `judgment.md` #9). |
| 14:43 | e584fdb | A 409 sets the username field error and focuses the input. Removed the separate alert. | P0: `aria-invalid` stayed false and focus stayed on body. |
| 14:43 | 4d625f4 | Separate `role=alert` rollback box ("Couldn't save … We removed it from the list. Try again."). Raw server message only in dev, via a new `isDev` helper in shared (avoids vite types in feature packages). | P0: the rollback must be clear and announced assertively. |
| 14:44 | dd0094d | `min-h-11` on nav links and inputs. | P1: 44px tap targets. |
| 14:44 | e09ce89 | Pending row: dashed border, readable text, pulsing dot, sr-only "(saving)". `opacity-60` removed. | P1: contrast. |
| 14:44 | 95e5599 | Unknown user: h1 "User not found" + "Back to users". Retry uses the shared `Button` inside a red alert box (`alertBoxClass` in shared). | P1: axe `page-has-heading-one`, accessible retry. |
| 14:44 | 96d48ef | Empty state: a dashed box with a hint. | Optional. |
| 14:44 | 89a09d2 | Home: a bordered divided card with full-row links, and the "Create a user" primary link next to the h1. | P1. |
| 14:44 | 452708e | Field error rendered before the hint, with a ⚠ icon (aria-hidden) and medium weight. | Optional. |
| 14:44 | 7789d65 | Header picker `w-full sm:w-auto`, larger gap. | Optional: 390 px layout. |
| 14:45 | 449828c | README: real build times from git, and measured bundle (app-only ≈ 139 KB gz, with mock ≈ 293 KB gz, env-flag gate noted). | Honesty fixes (see `judgment.md` #10, #11). |
| 14:45 | ab091c1, 3be847f | `reviews/uma-design-a11y-review.md`, D23 (`@jtl/*` scope, reason not recorded), D24 (mock on the first-load path), judgment entries, key prompt. | Logging. |
| 14:46 | — | Clean re-run: `pnpm install --frozen-lockfile` ✅, `pnpm typecheck` ✅ 4/4, `pnpm lint` ✅ 4/4, `pnpm test` ✅ 2/2 (no test changes needed), `pnpm build` ✅. **Not verified:** the fixed UI in a real browser (no browser available to the build agent). | |

## [extra] minimal pass (15:00 scope cut)
| Time | Commit | What changed |
|---|---|---|
| 15:01 | 29eae91 | `done` on the Todo contract and seed; MSW PATCH/DELETE `/api/todos/:id`, DELETE `/api/users/:id` (cascade); fail flags; `apiRequest` handles 204. |
| 15:01 | 717295d | `useToggleTodo`, `useDeleteTodo`: per-item rollback (`patchById`, `restoreAt`), invalidate on last settle. |
| 15:01 | a9ee4c9 | TodoList: checkbox, Delete, "Deleted … Undo" (re-create), counts + `renderFilter` slot. |
| 15:02 | 69346b2 | `useDeleteUser` + `DeleteUserButton` (native `<dialog>`). The dialog copy is mine; the original brief's copy wasn't available to the agent. |
| 15:02 | 680e824 | `StatusFilter`, `?status=` on `/todos` and `/users/$userId`; cascade cleanup + atom clear in the app. |
| 15:03 | 90d309c, ab5bf45 | Plain danger button in the dialog; slate → zinc, `--color-brand`. |
