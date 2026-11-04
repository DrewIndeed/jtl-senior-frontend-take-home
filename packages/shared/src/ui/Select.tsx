import { forwardRef, type SelectHTMLAttributes } from 'react'

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  /** md = h-10 (form fields), sm = h-9 (toolbar/header). */
  size?: 'md' | 'sm'
  /** No ring or background, for use inside a chip. */
  bare?: boolean
}

/** Native <select> (keeps label association and keyboard behaviour) with a custom chevron. */
export const Select = forwardRef<HTMLSelectElement, Props>(function Select({ size = 'md', bare = false, className = '', ...props }, ref) {
  const look = bare
    ? 'bg-transparent font-medium ring-0 focus-visible:ring-2 focus-visible:ring-brand'
    : 'bg-white ring-1 ring-zinc-950/10 ring-inset hover:ring-zinc-950/20 focus:ring-2 focus:ring-brand aria-invalid:ring-red-600'
  return (
    <div className={`relative ${className}`}>
      <select
        ref={ref}
        {...props}
        className={`w-full appearance-none rounded-lg border-0 pr-9 pl-3 text-sm text-zinc-950 outline-none disabled:opacity-60 ${size === 'sm' ? 'h-9' : 'h-10'} ${look}`}
      />
      <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-zinc-400">
        <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
})
