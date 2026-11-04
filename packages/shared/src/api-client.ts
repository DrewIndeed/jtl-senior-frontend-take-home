import type { z } from 'zod'

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

/** fetch + zod parse at the boundary: components never see unvalidated server data. */
export async function apiRequest<S extends z.ZodType>(
  schema: S,
  path: string,
  init?: RequestInit,
): Promise<z.infer<S>> {
  const res = await fetch(new URL(path, globalThis.location?.origin ?? 'http://localhost'), {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null
    throw new ApiError(res.status, body?.message ?? `Request failed (${res.status})`)
  }
  return schema.parse(await res.json())
}
