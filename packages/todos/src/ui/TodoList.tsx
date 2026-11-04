import { useQuery } from '@tanstack/react-query'
import { alertBoxClass, Button, type UserId } from '@jtl/shared'
import { todosByAssigneeQueryOptions } from '../model/keys'

export function TodoList({ assigneeId, headingId }: { assigneeId: UserId; headingId?: string }) {
  const { data, isPending, isError, error, refetch } = useQuery(todosByAssigneeQueryOptions(assigneeId))
  if (isPending) return <ul aria-busy="true" aria-labelledby={headingId} className="flex flex-col gap-2">{[0, 1, 2].map((i) => <li key={i} className="h-10 animate-pulse rounded bg-slate-200" />)}</ul>
  if (isError)
    return (
      <div role="alert" className={`flex flex-col items-start gap-2 ${alertBoxClass}`}>
        <p>Could not load to-dos: {error.message}</p>
        <Button type="button" onClick={() => refetch()}>Retry</Button>
      </div>
    )
  if (data.length === 0)
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
        <p className="font-medium text-slate-800">No to-dos assigned yet.</p>
        <p className="mt-1">Add one with the form below.</p>
      </div>
    )
  return (
    <ul aria-labelledby={headingId} className="flex flex-col gap-2">
      {data.map((t) => (
        <li key={t.id} aria-busy={t.pending ? true : undefined}
          className={`flex items-center justify-between rounded border bg-white px-3 py-2 ${t.pending ? 'border-dashed border-slate-300 text-slate-500' : 'border-slate-200'}`}>
          <span className={t.pending ? 'text-slate-700' : undefined}>
            {t.title}
            {t.pending && <span className="sr-only"> (saving)</span>}
          </span>
          {t.pending && (
            <span aria-hidden="true" className="flex items-center gap-2 text-xs">
              <span className="size-2 animate-pulse rounded-full bg-blue-600" />
              Saving…
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
