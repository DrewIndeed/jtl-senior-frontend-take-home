import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { todoKeys } from '../model/keys';
import {
  alertBoxClass,
  Button,
  CreateTodoInputSchema,
  isDev,
  Field,
  fieldErrors,
  inputClass,
  type UserId,
} from '@jtl/shared';
import { useCreateTodo } from '../model/useCreateTodo';

type AssigneeFieldProps = {
  id: string;
  value: string;
  onChange: (id: string) => void;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
};

type Props = {
  /** Slot: the app decides how a user is picked, so todos never imports the users feature. */
  renderAssigneeField: (props: AssigneeFieldProps) => ReactNode;
  defaultAssigneeId?: UserId | null;
};

export function CreateTodoForm({
  renderAssigneeField,
  defaultAssigneeId,
}: Props) {
  const [title, setTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>(defaultAssigneeId ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [rollback, setRollback] = useState<{
    title: string;
    detail: string;
  } | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const assigneeRef = useRef<HTMLDivElement>(null);
  const mutation = useCreateTodo();
  // Don't let "Added …" sit next to a later "Deleted … Undo": clear after 4s or when a toggle/delete starts.
  const client = useQueryClient();
  const lastOtherWrite = useRef(0);
  useEffect(
    () =>
      client.getMutationCache().subscribe((e) => {
        const key = e.mutation?.options.mutationKey;
        if (
          e.type === 'added' &&
          key?.[0] === todoKeys.all[0] &&
          (key[1] === 'toggle' || key[1] === 'delete')
        ) {
          lastOtherWrite.current = Date.now();
          setStatus('');
        }
      }),
    [client]
  );
  useEffect(() => {
    if (!status.startsWith('Added')) return;
    const t = setTimeout(() => setStatus(''), 4000);
    return () => clearTimeout(t);
  }, [status]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = CreateTodoInputSchema.safeParse({ title, assigneeId });
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      if (errs.title) titleRef.current?.focus();
      else
        assigneeRef.current
          ?.querySelector<HTMLElement>('select, input')
          ?.focus();
      return;
    }
    setErrors({});
    setRollback(null);
    const input = {
      title: parsed.data.title,
      assigneeId: parsed.data.assigneeId as UserId,
    };
    setStatus(`Adding “${input.title}”…`);
    setTitle('');
    titleRef.current?.focus();
    const submittedAt = Date.now();
    mutation.mutate(input, {
      // Skip "Added …" if a toggle/delete started meanwhile, so it never sits next to "Deleted … Undo".
      onSuccess: () =>
        setStatus(
          lastOtherWrite.current >= submittedAt ? '' : `Added “${input.title}”.`
        ),
      onError: (err) => {
        setStatus('');
        setRollback({ title: input.title, detail: err.message });
      },
    });
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex flex-col gap-4"
      aria-label="Create to-do"
    >
      <Field label="Title" error={errors.title}>
        {(a11y) => (
          <input
            {...a11y}
            ref={titleRef}
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        )}
      </Field>
      <div ref={assigneeRef}>
        <Field label="Assignee" error={errors.assigneeId}>
          {(a11y) =>
            renderAssigneeField({
              ...a11y,
              value: assigneeId,
              onChange: setAssigneeId,
            })
          }
        </Field>
      </div>
      <Button type="submit">Add to-do</Button>
      {rollback && (
        <p role="alert" className={alertBoxClass}>
          Couldn’t save “{rollback.title}”. We removed it from the list. Try
          again.
          {isDev && (
            <span className="block text-xs text-red-700">
              Server: {rollback.detail}
            </span>
          )}
        </p>
      )}
      <p role="status" aria-live="polite" className="text-sm text-zinc-700">
        {status}
      </p>
    </form>
  );
}
