import { createFileRoute, notFound } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ApiError, UserIdSchema } from '@jtl/shared'
import { UserCard, userQueryOptions } from '@jtl/users'
import { CreateTodoForm, TodoList, todosByAssigneeQueryOptions } from '@jtl/todos'
import { renderAssigneeField } from '../../components/AssigneeField'

export const Route = createFileRoute('/users/$userId')({
  params: { parse: ({ userId }) => ({ userId: UserIdSchema.parse(userId) }), stringify: ({ userId }) => ({ userId }) },
  loader: async ({ context: { queryClient }, params: { userId } }) => {
    try {
      // Start both requests in parallel: no waterfall between user and their to-dos.
      void queryClient.prefetchQuery(todosByAssigneeQueryOptions(userId))
      await queryClient.ensureQueryData(userQueryOptions(userId))
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) throw notFound()
      throw err
    }
  },
  pendingComponent: () => <div aria-busy="true" className="h-24 animate-pulse rounded-lg bg-slate-200" />,
  notFoundComponent: () => <p role="alert">This user does not exist.</p>,
  errorComponent: ({ error, reset }) => (
    <div role="alert">
      <p>Could not load the user: {error instanceof Error ? error.message : "Unknown error"}</p>
      <button type="button" className="underline" onClick={reset}>Retry</button>
    </div>
  ),
  component: UserDetail,
})

function UserDetail() {
  const { userId } = Route.useParams()
  const { data: user } = useSuspenseQuery(userQueryOptions(userId))
  return (
    <div className="flex flex-col gap-6">
      <UserCard user={user} />
      <section aria-labelledby="todos-heading" className="flex flex-col gap-3">
        <h2 id="todos-heading" className="text-lg font-semibold">Assigned to-dos</h2>
        <TodoList assigneeId={userId} headingId="todos-heading" />
      </section>
      <section aria-labelledby="new-todo-heading" className="flex flex-col gap-3">
        <h2 id="new-todo-heading" className="text-lg font-semibold">Assign a new to-do</h2>
        <CreateTodoForm key={userId} defaultAssigneeId={userId} renderAssigneeField={renderAssigneeField} />
      </section>
    </div>
  )
}
