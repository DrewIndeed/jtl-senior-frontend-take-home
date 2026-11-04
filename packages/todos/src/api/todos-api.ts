import { z } from 'zod'
import { apiRequest, TodoSchema, type CreateTodoInput, type UserId } from '@jtl/shared'

export const fetchTodosByAssignee = (assigneeId: UserId) =>
  apiRequest(z.array(TodoSchema), `/api/todos?assigneeId=${encodeURIComponent(assigneeId)}`)
export const createTodo = (input: CreateTodoInput) =>
  apiRequest(TodoSchema, '/api/todos', { method: 'POST', body: JSON.stringify(input) })
