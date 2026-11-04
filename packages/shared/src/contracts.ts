import { z } from 'zod'

/** Branded so a raw string (e.g. a todo id) can't be passed where a user id is expected. */
export const UserIdSchema = z.string().min(1).brand<'UserId'>()
export type UserId = z.infer<typeof UserIdSchema>

export const UserSchema = z.object({
  id: UserIdSchema,
  username: z.string(),
  createdAt: z.string(),
})
export type User = z.infer<typeof UserSchema>

export const CreateUserInputSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters.')
    .max(32, 'Username must be at most 32 characters.')
    .regex(/^[a-z0-9_.-]+$/i, 'Use only letters, numbers, dots, dashes and underscores.'),
})
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>

export const TodoSchema = z.object({
  id: z.string(),
  title: z.string(),
  assigneeId: UserIdSchema,
  createdAt: z.string(),
})
export type Todo = z.infer<typeof TodoSchema>

export const CreateTodoInputSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(120, 'Title must be at most 120 characters.'),
  assigneeId: UserIdSchema.or(z.literal('')).refine((v) => v !== '', 'Choose an assignee.'),
})
export type CreateTodoInput = { title: string; assigneeId: UserId }

/** Field-level messages from a failed safeParse, first message per field. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    out[key] ??= issue.message
  }
  return out
}
