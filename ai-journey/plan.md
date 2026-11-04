# Plan (as approved, v2.1)

_Shared from the planning workspace. Recruiter names and the email draft were removed for privacy, and the AI agents are referred to by role: the planning agent drafted the plan, the engineering agent reviewed it and later built the app, and the design-review agent did the UI/a11y passes. All decisions marked "Andrew" are mine._

# JTL Senior Frontend take-home: strategic plan (DRAFT v2, needs Andrew's approval)

_v2.1 12:51–12:52: Andrew answered §10 (deadline: submit when done, hard limit ≈ Wed 11-11 09:47 UTC+7; 4 h hard cap, plain Tailwind, todo list in both places, presentation without AI)._
_v2 2026-11-04 12:18 UTC+7: the engineering agent's technical review applied; msw 2.15.0 and committing `routeTree.gen.ts` decided (Andrew's choice on the engineering agent's recommendation, 12:18)._

Sources: `senior-frontend-engineer/instructions.md`, the template `README.md`, the invitation email (2026-11-04), and JTL's public docs and job post. Nothing below adds requirements. Anything beyond the spec is labelled **[extra]**.

## 1. Task in one paragraph
Build a Vite + React + TS app in a **Turborepo** with two features:
- **Users:** create by username, detail view by ID.
- **ToDoItems:** create with a title and an assignee userId, and list the items assigned to a given user.

Required tech: TanStack Router, TanStack Query (any mock backend), Jotai (≥1 cross-cutting UI concern), Tailwind, and lightweight validation with a justification. The key signal is an **optimistic ToDo create with correct rollback**.

Deliverables:
- A ½-page README (why this split, trade-offs).
- A reflection on performance and testing strategy.
- Run instructions.
- **`ai-journey/`**, which is weighted on par with the code.

Time box: 2–4 h. Don't gold-plate. Submit a template-created repo link by reply-all to the email within one week. A 45-min walkthrough follows about a week later.

## 2. Evaluation criteria → how we hit each one

| Criterion | Plan |
|---|---|
| Module boundaries | `apps/web`, `packages/users`, `packages/todos`, `packages/shared`. Features never import each other, enforced by ESLint `no-restricted-imports` plus package `exports`. Cross-feature composition happens only in `apps/web`, via a slot such as `<CreateTodoForm renderAssigneeField={…}/>`. |
| Routing | File-based TanStack Router in apps/web, matching JTL Cloud App docs. Routes: `/`, `/users/new`, `/users/$userId` (param parsed to a branded `UserId`), `/todos?assignee=` (zod `validateSearch`). Loaders call `queryClient.ensureQueryData` so there's no waterfall. A `notFound` page for an unknown user, an `errorComponent` per route, and typed `<Link>`. |
| Data & UX resilience | Query-key factories per feature. Sensible `staleTime`. Loading skeletons, error + retry, empty states. Optimistic create: `onMutate` cancels queries and inserts a temp item marked `pending`. `onError` removes **only that temp id**, not a whole-list snapshot, so overlapping creates stay correct, and an accessible toast is shown. `onSuccess` swaps the temp item for the server one. `onSettled` invalidates. |
| State | Jotai `activeUserIdAtom` (the "working as" user in the header). It pre-fills the todo assignee and is the default `/todos` filter. The README gives a 3-row ownership table: URL = navigation, Query = server state, Jotai = cross-cutting UI only. |
| Separation of concerns | Each feature has `api/` (fetchers, zod-parsed responses), `model/` (hooks, query keys, mutation logic, pure helpers) and `ui/` (presentational components). Pages in apps/web only compose. |
| A11y & validation | Semantic `<form>`, `<label for>`, `aria-invalid`, `aria-describedby` errors, focus on the first invalid field, an `aria-live` region for the optimistic/rollback status, visible focus rings, full keyboard flow. **Zod**, because one schema validates the forms, parses API responses and types the mock, which fits JTL's own Platform UI that already peers on zod. |
| Judgment | README trade-offs: MSW vs an in-memory client, snapshot vs per-item rollback, URL vs Jotai, what I cut and why. |
| AI journey | See §6. |

## 3. Distinctive ideas (cheap, tied to graded signals, not gimmicks)
1. **"Break the network" URL toggle [extra].** The MSW handler reads `?fail=todos.create` (from the request referrer/URL or a module flag, never Jotai). A reviewer can watch the optimistic item appear, then roll back, in 5 seconds. Paired with per-item reconciliation that survives two overlapping creates. *(Dev failure panel cut per the technical review.)*
2. **Boundaries enforced like a platform template [extra].** ESLint `no-restricted-imports` (enough at this size, per the technical review) plus each package `exports` only `index.ts`, so an illegal `todos → users` import fails `turbo lint`. Turborepo boundaries / dependency-cruiser are mentioned as the "at 10 features" answer, not built.
3. **An exemplary AI journey** (plan, journal, prompts, toolchain, design and technical reviews, "AI was wrong, I overrode it" log). The D-records (decision log) live in `ai-journey/`, not the README.
- **Cut (technical review):** Platform UI look, Vercel deploy, dev failure panel, separate mock package, dependency-cruiser. Plain Tailwind.

## 4. Stack: exact pins (no `^`), per the engineering agent's npm check 2026-11-04

| Package | Pin |
|---|---|
| turbo | 2.11.10 |
| vite | 8.3.5 |
| react / react-dom | 19.3.1 |
| @tanstack/react-router | 1.170.46 |
| @tanstack/router-plugin | 1.168.48 |
| @tanstack/react-query | 5.105.3 |
| jotai | 3.0.1 |
| msw | **2.15.0** (decided: Andrew's choice on the engineering agent's recommendation, 12:18; agent's rec, v3 changes API e.g. `onUnhandledRequest` → `onUnhandledFrame`) |
| tailwindcss | 4.3.4 |
| zod | 4.6.7 |
| vitest | 5.1.0 |
| @playwright/test | 1.64.1 (only if under budget) |

- Root `package.json`: `packageManager` field for pnpm, `engines.node >=22.12` (jotai 3 and msw 3 require it). Node version stated in README + `.nvmrc`.
- At scaffold, check `@tanstack/router-plugin` and `@vitejs/plugin-react` work with Vite 8 (agent: unverified).
- `turbo.json`: minimal build/lint/dev (+test). Jotai: one atom.

## 5. Structure
```
apps/web/         src/routes/ (file-based), routeTree.gen.ts (committed), main.tsx, src/mocks/ (MSW handlers + in-memory db + ?fail= toggle), app-level composition
packages/shared/  contracts (UserId, schemas), api-client, query-client, ui-primitives, tsconfig/eslint presets (no test/mock code)
packages/users/   api, model, ui, index.ts (only export)
packages/todos/   api, model, ui, index.ts (only export)
```
4 packages, no 5th. Mocks are an app concern in `apps/web/src/mocks`; if feature tests ever need them, a `packages/mock-api` devDependency only, never `shared`.

- **Router:** `tanstackRouter()` before `react()` in Vite plugins; `autoCodeSplitting: true`. `routeTree.gen.ts` is **committed** (decided: Andrew's choice on the engineering agent's recommendation, 12:18) and excluded from lint/format. Param `userId` parsed with zod in `params.parse`; invalid id → `notFound()`. A loader that uses `search` passes it via `loaderDeps`. Add `pendingComponent` (skeleton) and `notFoundComponent`.
- **Optimistic create (with the review's 3 fixes):**
  1. Generate the temp id in `onMutate` and return it (`return { tempId, key }`); `onError` removes by id via `setQueryData(key, old => old?.filter(t => t.id !== tempId))`. No reliance on variables equality.
  2. Write to the right key(s): `todoKeys.byAssignee(assigneeId)` (and the `/todos` list key if different); rollback touches the same keys, captured in the returned result.
  3. Invalidate only when the last mutation settles: `mutationKey: todoKeys.create()`, and in `onSettled` `if (client.isMutating({ mutationKey }) === 1) invalidateQueries(...)` (pattern from TkDodo's "Concurrent Optimistic Updates" blog; verified empirically on v5.105.3 at Andrew's request; no official doc covers it; guarded by test).
     - **Only in the `useMutation` options `onSettled`** (keep the logic there). Inside `mutate(vars, { onSettled })` it would need `=== 0`.
     - Evidence (script against `@tanstack/query-core` 5.105.3, npm latest 11/04): `useMutation` onSettled counts single=1, overlap A=2, last B=1; `mutate()` onSettled 0/1/0. Why: `execute` awaits the cache `onSettled` and the options `onSettled` before marking the mutation no longer running; `mutate()` callbacks run after that.
     - No official source: the optimistic-updates guide (https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates) doesn't show it and only links TkDodo's article under Further reading.
     - Caveat: relies on internal step order the docs don't promise, so the overlapping-create test stays as the guard.
     - Reviewer's code (`reviews/sofia-plan-review.md` §6):
       ```ts
       const mutationKey = todoKeys.create()
       useMutation({
         mutationKey,
         mutationFn: createTodo,
         onMutate: async (input, { client }) => { /* cancelQueries, insert temp item, return { tempId, key } */ },
         onError: (_e, _v, r, { client }) =>
           r && client.setQueryData<Todo[]>(r.key, old => old?.filter(t => t.id !== r.tempId)),
         onSuccess: (todo, _v, r, { client }) =>
           client.setQueryData<Todo[]>(r!.key, old => old?.map(t => t.id === r!.tempId ? todo : t)),
         onSettled: (_d, _e, _v, r, { client }) => {
           if (client.isMutating({ mutationKey }) === 1) {   // self still counted here (verified 5.105.3)
             return client.invalidateQueries({ queryKey: todoKeys.all })
           }
         },
       })
       ```
  - Keep `cancelQueries` in `onMutate`; `onSuccess` replaces temp with server item by `tempId`. v5 signature: `onError(err, variables, onMutateResult, context)`, `context.client` available. Create mutation `retry: 0`.
  - README line on the alternative: docs' "via the UI" approach with `useMutationState`; we keep the cache approach because the brief asks for the item to appear in the list and roll back.
- **A11y:** pending item gets `aria-busy` (or visually-hidden "saving"); one `aria-live="polite"` region (`assertive` for failures); no focus move on rollback; the user select keeps a label even through the slot.
- **Testing (2 tests in the 4h box):** (1) two overlapping creates, first fails → second remains and is reconciled; (2) validation messages. Vitest setup: `setupServer` in `setupFiles` with `beforeAll` / `afterEach(resetHandlers)` / `afterAll`; per-test failure via `server.use(...)`, not the URL toggle; fresh QueryClient per test with `retry: false`. Browser worker start gated behind `import.meta.env.DEV`. Playwright only if under budget.
- **Performance:** route code-splitting (`autoCodeSplitting`), loader prefetch, `select`, stable keys, no server data in Jotai. Budget: initial JS < 150 KB gz, Lighthouse a11y 100.
- **Deploy:** cut. A hosted demo link is out of scope unless Andrew says otherwise; local run only.

## 6. README, reflection, ai-journey, git
- **README (½ page, as required):** split rationale, state-ownership table, rollback design (+ `useMutationState` alternative line), cuts, honest hours, Node version, run steps (`pnpm i && pnpm dev`).
- **Reflection:** 3 bullets on performance, 3 on testing.
- **ai-journey/:** `plan.md`, `journal.md`, `prompts.md`, `toolchain.md`, `judgment.md`, `decisions.md` (D-records / short ADR list), `reviews/`. Scrub personal info.
- **Git:** template repo, ~15–25 small conventional commits, no squash.

## 7. Timeline (submit as soon as done; hard limit ≈ Wed 11-11 09:47 UTC+7)
Core + 2 tests fit the 4 h box, a hard cap (Andrew, 12:51; the review found the previous plan was ~5.5 h).

| Day | Work |
|---|---|
| Wed 11-04 | Andrew approves the plan. |
| Thu 11-05 | Template repo, Turborepo scaffold (pinned), shared contracts, MSW mock in `apps/web/src/mocks`, Users feature + routes |
| Fri 11-06 | Todos feature, optimistic create (3 fixes) + rollback, Jotai active user, validation, a11y |
| Sat 11-07 | Design/a11y pass + code review (one batch each). Fix, then the 2 tests |
| Sun 11-08 | README, reflection, ai-journey, fresh-eyes self-review (no deploy) |
| When done | Andrew reviews, then submits by reply-all (he sends it himself); no fixed date |
| By 11-11 09:47 | Hard limit |

**If under budget only:** Playwright happy path. **Cut:** deploy, dev failure panel, Platform-UI look, separate mock package.

## 8. Where the review agents come in
_The technical plan review (`reviews/sofia-plan-review.md`, 2026-11-04) is applied above; questions 1–7 below are answered there._
- **Design-review agent (one batched pass):**
  - layout and visual consistency with the JTL Platform feel;
  - the form error UX and the optimistic "pending" item styling;
  - empty, loading and error states;
  - focus order and contrast (WCAG AA);
  - the rollback toast wording.
- **Questions for the engineering agent:**
  1. Per-item rollback vs `setQueryData` snapshot: any edge cases, such as invalidate racing with onSuccess?
  2. Mock in `shared` or in a separate `mock-api` package? Does that violate "features depend only on shared"?
  3. Is the slot/render-prop for the assignee picker cleaner than an app-level adapter or DI via context?
  4. Router loaders + `ensureQueryData` vs plain `useSuspenseQuery`: which reads better to a reviewer?
  5. ~~jotai 3 / msw 3 vs pinning 2.x?~~ Answered: jotai 3.0.1, msw 2.15.0 (decided: Andrew's choice on the engineering agent's recommendation, 12:18).
  6. Is ESLint `no-restricted-imports` enough, or should we use dependency-cruiser or Turborepo boundaries?
  7. Do the 3 tests + 1 e2e break the "no gold-plating" rule, or are they a net positive?

## 9. Interview talking points (45 min; assume no AI during it)
- Why this split, and what changes at 10 features (generators, codeowners, boundaries, versioning).
- Optimistic design: temp ids, overlapping mutations, cancel-in-flight, why invalidate on settle.
- State ownership: URL vs Query vs Jotai, and why Jotai never holds server data.
- Validation: why Zod, with one schema shared by the form, API parsing and the mock.
- How this becomes a JTL Cloud App template: the AppBridge token in the api-client, Platform UI.
- pnpm enforces declared deps, not allowed deps, so boundaries still need the ESLint rule.
- AI: where it helped, where it was wrong, and how he verified it.
- What he'd do with more time.

## 10. Open questions: answered by Andrew (2026-11-04 12:51 UTC+7)
1. **Exact deadline:** answered 12:52: submit as soon as it's done, no fixed Monday date. Hard limit stays ≈ Wed 11-11 09:47 UTC+7.
2. **Repo public/private:** doesn't matter.
3. **Hosted demo link:** doesn't matter, so deploy stays cut.
4. **`@jtl-software/platform-ui-react`:** not asked for; plain Tailwind only.
5. **Todo list location:** both (`/todos?assignee=` and the user detail page), as the engineering agent suggested (Andrew agreed).
6. **Going over 2–4 h:** No. **Hard cap 4 h.** Playwright only if it fits inside the cap.
7. **No-AI rule covers the presentation:** Yes. AI helps with the code; a private study guide prepares Andrew to present it himself.

