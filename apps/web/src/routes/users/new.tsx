import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CreateUserForm } from '@jtl/users';

export const Route = createFileRoute('/users/new')({ component: NewUser });

function NewUser() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Create user</h1>
      <CreateUserForm
        onCreated={(user) =>
          navigate({ to: '/users/$userId', params: { userId: user.id } })
        }
      />
    </div>
  );
}
