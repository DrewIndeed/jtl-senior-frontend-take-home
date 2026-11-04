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
      <label htmlFor={id} className="text-sm font-medium text-slate-800">{label}</label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {hint && <p id={hintId} className="text-xs text-slate-600">{hint}</p>}
      {error && <p id={errorId} className="text-sm text-red-700">{error}</p>}
    </div>
  )
}

export const inputClass =
  'rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 aria-invalid:border-red-600'
