import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { User, UserId } from '@jtl/shared';
import {
  createUser,
  deleteUser,
  fetchUser,
  fetchUsers,
} from '../api/users-api';

export const userKeys = {
  all: ['users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
  detail: (id: UserId) => [...userKeys.all, 'detail', id] as const,
};

export const usersQueryOptions = () =>
  queryOptions({ queryKey: userKeys.list(), queryFn: fetchUsers });
export const userQueryOptions = (id: UserId) =>
  queryOptions({ queryKey: userKeys.detail(id), queryFn: () => fetchUser(id) });

export const useUsers = () => useQuery(usersQueryOptions());

export function useCreateUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: (user: User) => {
      client.setQueryData(userKeys.detail(user.id), user);
      return client.invalidateQueries({ queryKey: userKeys.list() });
    },
  });
}

/** Users-side cache only. Cross-feature cleanup (their to-dos, the active user) is the app's job. */
export function useDeleteUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (_d, id) => {
      client.removeQueries({ queryKey: userKeys.detail(id) });
      return client.invalidateQueries({ queryKey: userKeys.list() });
    },
  });
}
