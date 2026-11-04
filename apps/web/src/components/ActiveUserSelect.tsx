import { useId } from 'react'
import { useAtom } from 'jotai'
import { UserSelect } from '@jtl/users'
import type { UserId } from '@jtl/shared'
import { activeUserIdAtom } from '../state/active-user'

export function ActiveUserSelect() {
  const [activeUserId, setActiveUserId] = useAtom(activeUserIdAtom)
  const id = useId()
  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor={id}>Working as</label>
      <UserSelect id={id} placeholder="Nobody" value={activeUserId ?? ''}
        onChange={(e) => setActiveUserId((e.target.value || null) as UserId | null)} />
    </div>
  )
}
