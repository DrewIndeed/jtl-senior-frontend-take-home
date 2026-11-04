import type { SelectHTMLAttributes } from 'react'
import { inputClass } from '@jtl/shared'
import { useUsers } from '../model/queries'

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & { placeholder?: string }

/** A plain <select> of users. Exposed so apps/web can slot it into other features. */
export function UserSelect({ placeholder = 'Choose a user…', ...props }: Props) {
  const { data, isPending, isError } = useUsers()
  return (
    <select {...props} className={inputClass} disabled={isPending || props.disabled}>
      <option value="">{isPending ? 'Loading users…' : isError ? 'Could not load users' : placeholder}</option>
      {data?.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
    </select>
  )
}
