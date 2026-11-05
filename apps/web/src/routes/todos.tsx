import { createFileRoute } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import { z } from 'zod';
import { TodoStatusSchema, UserIdSchema } from '@jtl/shared';
import { StatusFilter } from '../components/StatusFilter';
import { UserSelect } from '@jtl/users';
import {
  CreateTodoForm,
  TodoList,
  todosByAssigneeQueryOptions,
} from '@jtl/todos';
import { renderAssigneeField } from '../components/AssigneeField';
import { activeUserIdAtom } from '../state/active-user';

export const Route = createFileRoute('/todos')({
  validateSearch: z.object({
    assignee: UserIdSchema.optional().catch(undefined),
    status: TodoStatusSchema.optional().catch(undefined),
  }),
  loaderDeps: ({ search: { assignee } }) => ({ assignee }),
  loader: ({ context: { queryClient }, deps: { assignee } }) => {
    if (assignee)
      void queryClient.prefetchQuery(todosByAssigneeQueryOptions(assignee));
  },
  component: Todos,
});

function Todos() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const activeUserId = useAtomValue(activeUserIdAtom);
  // URL wins (shareable); the Jotai "working as" user is only the default.
  const assignee = search.assignee ?? activeUserId ?? undefined;
  const status = search.status ?? 'all';
  const assigneePicker = (
    <div className="flex items-center gap-2">
      <label
        htmlFor="assignee-filter"
        className="text-sm font-medium whitespace-nowrap text-zinc-700"
      >
        Show to-dos for
      </label>
      <UserSelect
        id="assignee-filter"
        size="sm"
        className="w-auto min-w-44"
        value={assignee ?? ''}
        onChange={(e) =>
          navigate({
            search: (prev) => ({
              ...prev,
              assignee: (e.target.value || undefined) as never,
            }),
          })
        }
      />
    </div>
  );
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">To-dos</h1>
      {assignee ? (
        <section aria-labelledby="list-heading">
          <TodoList
            toolbarStart={
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <h2 id="list-heading" className="text-lg font-semibold">
                  Assigned to-dos
                </h2>
                {assigneePicker}
              </div>
            }
            assigneeId={assignee}
            headingId="list-heading"
            status={status}
            renderFilter={(counts) => (
              <StatusFilter current={status} counts={counts} />
            )}
          />
        </section>
      ) : (
        <>
          {assigneePicker}
          <p className="text-sm text-zinc-600">
            Pick a user to see their to-dos.
          </p>
        </>
      )}
      <section aria-labelledby="create-heading" className="flex flex-col gap-3">
        <h2 id="create-heading" className="text-lg font-semibold">
          New to-do
        </h2>
        <CreateTodoForm
          key={activeUserId ?? 'none'}
          defaultAssigneeId={assignee}
          renderAssigneeField={renderAssigneeField}
        />
      </section>
    </div>
  );
}
