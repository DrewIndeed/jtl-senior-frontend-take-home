import { useEffect, useRef } from 'react';
import { createFileRoute, Link, useRouterState } from '@tanstack/react-router';
import { usersQueryOptions } from '@jtl/users';
import { useSuspenseQuery } from '@tanstack/react-query';

declare module '@tanstack/react-router' {
  interface HistoryState {
    /** Set by the user page after a delete, so Home can confirm it. */
    deletedUser?: string;
  }
}

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(usersQueryOptions()),
  pendingComponent: () => <p aria-busy="true">Loading users…</p>,
  component: Home,
});

function Home() {
  const { data: users } = useSuspenseQuery(usersQueryOptions());
  const deletedUser = useRouterState({
    select: (s) => s.location.state.deletedUser,
  });
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (deletedUser) headingRef.current?.focus();
  }, [deletedUser]);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-semibold focus:outline-none"
        >
          Users
        </h1>
        <Link
          to="/users/new"
          className="inline-flex min-h-11 items-center rounded-md bg-brand px-4 font-medium text-white hover:bg-brand/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Create a user
        </Link>
      </div>
      <p role="status" className="text-sm text-zinc-700">
        {deletedUser ? `Deleted “${deletedUser}” and their to-dos.` : ''}
      </p>
      <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
        {users.map((u) => (
          <li key={u.id}>
            <Link
              to="/users/$userId"
              params={{ userId: u.id }}
              className="flex min-h-11 items-center px-4 py-3 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
            >
              {u.username}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
