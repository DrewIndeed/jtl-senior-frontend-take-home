# Journal

Every build step in order. Times are UTC+7. Hashes are the commits on `main`.
Planning before 14:23 (reading the brief, the plan, and the technical review) is summarised in `plan.md` and `decisions.md`.

| Time | Commit | What changed | Why |
|---|---|---|---|
| 14:23 | — | Andrew approved plan v2.1. | Planning is done; start the build. |
| 14:24 | 734d52c | Created the repo from the `jtl-software/take-home-tasks` template (private) with `gh repo create --template`. | The brief asks for a repo created from the template. |
| 14:24 | — | Corepack failed to fetch pnpm 12.16.1 (`MODULE_NOT_FOUND`). Pinned `packageManager: pnpm@10.33.4`, a version already on the machine. | A broken toolchain is not worth debugging inside a 4h box. |
| 14:25 | 6930f67 | Root `package.json` (exact pins, `engines.node >=22.12`), `pnpm-workspace.yaml`, `.npmrc save-exact`, minimal `turbo.json` (build/lint/typecheck/test/dev), `tsconfig.base.json` (strict), flat ESLint config with `no-restricted-imports` boundary rules per feature. | Brief: a minimal Turborepo pipeline. Boundaries enforced by lint instead of only being documented. |
| 14:25 | de81a15 | `@jtl/shared`: zod contracts (branded `UserId`, User/Todo, create-input schemas with messages), `apiRequest` (fetch + zod parse), `createQueryClient` (no retry on 4xx, mutations `retry:false`), `Field`/`Button` primitives. | One schema is used for form validation, API parsing and the mock types. Shared holds contracts only. |
| 14:26 | 44b8b8f | `@jtl/users`: api, query-key factory + `queryOptions`, `useCreateUser`, `CreateUserForm` (zod, focus on error, `role=alert`), `UserCard`, `UserSelect`. | This is the first feature package. It exports `UserSelect` so `apps/web` can slot it into todos without todos importing users. |
| 14:26 | — | Typescript pinned to 5.9.3, not npm-latest 7.0.2. | `typescript-eslint` 8.72.1 peers `typescript >=4.8.4 <6.1.0` (checked with `npm view`). |
