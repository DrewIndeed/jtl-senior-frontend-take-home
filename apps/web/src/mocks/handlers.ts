import { delay, http, HttpResponse } from 'msw'
import { CreateTodoInputSchema, CreateUserInputSchema } from '@jtl/shared'
import { db } from './db'

/** "Break the network" switch for reviewers: open the app with ?fail=todos.create. */
const shouldFail = (op: string) =>
  typeof location !== 'undefined' && new URLSearchParams(location.search).getAll('fail').includes(op)

const latency = () => delay(import.meta.env.MODE === 'test' ? 0 : 600)

export const handlers = [
  http.get('/api/users', async () => {
    await latency()
    return HttpResponse.json(db.listUsers())
  }),
  http.get('/api/users/:id', async ({ params }) => {
    await latency()
    const user = db.getUser(String(params.id))
    return user ? HttpResponse.json(user) : HttpResponse.json({ message: 'User not found' }, { status: 404 })
  }),
  http.post('/api/users', async ({ request }) => {
    await latency()
    const parsed = CreateUserInputSchema.safeParse(await request.json())
    if (!parsed.success) return HttpResponse.json({ message: 'Invalid username' }, { status: 400 })
    if (db.usernameTaken(parsed.data.username)) return HttpResponse.json({ message: 'Username is already taken.' }, { status: 409 })
    return HttpResponse.json(db.addUser(parsed.data.username), { status: 201 })
  }),
  http.delete('/api/users/:id', async ({ params }) => {
    await latency()
    if (shouldFail('users.delete')) return HttpResponse.json({ message: 'Server error (simulated)' }, { status: 500 })
    return db.deleteUser(String(params.id)) ? new HttpResponse(null, { status: 204 }) : HttpResponse.json({ message: 'User not found' }, { status: 404 })
  }),
  http.patch('/api/todos/:id', async ({ params, request }) => {
    await latency()
    if (shouldFail('todos.update')) return HttpResponse.json({ message: 'Server error (simulated)' }, { status: 500 })
    const body = (await request.json()) as { done?: unknown }
    if (typeof body.done !== 'boolean') return HttpResponse.json({ message: 'Invalid update' }, { status: 400 })
    const todo = db.updateTodo(String(params.id), { done: body.done })
    return todo ? HttpResponse.json(todo) : HttpResponse.json({ message: 'To-do not found' }, { status: 404 })
  }),
  http.delete('/api/todos/:id', async ({ params }) => {
    await latency()
    if (shouldFail('todos.delete')) return HttpResponse.json({ message: 'Server error (simulated)' }, { status: 500 })
    return db.deleteTodo(String(params.id)) ? new HttpResponse(null, { status: 204 }) : HttpResponse.json({ message: 'To-do not found' }, { status: 404 })
  }),
  http.get('/api/todos', async ({ request }) => {
    await latency()
    const assigneeId = new URL(request.url).searchParams.get('assigneeId') ?? ''
    return HttpResponse.json(db.todosFor(assigneeId))
  }),
  http.post('/api/todos', async ({ request }) => {
    await latency()
    if (shouldFail('todos.create')) return HttpResponse.json({ message: 'Server error (simulated)' }, { status: 500 })
    const parsed = CreateTodoInputSchema.safeParse(await request.json())
    if (!parsed.success || !db.getUser(parsed.data.assigneeId)) return HttpResponse.json({ message: 'Invalid to-do' }, { status: 400 })
    return HttpResponse.json(db.addTodo(parsed.data.title, parsed.data.assigneeId as never), { status: 201 })
  }),
]
