import { Link } from '@tanstack/react-router'
import type { TodoStatus } from '@jtl/shared'

const labels: Record<TodoStatus, string> = { all: 'All', open: 'Open', done: 'Done' }

/** ?status= lives in the URL (shareable). The todos list only supplies counts. */
export function StatusFilter({ current, counts }: { current: TodoStatus; counts: Record<TodoStatus, number> }) {
  return (
    <nav aria-label="Filter to-dos by status" className="flex gap-1">
      {(Object.keys(labels) as TodoStatus[]).map((s) => (
        <Link key={s} to="." search={(prev: Record<string, unknown>) => ({ ...prev, status: s === 'all' ? undefined : s })}
          aria-current={current === s ? 'page' : undefined}
          className="inline-flex min-h-11 items-center rounded-md px-3 text-sm hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-brand aria-[current=page]:bg-zinc-900 aria-[current=page]:text-white">
          {labels[s]} <span className="ml-1 tabular-nums">({counts[s]})</span>
        </Link>
      ))}
    </nav>
  )
}
