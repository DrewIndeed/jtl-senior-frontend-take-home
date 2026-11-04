import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Button, CreateTodoInputSchema, isDev, Field, fieldErrors, inputClass, type UserId } from '@jtl/shared'
import { useCreateTodo } from '../model/useCreateTodo'

type AssigneeFieldProps = { id: string; value: string; onChange: (id: string) => void; 'aria-invalid': boolean; 'aria-describedby'?: string }

type Props = {
  /** Slot: the app decides how a user is picked, so todos never imports the users feature. */
  renderAssigneeField: (props: AssigneeFieldProps) => ReactNode
  defaultAssigneeId?: UserId | null
}

export function CreateTodoForm({ renderAssigneeField, defaultAssigneeId }: Props) {
  const [title, setTitle] = useState('')
  const [assigneeId, setAssigneeId] = useState<string>(defaultAssigneeId ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState('')
  const [rollback, setRollback] = useState<{ title: string; detail: string } | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const assigneeRef = useRef<HTMLDivElement>(null)
  const mutation = useCreateTodo()

  function submit(e: FormEvent) {
    e.preventDefault()
    const parsed = CreateTodoInputSchema.safeParse({ title, assigneeId })
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error)
      setErrors(errs)
      if (errs.title) titleRef.current?.focus()
      else assigneeRef.current?.querySelector<HTMLElement>('select, input')?.focus()
      return
    }
    setErrors({})
    setRollback(null)
    const input = { title: parsed.data.title, assigneeId: parsed.data.assigneeId as UserId }
    setStatus(`Adding “${input.title}”…`)
    setTitle('')
    titleRef.current?.focus()
    mutation.mutate(input, {
      onSuccess: () => setStatus(`Added “${input.title}”.`),
      onError: (err) => {
        setStatus('')
        setRollback({ title: input.title, detail: err.message })
      },
    })
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4" aria-label="Create to-do">
      <Field label="Title" error={errors.title}>
        {(a11y) => <input {...a11y} ref={titleRef} className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />}
      </Field>
      <div ref={assigneeRef}>
        <Field label="Assignee" error={errors.assigneeId}>
          {(a11y) => renderAssigneeField({ ...a11y, value: assigneeId, onChange: setAssigneeId })}
        </Field>
      </div>
      <Button type="submit">Add to-do</Button>
      {rollback && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Couldn’t save “{rollback.title}”. We removed it from the list. Try again.
          {isDev && <span className="block text-xs text-red-700">Server: {rollback.detail}</span>}
        </p>
      )}
      <p role="status" aria-live="polite" className="text-sm text-slate-700">{status}</p>
    </form>
  )
}
