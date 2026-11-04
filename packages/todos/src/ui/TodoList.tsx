import { useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { alertBoxClass, Button, type TodoStatus, type UserId } from '@jtl/shared'
import { todosByAssigneeQueryOptions, type TodoRow } from '../model/keys'
import { useCreateTodo } from '../model/useCreateTodo'
import { useDeleteTodo, useToggleTodo } from '../model/useTodoWrites'

type Counts = Record<TodoStatus, number>
type Notice = { kind: 'deleted'; todo: TodoRow } | { kind: 'error'; text: string } | null

type Props = {
  assigneeId: UserId
  headingId?: string
  status?: TodoStatus
  /** Slot for the status filter: the app owns the URL, the list only reports counts. */
  renderFilter?: (counts: Counts) => ReactNode
}

export function TodoList({ assigneeId, headingId, status = 'all', renderFilter }: Props) {
  const { data, isPending, isError, error, refetch } = useQuery(todosByAssigneeQueryOptions(assigneeId))
  const toggle = useToggleTodo()
  const remove = useDeleteTodo()
  const recreate = useCreateTodo()
  const [notice, setNotice] = useState<Notice>(null)

  if (isPending) return <ul aria-busy="true" aria-labelledby={headingId} className="flex flex-col gap-2">{[0, 1, 2].map((i) => <li key={i} className="h-12 animate-pulse rounded bg-zinc-200" />)}</ul>
  if (isError)
    return (
      <div role="alert" className={`flex flex-col items-start gap-2 ${alertBoxClass}`}>
        <p>Could not load to-dos: {error.message}</p>
        <Button type="button" onClick={() => refetch()}>Retry</Button>
      </div>
    )

  const counts: Counts = { all: data.length, open: data.filter((t) => !t.done).length, done: data.filter((t) => t.done).length }
  const rows = status === 'all' ? data : data.filter((t) => (status === 'done' ? t.done : !t.done))

  const onToggle = (t: TodoRow) =>
    toggle.mutate(t, { onError: (e) => setNotice({ kind: 'error', text: `Couldn’t update “${t.title}”. We put it back. ${e.message}` }) })
  const onDelete = (t: TodoRow) => {
    setNotice({ kind: 'deleted', todo: t })
    remove.mutate(t, { onError: () => setNotice({ kind: 'error', text: `Couldn’t delete “${t.title}”. We put it back.` }) })
  }
  // Undo after the server already deleted: re-create it (new id). Simple and honest; see README.
  const onUndo = (t: TodoRow) => {
    setNotice(null)
    recreate.mutate({ title: t.title, assigneeId: t.assigneeId })
  }

  return (
    <div className="flex flex-col gap-3">
      {renderFilter?.(counts)}
      {notice?.kind === 'error' && <p role="alert" className={alertBoxClass}>{notice.text}</p>}
      <p role="status" aria-live="polite" className="flex min-h-6 items-center gap-2 text-sm text-zinc-700">
        {notice?.kind === 'deleted' && (
          <>
            Deleted “{notice.todo.title}”.
            <button type="button" className="min-h-11 rounded px-2 font-medium text-brand underline focus-visible:outline-2 focus-visible:outline-brand" onClick={() => onUndo(notice.todo)}>
              Undo
            </button>
          </>
        )}
      </p>
      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600">
          <p className="font-medium text-zinc-800">{counts.all === 0 ? 'No to-dos assigned yet.' : `No ${status} to-dos.`}</p>
          <p className="mt-1">{counts.all === 0 ? 'Add one with the form below.' : 'Try another filter.'}</p>
        </div>
      ) : (
        <ul aria-labelledby={headingId} className="flex flex-col gap-2">
          {rows.map((t) => (
            <li key={t.id} aria-busy={t.pending ? true : undefined}
              className={`flex items-center gap-3 rounded border bg-white px-3 py-1 ${t.pending ? 'border-dashed border-zinc-300 text-zinc-500' : 'border-zinc-200'}`}>
              <label className="flex min-h-11 flex-1 items-center gap-3">
                <input type="checkbox" className="size-5 accent-brand" checked={t.done} disabled={t.pending} onChange={() => onToggle(t)} />
                <span className={t.done ? 'text-zinc-500 line-through' : t.pending ? 'text-zinc-700' : undefined}>
                  {t.title}
                  {t.pending && <span className="sr-only"> (saving)</span>}
                </span>
              </label>
              {t.pending ? (
                <span aria-hidden="true" className="flex items-center gap-2 text-xs">
                  <span className="size-2 animate-pulse rounded-full bg-brand" />
                  Saving…
                </span>
              ) : (
                <button type="button" aria-label={`Delete “${t.title}”`} onClick={() => onDelete(t)}
                  className="min-h-11 rounded px-3 text-sm text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-brand">
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
