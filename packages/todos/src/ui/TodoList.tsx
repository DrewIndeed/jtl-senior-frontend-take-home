import { useQuery } from '@tanstack/react-query'
import type { UserId } from '@jtl/shared'
import { todosByAssigneeQueryOptions } from '../model/keys'

export function TodoList({ assigneeId, headingId }: { assigneeId: UserId; headingId?: string }) {
  const { data, isPending, isError, error, refetch } = useQuery(todosByAssigneeQueryOptions(assigneeId))
  if (isPending) return <ul aria-busy="true" aria-labelledby={headingId} className="flex flex-col gap-2">{[0, 1, 2].map((i) => <li key={i} className="h-10 animate-pulse rounded bg-slate-200" />)}</ul>
  if (isError)
    return (
      <div role="alert" className="text-sm text-red-700">
        Could not load to-dos: {error.message}{' '}
        <button type="button" className="underline" onClick={() => refetch()}>Retry</button>
      </div>
    )
  if (data.length === 0) return <p className="text-sm text-slate-600">No to-dos assigned yet.</p>
  return (
    <ul aria-labelledby={headingId} className="flex flex-col gap-2">
      {data.map((t) => (
        <li key={t.id} aria-busy={t.pending ? true : undefined}
          className={`flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2 ${t.pending ? 'opacity-60' : ''}`}>
          <span>{t.title}</span>
          {t.pending && <span className="text-xs text-slate-600">Saving…</span>}
        </li>
      ))}
    </ul>
  )
}
