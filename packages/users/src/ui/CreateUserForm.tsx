import { useRef, useState, type FormEvent } from 'react';
import {
  Button,
  CreateUserInputSchema,
  Field,
  fieldErrors,
  inputClass,
  type User,
} from '@jtl/shared';
import { useCreateUser } from '../model/queries';

export function CreateUserForm({
  onCreated,
}: {
  onCreated: (user: User) => void;
}) {
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const mutation = useCreateUser();

  function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = CreateUserInputSchema.safeParse({ username });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      inputRef.current?.focus();
      return;
    }
    setErrors({});
    mutation.mutate(parsed.data, {
      onSuccess: onCreated,
      // Server-side errors (e.g. 409 username taken) belong to the field, so aria-invalid and focus follow.
      onError: (err) => {
        setErrors({ username: err.message });
        inputRef.current?.focus();
      },
    });
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex max-w-md flex-col gap-4"
      aria-label="Create user"
    >
      <Field
        label="Username"
        error={errors.username}
        hint="3–32 characters: letters, numbers, . _ -"
      >
        {(a11y) => (
          <input
            {...a11y}
            ref={inputRef}
            className={inputClass}
            value={username}
            autoComplete="off"
            onChange={(e) => setUsername(e.target.value)}
          />
        )}
      </Field>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating…' : 'Create user'}
      </Button>
    </form>
  );
}
