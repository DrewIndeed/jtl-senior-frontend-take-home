import { createFileRoute, Link } from '@tanstack/react-router'
import { usersQueryOptions } from '@jtl/users'
import { useSuspenseQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(usersQueryOptions()),
  pendingComponent: () => <p aria-busy="true">Loading users…</p>,
  component: Home,
})

function Home() {
  const { data: users } = useSuspenseQuery(usersQueryOptions())
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Users</h1>
      <ul className="flex flex-col gap-2">
        {users.map((u) => (
          <li key={u.id}>
            <Link to="/users/$userId" params={{ userId: u.id }} className="underline">{u.username}</Link>
          </li>
        ))}
      </ul>
      <Link to="/users/new" className="underline">Create a user</Link>
    </div>
  )
}
