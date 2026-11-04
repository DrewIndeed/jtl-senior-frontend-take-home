_Technical review of the plan by the code-review agent, written before any code. Shared as-is._

# JTL take-home plan: tech review
Date: 2026-11-04 (UTC+7). Review only, no code. Sources: `senior-frontend-engineer/instructions.md`, the plan (`plan.md`), the planning Decision Guide, npm registry (queried today), and Context7 (TanStack Query, TanStack Router, MSW, pnpm docs).
Tags: **[verified]** = checked today; **[unverified]** = my judgment or not checked against a source.

## 1. Stack fit for 2–4h: **Keep everything; cut extras, not tools**
- **Turborepo and Jotai are not optional.** The brief requires both ("organized as a Turborepo monorepo"; "Cross-cutting UI state via Jotai for at least one concern"). [verified, instructions.md] So "do they earn their place" is moot; keep them minimal: turbo.json with build/lint/dev (+test), one atom.
- Vite, React, TS, TanStack Router, TanStack Query and Tailwind are also required. Zod is a free choice the brief says to justify; keep it (one schema for form + response parse is a good justification).
- **MSW: keep**, but it is the most expensive backend option (worker file, browser + node setup). An in-memory fake client is the cheaper fallback the brief explicitly allows. Keep MSW only because the failure toggle makes the key signal demonstrable.
- **Cut / defer** [judgment]: separate `mock-api` package (put mocks in `apps/web/src/mocks`, see §5), Vercel deploy, dev failure panel (URL toggle is enough), Platform-UI look, dependency-cruiser. Playwright: keep as last-in, first-out.
- **Packages:** 4 packages as the brief suggests. Don't add a 5th.

## 2. Versions: **jotai 3 and msw 3 exist and are `latest`; pin 3.x for jotai, pin msw 2.15.0 unless you want to learn v3 now**
npm registry today [verified]:

| Package | latest | notes |
|---|---|---|
| jotai | 3.0.1 (3.0.0 on 2026-09-08) | last 2.x = 2.20.3; peer react >=18; engines node >=22.12 |
| msw | 3.0.3 (3.0.0 on 2026-09-28) | last 2.x = 2.15.0; peer vite >=6, typescript >=5.9, graphql >=16 (graphql/vite presumably optional, unverified); node >=22.12 |
| @tanstack/react-query | 5.105.3 | peer react ^18 \|\| ^19 |
| @tanstack/react-router | 1.170.46 | |
| @tanstack/router-plugin | 1.168.48 | |
| vite | 8.3.5 | |
| react / react-dom | 19.3.1 | |
| tailwindcss | 4.3.4 | |
| zod | 4.6.7 | |
| vitest | 5.1.0 | |
| @playwright/test | 1.64.1 | |
| turbo | 2.11.10 | |
- Recommendation: exact pins (no `^`), `packageManager` field for pnpm, `engines.node >=22.12` (both jotai 3 and msw 3 require it [verified]); state Node version in README + `.nvmrc`.
- **jotai 3.0.1:** usage here is one `atom` + `useAtom`; pin 3.0.1 [low risk, unverified against changelog].
- **msw:** v3 has API changes. Context7 (msw repo source) shows `onUnhandledRequest` replaced by **`onUnhandledFrame`** [verified in source via Context7]. Most tutorials/AI output still use v2 API, so v3 = more friction in a 2–4h box. **Pin msw 2.15.0** unless Andrew wants v3 as a talking point; if v3, log the AI-was-wrong moment in `judgment.md`.
- Zod 4 / Vitest 5 / Vite 8: check `@tanstack/router-plugin` and `@vitejs/plugin-react` work with Vite 8 at scaffold [unverified].

## 3. Optimistic create with per-item rollback: **direction correct; three fixes needed**
Docs pattern [verified, Query v5 optimistic-updates guide]: `onMutate` → `cancelQueries` → snapshot `getQueryData` → `setQueryData` → return `{ previousTodos }`; `onError` restores `onMutateResult.previousTodos`; `onSettled` invalidates. Note v5 signature: `onError(err, variables, onMutateResult, context)` and `context.client` is available. D9's critique (snapshot restore drops a concurrent pending item) is valid.
Fixes:
1. **Generate the temp id in the caller / `onMutate` and return it** (`return { tempId, key }`), and remove by id in `onError` via `setQueryData(key, old => old?.filter(t => t.id !== tempId))`. Don't rely on variables equality.
2. **Write to the right key(s).** The item belongs in `todoKeys.byAssignee(assigneeId)` only; update that key (and `/todos` list key if it's a different key). Rollback must touch the same keys. Capture keys in the returned result.
3. **Invalidate only when the last mutation settles**, otherwise invalidate from mutation A refetches while B is still pending and the refetch overwrites B's optimistic item (this is the "invalidate races onSuccess" question). Use `mutationKey: todoKeys.create()` and in `onSettled`: `if (client.isMutating({ mutationKey }) === 1) invalidateQueries(...)` [pattern from TkDodo's "Concurrent Optimistic Updates" blog; not re-checked against docs today, unverified].
- `onSuccess`: replace temp with server item by `tempId` (good; keeps list stable before invalidate). Keep `cancelQueries` in `onMutate` (docs).
- Alternative worth one README line: the docs' "via the UI" approach (render `useMutationState({ filters: { mutationKey, status: 'pending' }, select: m => m.state.variables })` without touching cache). It handles concurrency for free and failed items just disappear; but cache approach is what the brief's "appears in the list ... rollback" literally asks for. Keep cache approach.
- Tests: 2 overlapping creates, first fails → second remains and is reconciled; that's the single most valuable test.

## 4. Fact-check D1, D8, D9, D14
- **D1 pnpm — mostly accurate, one nuance.** pnpm docs: by default deps are hoisted into the hidden `node_modules/.pnpm/node_modules` (`hoist: true`, `hoistPattern ['*']`), and only `publicHoistPattern` (default `[]`) exposes phantom deps to app code [verified, pnpm settings docs]. So "an undeclared package can't be imported from your code" holds. Nuance: it enforces *declared* deps, not *allowed* deps: if `todos` declares `"@app/users": "workspace:*"` it imports fine. Boundaries still need the ESLint rule (D6). Say that in the interview.
- **D8 Router — accurate.** Plugin generates `routeTree.gen.ts` (default path `./src/routeTree.gen.ts`, "no option to disable route generation"); `autoCodeSplitting: true` splits routes into lazy chunks; `tanstackRouter()` must come **before** `react()` in plugins; zod `validateSearch` + `loaderDeps` is the documented pattern [verified, router docs/plugin source]. Small inaccuracy: GUIDE says "autoSplit"; the option is **`autoCodeSplitting`**. Add: loader using `search` must pass it via `loaderDeps` (docs).
- **D9 Query — accurate**, with the fixes in §3. "Query only needs a Promise-returning function" matches the overview. The docs' example is snapshot-based [verified]. Missing: v5 callback signature (`onMutateResult`, `context.client`) and the concurrent-invalidate issue.
- **D14 MSW — accurate on network-level + shared handlers** (`setupWorker` from `msw/browser`, `setupServer` from `msw/node`, same handlers [verified]). Inaccuracy risk: if v3 is chosen, start options are `onUnhandledFrame`, not `onUnhandledRequest` [verified, v3 source]. Trade-off line should also mention: worker file `mockServiceWorker.js` must be in `public/` (and deployed), and Node tests need fetch intercept with absolute URLs [unverified for v3 specifics].

## 5. Missing / risky
- **Mock location:** put handlers + in-memory db in `apps/web/src/mocks` (app concern, not a feature dependency). If tests in feature packages need them, make it `packages/mock-api` as a devDependency only. Never in `shared` (ships test code into the contracts package).
- **Router codegen in CI/clean clone:** `tsc`/lint fails if `routeTree.gen.ts` is missing. Either commit it (recommended, simplest) or run generation before typecheck. Exclude it from lint/format.
- **MSW in tests vs browser:** Vitest uses `setupServer` in `setupFiles` with `beforeAll/afterEach(resetHandlers)/afterAll`; per-test failure via `server.use(...)`, not the URL toggle. Create a fresh QueryClient per test with `retry: false`. Gate browser worker start behind `import.meta.env.DEV` (or explicit flag if deploying).
- **Failure toggle as global state:** read `?fail=` in the handler from request referrer/URL or a module flag; don't put it in Jotai.
- **Loading/error:** add a `pendingComponent` / skeleton and `notFoundComponent`; mutation `retry` must be 0 for create (default for mutations is 0 [unverified, check]), else rollback looks delayed.
- **a11y:** pending item needs `aria-busy` or visually-hidden "saving"; don't move focus on rollback; announce via one `aria-live="polite"` region (`assertive` for failures). The user select needs a label even when rendered through the slot.
- **Branded `UserId` from route param:** parse with zod in `params.parse`; invalid id → `notFound()`.
- **Scope creep:** current plan is ~5.5h by its own estimate vs 2–4h box. Brief says going over is "optional and not expected". Recommend: core + 2 tests (overlapping rollback, validation) inside 4h; Playwright, deploy, panel only if under budget, and state hours honestly in README.
- **ESLint boundary rule:** `no-restricted-imports` is enough at this size; mention Turborepo boundaries/dependency-cruiser as "at 10 features". Also make each package `exports` only `index.ts`.
- **README/decision log:** the D-records belong in `ai-journey/` or a short ADR list; README stays ½ page as required.
- **Open questions for Andrew:** msw 2.15 vs 3 (my rec: 2.15.0); commit `routeTree.gen.ts` (rec: yes).

## 6. Addendum (2026-11-04 12:55 UTC+7): `isMutating({ mutationKey }) === 1` in onSettled
_Requested by Andrew after reading §3 ("'Not checked against official docs'? Check it against them now.")._
**Verdict: works (tested), with a caveat. The official docs don't show this pattern; it's community guidance.** It's correct only in the **useMutation options `onSettled`**. In a **`mutate(vars, { onSettled })`** callback the count has already dropped, so the check must be `=== 0`.

**Docs:** the React optimistic-updates guide (opened) shows only the snapshot/rollback and the `variables`/`useMutationState` approach, with an unconditional invalidate in `onSettled`. It does not show the `isMutating` guard and just links "the guide by TkDodo on Concurrent Optimistic Updates" under Further reading. Link: https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates

**Empirical test:** `@tanstack/query-core@5.105.3` (npm latest today), a Node scratch script, MutationObserver with the same `mutationKey`, A fails after 20ms, B succeeds after 50ms:
```
single:  options.onSettled isMutating=1 | mutate().onSettled isMutating=0
overlap: A options.onSettled=2 | A mutate().onSettled=1
         B options.onSettled=1 | B mutate().onSettled=0
after all: 0
```
**Why (source `query-core/src/mutation.ts` 5.105.3, `execute`):** cache `onSettled` and then `this.options.onSettled` are awaited (around lines 386/395, and 432/445 for errors) **before** `#dispatch({type:'success'|'error'})` (lines 403/456) moves the mutation out of `pending`. The observer's `mutate()` callbacks fire on the notify that follows the dispatch, so by then the mutation isn't counted.

**Code (useMutation options):**
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
- Don't move this into `mutate(..., { onSettled })` (there it would need `=== 0`). Behaviour across future v5 minors is an implementation detail and isn't documented; add a test that fails if it changes. The planned overlapping-create test covers it.
