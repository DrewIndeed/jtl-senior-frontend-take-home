import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { ActiveUserSelect } from '../components/ActiveUserSelect'

const navLink = 'inline-flex min-h-11 items-center rounded px-3 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600 [&.active]:font-semibold [&.active]:underline'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
  notFoundComponent: () => (
    <div>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <Link to="/" className="underline">Go home</Link>
    </div>
  ),
})

function RootLayout() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:bg-white focus:p-2">Skip to content</a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <nav aria-label="Main" className="flex gap-2">
            <Link to="/" className={navLink}>Home</Link>
            <Link to="/users/new" className={navLink}>New user</Link>
            <Link to="/todos" className={navLink}>To-dos</Link>
          </nav>
          <ActiveUserSelect />
        </div>
      </header>
      <main id="main" className="mx-auto max-w-3xl px-4 py-8">
        <Outlet />
      </main>
    </>
  )
}
