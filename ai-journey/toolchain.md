# Toolchain

| Tool | What it was for |
|---|---|
| **Grok Bot assistant agents** (a multi-agent setup I direct from chat) | **Cris (chief of staff):** read the brief, wrote the plan, the planning journal and the Decision Guide. **Sofia (software engineer):** technical review of the plan, then the build on my machine (scaffold, code, tests, docs, commits). **Uma (UI/UX):** design and a11y review pass. Each agent works from files on a shared workspace. I approve plans and decisions in chat. |
| **Context7 MCP server** | Official docs lookups: TanStack Query optimistic updates, TanStack Router file-based routing and plugin options, MSW setup, pnpm hoisting settings. Used to fact-check the decision records. |
| **npm registry** (`npm view … dist-tags / versions / time / peerDependencies`) | Checked that jotai 3 and msw 3 exist, their release dates, peer and engine ranges, and the latest versions to pin. Found the TypeScript 7 vs typescript-eslint peer conflict. |
| **Node scratch script** against `@tanstack/query-core` 5.105.3 | Empirically checked what `isMutating()` returns inside `onSettled` (see `judgment.md`). |
| **tanstack.com docs** (web fetch) | Read the optimistic-updates guide directly to confirm the `isMutating` pattern is *not* in the official docs. |
| **GitHub CLI** (`gh repo create --template`), git with signed commits | Created the repo from the template and made small conventional commits. |
| pnpm 10.33.4, Turborepo, Vite, Vitest, ESLint, tsc | Install and the build, typecheck, lint and test checks. |

No code was generated outside these tools. Every agent claim that made it into the code was checked with a command, a doc lookup, or a test (see `judgment.md`).
