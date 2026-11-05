import { atomWithStorage } from 'jotai/utils';
import type { UserId } from '@jtl/shared';

/**
 * The "working as" user picked in the header: cross-cutting UI state.
 * It pre-fills the to-do assignee and is the default /todos filter.
 * It holds an id only, never server data (that belongs to TanStack Query).
 */
export const activeUserIdAtom = atomWithStorage<UserId | null>(
  'active-user-id',
  null
);
