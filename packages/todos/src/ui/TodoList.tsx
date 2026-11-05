import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  alertBoxClass,
  Button,
  isDev,
  type TodoStatus,
  type UserId,
} from '@jtl/shared';
import { todosByAssigneeQueryOptions, type TodoRow } from '../model/keys';
import { useCreateTodo } from '../model/useCreateTodo';
import { useDeleteTodo, useToggleTodo } from '../model/useTodoWrites';

type Counts = Record<TodoStatus, number>;
type Notice =
  | { kind: 'deleted'; todo: TodoRow; index: number }
  | { kind: 'error'; text: string; detail?: string }
  | null;

type Props = {
  assigneeId: UserId;
  headingId?: string;
  status?: TodoStatus;
  /** Slot for the status filter: the app owns the URL, the list only reports counts. */
  renderFilter?: (counts: Counts) => ReactNode;
  /** Left side of the toolbar row above the list (heading, extra controls). */
  toolbarStart?: ReactNode;
};

export function TodoList({
  assigneeId,
  headingId,
  status = 'all',
  renderFilter,
  toolbarStart,
}: Props) {
  const { data, isPending, isError, error, refetch } = useQuery(
    todosByAssigneeQueryOptions(assigneeId)
  );
  const toggle = useToggleTodo();
  const remove = useDeleteTodo();
  const recreate = useCreateTodo();
  const [notice, setNotice] = useState<Notice>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const undoRef = useRef<HTMLButtonElement>(null);
  const checkboxRefs = useRef(new Map<string, HTMLInputElement>());

  // Focus management: Undo after a delete; the restored row's checkbox after Undo or a failed delete.
  useEffect(() => {
    if (notice?.kind === 'deleted') undoRef.current?.focus();
  }, [notice]);
  useEffect(() => {
    if (!focusId) return;
    const el = checkboxRefs.current.get(focusId);
    if (el) {
      el.focus();
      setFocusId(null);
    }
  }, [focusId, data]);

  const toolbar = (counts?: Counts) => (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {toolbarStart}
      {counts && renderFilter?.(counts)}
    </div>
  );

  if (isPending)
    return (
      <div className="flex flex-col gap-2">
        {toolbar()}
        <ul
          aria-busy="true"
          aria-labelledby={headingId}
          className="flex flex-col gap-2"
        >
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-12 animate-pulse rounded bg-zinc-200" />
          ))}
        </ul>
      </div>
    );
  if (isError)
    return (
      <div className="flex flex-col gap-2">
        {toolbar()}
        <div
          role="alert"
          className={`flex flex-col items-start gap-2 ${alertBoxClass}`}
        >
          <p>Could not load to-dos: {error.message}</p>
          <Button type="button" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );

  const counts: Counts = {
    all: data.length,
    open: data.filter((t) => !t.done).length,
    done: data.filter((t) => t.done).length,
  };
  const rows =
    status === 'all'
      ? data
      : data.filter((t) => (status === 'done' ? t.done : !t.done));

  const onToggle = (t: TodoRow) =>
    toggle.mutate(t, {
      onError: (e) =>
        setNotice({
          kind: 'error',
          text: `Couldn’t update “${t.title}”. We put it back.`,
          detail: e.message,
        }),
    });
  const onDelete = (t: TodoRow) => {
    setNotice({
      kind: 'deleted',
      todo: t,
      index: Math.max(
        data.findIndex((r) => r.id === t.id),
        0
      ),
    });
    remove.mutate(t, {
      onError: (e) => {
        setNotice({
          kind: 'error',
          text: `Couldn’t delete “${t.title}”. We put it back.`,
          detail: e.message,
        });
        setFocusId(t.id);
      },
    });
  };
  // Undo after the server already deleted: re-create it at its old index (new id, open again; see README).
  const onUndo = (n: { todo: TodoRow; index: number }) => {
    setNotice(null);
    recreate.mutate(
      { title: n.todo.title, assigneeId: n.todo.assigneeId, index: n.index },
      { onSuccess: (todo) => setFocusId(todo.id) }
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {toolbar(counts)}
      {notice?.kind === 'error' && (
        <p role="alert" className={alertBoxClass}>
          {notice.text}
          {isDev && notice.detail && (
            <span className="block text-xs">Server: {notice.detail}</span>
          )}
        </p>
      )}
      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600">
          <p className="font-medium text-zinc-800">
            {counts.all === 0
              ? 'No to-dos assigned yet.'
              : `No ${status} to-dos.`}
          </p>
          <p className="mt-1">
            {counts.all === 0
              ? 'Add one with the form below.'
              : 'Try another filter.'}
          </p>
        </div>
      ) : (
        <ul aria-labelledby={headingId} className="flex flex-col gap-2">
          {rows.map((t) => (
            <li
              key={t.id}
              aria-busy={t.pending ? true : undefined}
              className={`flex items-center gap-3 rounded border bg-white px-3 py-1 ${t.pending ? 'border-dashed border-zinc-300 text-zinc-500' : 'border-zinc-200'}`}
            >
              <label className="flex min-h-11 flex-1 items-center gap-3">
                <span className="-m-2 inline-flex p-2">
                  <input
                    type="checkbox"
                    className="size-5 accent-brand"
                    checked={t.done}
                    disabled={t.pending}
                    onChange={() => onToggle(t)}
                    ref={(el) => {
                      if (el) checkboxRefs.current.set(t.id, el);
                      else checkboxRefs.current.delete(t.id);
                    }}
                  />
                </span>
                <span
                  className={
                    t.done
                      ? 'text-zinc-500 line-through'
                      : t.pending
                        ? 'text-zinc-700'
                        : undefined
                  }
                >
                  {t.title}
                  {t.pending && <span className="sr-only"> (saving)</span>}
                </span>
              </label>
              {t.pending ? (
                <span
                  aria-hidden="true"
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="size-2 animate-pulse rounded-full bg-brand" />
                  Saving…
                </span>
              ) : (
                <button
                  type="button"
                  aria-label={`Delete “${t.title}”`}
                  onClick={() => onDelete(t)}
                  className="min-h-11 rounded px-3 text-sm text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-brand"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <p
        role="status"
        aria-live="polite"
        className={
          notice?.kind === 'deleted'
            ? 'flex min-h-11 items-center gap-2 text-sm text-zinc-700'
            : 'sr-only'
        }
      >
        {notice?.kind === 'deleted' && (
          <>
            Deleted “{notice.todo.title}”.
            <button
              ref={undoRef}
              type="button"
              className="min-h-11 rounded px-2 font-medium text-brand underline focus-visible:outline-2 focus-visible:outline-brand"
              onClick={() => onUndo(notice)}
            >
              Undo
            </button>
          </>
        )}
      </p>
    </div>
  );
}
