import { UserSelect } from '@jtl/users';
import type { ComponentProps } from 'react';
import type { CreateTodoForm } from '@jtl/todos';

type SlotProps = Parameters<
  ComponentProps<typeof CreateTodoForm>['renderAssigneeField']
>[0];

/** App-level composition: the todos feature gets a user picker without importing users. */
export const renderAssigneeField = ({ onChange, ...props }: SlotProps) => (
  <UserSelect {...props} onChange={(e) => onChange(e.target.value)} />
);
