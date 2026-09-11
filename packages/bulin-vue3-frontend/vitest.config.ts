import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import tsconfigPaths from 'vite-tsconfig-paths';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

// 与 vite.config.js 保持一致的别名，否则测试环境下无法解析 `@/xxx` 形式的导入
const aliasMap: Record<string, string> = {
  '@': srcDir,
  '@a': `${srcDir}/assets`,
  '@c': `${srcDir}/components`,
  '@h': `${srcDir}/hooks`,
  '@i': `${srcDir}/api`,
  '@p': `${srcDir}/pages`,
  '@u': `${srcDir}/utils`,
  '@v': `${srcDir}/views`
};

export default defineConfig({
  plugins: [vue(), vueJsx(), tsconfigPaths()],
  resolve: {
    alias: Object.entries(aliasMap).map(([find, replacement]) => ({ find, replacement })),
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue']
  },
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      // https://vitest.dev/guide/browser/playwright
      instances: [{ browser: 'chromium' }]
    }
  }
});
