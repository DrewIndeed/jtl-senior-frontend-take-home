import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './api-client'

export function createQueryClient(overrides?: { retry?: boolean }) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Don't retry 4xx: a missing user won't appear on retry.
        retry: overrides?.retry === false ? false : (count, err) => !(err instanceof ApiError && err.status < 500) && count < 2,
      },
      mutations: { retry: false },
    },
  })
}
