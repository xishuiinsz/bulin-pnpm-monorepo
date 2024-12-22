// eslint.config.mjs
import antfu from '@antfu/eslint-config';

export default antfu({
  vue: true,
  stylistic: {
    indent: 2, // 4, or 'tab'
    quotes: 'single', // or 'double'
    semi: true,
  },
});
