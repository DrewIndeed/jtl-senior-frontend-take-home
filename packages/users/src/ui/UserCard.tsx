import type { User } from '@jtl/shared';

export function UserCard({ user }: { user: User }) {
  return (
    <section
      aria-labelledby="user-heading"
      className="rounded-lg border border-zinc-200 bg-white p-4"
    >
      <h1 id="user-heading" className="text-xl font-semibold">
        {user.username}
      </h1>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 text-sm text-zinc-700">
        <dt>ID</dt>
        <dd>
          <code>{user.id}</code>
        </dd>
        <dt>Created</dt>
        <dd>
          <time dateTime={user.createdAt}>
            {new Date(user.createdAt).toLocaleString()}
          </time>
        </dd>
      </dl>
    </section>
  );
}
