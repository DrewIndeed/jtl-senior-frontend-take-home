import { useId } from 'react'
import { useAtom } from 'jotai'
import { UserSelect } from '@jtl/users'
import type { UserId } from '@jtl/shared'
import { activeUserIdAtom } from '../state/active-user'

export function ActiveUserSelect() {
  const [activeUserId, setActiveUserId] = useAtom(activeUserIdAtom)
  const id = useId()
  return (
    // Identity chip: rounded-full, bordered, with an avatar dot, so it doesn't read as a filter.
    <div className="flex w-full items-center gap-2 rounded-full border border-zinc-200 bg-white py-1 pr-1 pl-3 text-sm shadow-sm sm:w-auto">
      <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-brand" />
      <label htmlFor={id} className="whitespace-nowrap text-xs font-medium uppercase tracking-wide text-zinc-500">Working as</label>
      <UserSelect id={id} placeholder="Nobody" value={activeUserId ?? ''}
        onChange={(e) => setActiveUserId((e.target.value || null) as UserId | null)} />
    </div>
  )
}
