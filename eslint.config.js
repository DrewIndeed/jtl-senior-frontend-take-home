import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

const feature = (name, others) => ({
  files: [`packages/${name}/**/*.{ts,tsx}`],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        { group: others.map((o) => `@jtl/${o}`), message: 'Feature packages must not depend on each other. Compose them in apps/web or move the contract to @jtl/shared.' },
        { group: ['@jtl/*/src/*', '**/apps/web/**'], message: 'Import only a package public API (its index).' },
      ],
    }],
  },
})

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/routeTree.gen.ts', '**/mockServiceWorker.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { plugins: { 'react-hooks': reactHooks }, rules: reactHooks.configs.recommended.rules },
  feature('users', ['todos']),
  feature('todos', ['users']),
  {
    files: ['packages/shared/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': ['error', { patterns: [{ group: ['@jtl/users', '@jtl/todos'], message: 'shared must not depend on features.' }] }] },
  },
)
