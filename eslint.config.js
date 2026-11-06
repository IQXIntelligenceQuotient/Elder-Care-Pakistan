export default [
  { ignores: ['assets/**', 'dist/**', '.playwright-mcp/**'] },
  { files: ['**/*.mjs', 'vite.config.js'], rules: { 'no-unused-vars': 'error', 'no-unreachable': 'error' } },
]
