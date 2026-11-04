import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  // The router plugin must come before react() (TanStack Router docs).
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react(), tailwindcss()],
  test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test/setup.ts'] },
})
