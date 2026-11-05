import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@jtl/shared';
import { CreateTodoForm } from '@jtl/todos';

test('create to-do form shows meaningful, accessible validation messages', async () => {
  const user = userEvent.setup();
  render(
    <QueryClientProvider client={createQueryClient({ retry: false })}>
      <CreateTodoForm
        renderAssigneeField={({ onChange, ...p }) => (
          <select {...p} onChange={(e) => onChange(e.target.value)}>
            <option value="">Choose…</option>
            <option value="u1">alice</option>
          </select>
        )}
      />
    </QueryClientProvider>
  );

  await user.click(screen.getByRole('button', { name: 'Add to-do' }));

  const title = screen.getByLabelText('Title');
  expect(title).toHaveAttribute('aria-invalid', 'true');
  expect(title).toHaveAccessibleDescription('Title is required.');
  expect(title).toHaveFocus();
  expect(screen.getByLabelText('Assignee')).toHaveAccessibleDescription(
    'Choose an assignee.'
  );

  await user.type(title, '   ');
  await user.click(screen.getByRole('button', { name: 'Add to-do' }));
  expect(title).toHaveAccessibleDescription('Title is required.'); // whitespace is trimmed
});
