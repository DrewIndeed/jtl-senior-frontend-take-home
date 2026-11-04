import { useId, type ReactNode } from 'react'

type Props = {
  label: string
  error?: string
  hint?: string
  children: (a11y: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode
}

/** Wires label, error and hint to the control so screen readers announce them. */
export function Field({ label, error, hint, children }: Props) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-zinc-800">{label}</label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {error && (
        <p id={errorId} className="text-sm font-medium text-red-700">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
      {hint && <p id={hintId} className="text-xs text-zinc-600">{hint}</p>}
    </div>
  )
}

export const inputClass =
  'min-h-11 rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-invalid:border-red-600'

/** Red alert box shared by rollback and load errors. */
export const alertBoxClass = 'rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800'
