import { useId } from 'react'
import { useAtom } from 'jotai'
import { UserSelect, useUsers } from '@jtl/users'
import type { UserId } from '@jtl/shared'
import { activeUserIdAtom } from '../state/active-user'

export function ActiveUserSelect() {
  const [activeUserId, setActiveUserId] = useAtom(activeUserIdAtom)
  const { data: users } = useUsers()
  const initial = users?.find((u) => u.id === activeUserId)?.username.charAt(0).toUpperCase()
  const id = useId()
  return (
    // Identity chip (avatar + "Working as"), visually distinct from the filters.
    <div className="inline-flex h-9 items-center gap-2 rounded-full bg-zinc-100 pr-1 pl-1.5">
      <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-semibold text-white">
        {initial ?? '?'}
      </span>
      <label htmlFor={id} className="whitespace-nowrap text-xs font-medium text-zinc-500">Working as</label>
      <UserSelect id={id} size="sm" bare placeholder="Nobody" value={activeUserId ?? ''}
        onChange={(e) => setActiveUserId((e.target.value || null) as UserId | null)} />
    </div>
  )
}
