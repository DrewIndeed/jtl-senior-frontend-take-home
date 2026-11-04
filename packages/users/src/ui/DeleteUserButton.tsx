import { useId, useRef } from 'react'
import { alertBoxClass, Button, type User } from '@jtl/shared'
import { useDeleteUser } from '../model/queries'

/** Native <dialog>: focus trap, Escape and inert background come from the browser. */
export function DeleteUserButton({ user, onDeleted }: { user: User; onDeleted: (user: User) => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const mutation = useDeleteUser()

  const confirm = () =>
    mutation.mutate(user.id, {
      onSuccess: () => {
        dialogRef.current?.close()
        onDeleted(user)
      },
    })

  return (
    <>
      <button type="button" onClick={() => { mutation.reset(); dialogRef.current?.showModal() }}
        className="inline-flex min-h-11 items-center rounded-md border border-red-300 px-4 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
        Delete user
      </button>
      <dialog ref={dialogRef} aria-labelledby={titleId} className="m-auto max-w-sm rounded-lg p-6 backdrop:bg-zinc-900/40">
        <h2 id={titleId} className="text-lg font-semibold">Delete “{user.username}”?</h2>
        <p className="mt-2 text-sm text-zinc-700">Their to-dos will be deleted too. This can’t be undone.</p>
        {mutation.isError && <p role="alert" className={`mt-3 ${alertBoxClass}`}>Couldn’t delete the user. Try again.</p>}
        <form method="dialog" className="mt-6 flex justify-end gap-2">
          <button className="min-h-11 rounded-md px-4 text-sm font-medium hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-brand">Cancel</button>
          <Button type="button" className="bg-red-700 hover:bg-red-800" disabled={mutation.isPending} onClick={confirm}>
            {mutation.isPending ? 'Deleting…' : 'Delete user'}
          </Button>
        </form>
      </dialog>
    </>
  )
}
