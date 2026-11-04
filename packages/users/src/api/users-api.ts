import { z } from 'zod'
import { apiRequest, UserSchema, type CreateUserInput, type UserId } from '@jtl/shared'

export const fetchUsers = () => apiRequest(z.array(UserSchema), '/api/users')
export const fetchUser = (id: UserId) => apiRequest(UserSchema, `/api/users/${encodeURIComponent(id)}`)
export const createUser = (input: CreateUserInput) =>
  apiRequest(UserSchema, '/api/users', { method: 'POST', body: JSON.stringify(input) })
