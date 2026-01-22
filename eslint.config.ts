import antfu from '@antfu/eslint-config'

export default antfu(
  {
    vue: true,
    typescript: true,

    // Enable UnoCSS support
    // https://unocss.dev/integrations/vscode
    unocss: true,
    formatters: true,
  },
  {
    rules: {
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-exports': 'off',
      'perfectionist/sort-named-exports': 'off',
      'no-console': 'warn',
      'no-unused-vars': 'warn', // 修改这里，将 'warn' 改为 'off'
      'unused-imports/no-unused-vars': 'warn', // 添加这一行来禁用 unused-imports 规则
    },
  },
  {
    ignores: [
      '.github/**',
    ],
  },
)
