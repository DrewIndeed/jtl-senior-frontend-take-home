/** Vite's DEV flag without making every package depend on vite types (the cast is erased, so Vite still inlines it). */
export const isDev =
  (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true;
