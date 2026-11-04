import { Link } from '@tanstack/react-router'
import type { TodoStatus } from '@jtl/shared'

const labels: Record<TodoStatus, string> = { all: 'All', open: 'Open', done: 'Done' }

/**
 * ?status= lives in the URL (shareable). The todos list only supplies counts.
 * aria-current is set from `current`, not from Link's active matching: Link treats
 * "All" (no status) as a partial match of every ?status=, so two tabs looked active.
 */
export function StatusFilter({ current, counts }: { current: TodoStatus; counts: Record<TodoStatus, number> }) {
  return (
    <nav aria-label="Filter to-dos by status" className="inline-flex gap-1 self-start rounded-lg bg-zinc-100 p-1">
      {(Object.keys(labels) as TodoStatus[]).map((s) => {
        const active = current === s
        return (
          <Link key={s} to="." search={(prev: Record<string, unknown>) => ({ ...prev, status: s === 'all' ? undefined : s })}
            activeOptions={{ exact: true, includeSearch: true }} activeProps={{}} aria-current={active ? 'page' : undefined}
            className={`inline-flex h-11 items-center rounded-md px-3 text-sm focus-visible:outline-2 focus-visible:outline-brand ${active ? 'bg-zinc-900 font-semibold text-white shadow-sm' : 'text-zinc-600 hover:bg-white hover:text-zinc-950'}`}>
            {labels[s]}
            <span className={`ml-1.5 text-xs tabular-nums ${active ? 'opacity-70' : 'text-zinc-400'}`}>{counts[s]}</span>
          </Link>
        )
      })}
    </nav>
  )
}
