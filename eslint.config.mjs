import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: {
    overrides: {
      'antfu/top-level-function': 'off',
    },
  },
})
