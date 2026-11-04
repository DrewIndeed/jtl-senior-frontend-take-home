import type { ComponentProps } from 'react'
import { Select } from '@jtl/shared'
import { useUsers } from '../model/queries'

type Props = Omit<ComponentProps<typeof Select>, 'children'> & { placeholder?: string }

/** The shared <Select> filled with users. Exposed so apps/web can slot it into other features. */
export function UserSelect({ placeholder = 'Choose a user…', ...props }: Props) {
  const { data, isPending, isError } = useUsers()
  return (
    <Select {...props} disabled={isPending || props.disabled}>
      <option value="">{isPending ? 'Loading users…' : isError ? 'Could not load users' : placeholder}</option>
      {data?.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
    </Select>
  )
}
