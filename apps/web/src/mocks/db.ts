import type { Todo, User, UserId } from '@jtl/shared'

// In-memory "server" state. Reset per test via resetDb().
let users: User[] = []
let todos: Todo[] = []
let seq = 0
const nextId = (prefix: string) => `${prefix}${++seq}`

export function resetDb() {
  seq = 0
  users = [
    { id: 'u1' as UserId, username: 'alice', createdAt: '2026-11-01T09:00:00.000Z' },
    { id: 'u2' as UserId, username: 'bob', createdAt: '2026-11-02T09:00:00.000Z' },
  ]
  todos = [{ id: 't1', title: 'Review onboarding docs', assigneeId: 'u1' as UserId, done: false, createdAt: '2026-11-03T09:00:00.000Z' }]
  seq = 10
}
resetDb()

export const db = {
  listUsers: () => users,
  getUser: (id: string) => users.find((u) => u.id === id),
  usernameTaken: (name: string) => users.some((u) => u.username.toLowerCase() === name.toLowerCase()),
  addUser: (username: string) => {
    const user: User = { id: nextId('u') as UserId, username, createdAt: new Date().toISOString() }
    users = [...users, user]
    return user
  },
  todosFor: (assigneeId: string) => todos.filter((t) => t.assigneeId === assigneeId),
  addTodo: (title: string, assigneeId: UserId) => {
    const todo: Todo = { id: nextId('t'), title, assigneeId, done: false, createdAt: new Date().toISOString() }
    todos = [...todos, todo]
    return todo
  },
  updateTodo: (id: string, patch: Partial<Pick<Todo, 'done'>>) => {
    const todo = todos.find((t) => t.id === id)
    if (!todo) return undefined
    const next = { ...todo, ...patch }
    todos = todos.map((t) => (t.id === id ? next : t))
    return next
  },
  deleteTodo: (id: string) => {
    const before = todos.length
    todos = todos.filter((t) => t.id !== id)
    return todos.length < before
  },
  /** Deleting a user cascades to their to-dos. */
  deleteUser: (id: string) => {
    if (!users.some((u) => u.id === id)) return false
    users = users.filter((u) => u.id !== id)
    todos = todos.filter((t) => t.assigneeId !== id)
    return true
  },
}
