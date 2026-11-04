import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { z } from 'zod'
import { useSuspenseQuery } from '@tanstack/react-query'
import { alertBoxClass, ApiError, Button, TodoStatusSchema, UserIdSchema, type User } from '@jtl/shared'
import { DeleteUserButton, UserCard, userQueryOptions } from '@jtl/users'
import { CreateTodoForm, TodoList, todoKeys, todosByAssigneeQueryOptions } from '@jtl/todos'
import { StatusFilter } from '../../components/StatusFilter'
import { activeUserIdAtom } from '../../state/active-user'
import { renderAssigneeField } from '../../components/AssigneeField'

export const Route = createFileRoute('/users/$userId')({
  validateSearch: z.object({ status: TodoStatusSchema.optional().catch(undefined) }),
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
  notFoundComponent: () => (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold">User not found</h1>
      <Link to="/" className="inline-flex min-h-11 items-center underline">Back to users</Link>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div role="alert" className={`flex flex-col items-start gap-2 ${alertBoxClass}`}>
      <p>Could not load the user: {error instanceof Error ? error.message : 'Unknown error'}</p>
      <Button type="button" onClick={reset}>Retry</Button>
    </div>
  ),
  component: UserDetail,
})

function UserDetail() {
  const { userId } = Route.useParams()
  const { status = 'all' } = Route.useSearch()
  const { data: user } = useSuspenseQuery(userQueryOptions(userId))
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [activeUserId, setActiveUserId] = useAtom(activeUserIdAtom)

  // Cross-feature cascade lives in the app: users doesn't know todos exists.
  const onDeleted = (deleted: User) => {
    queryClient.removeQueries({ queryKey: todoKeys.byAssignee(deleted.id) })
    if (activeUserId === deleted.id) setActiveUserId(null)
    void navigate({ to: '/' })
  }
  return (
    <div className="flex flex-col gap-6">
      <UserCard user={user} />
      <div><DeleteUserButton user={user} onDeleted={onDeleted} /></div>
      <section aria-labelledby="todos-heading" className="flex flex-col gap-3">
        <h2 id="todos-heading" className="text-lg font-semibold">Assigned to-dos</h2>
        <TodoList assigneeId={userId} headingId="todos-heading" status={status} renderFilter={(counts) => <StatusFilter current={status} counts={counts} />} />
      </section>
      <section aria-labelledby="new-todo-heading" className="flex flex-col gap-3">
        <h2 id="new-todo-heading" className="text-lg font-semibold">Assign a new to-do</h2>
        <CreateTodoForm key={userId} defaultAssigneeId={userId} renderAssigneeField={renderAssigneeField} />
      </section>
    </div>
  )
}
