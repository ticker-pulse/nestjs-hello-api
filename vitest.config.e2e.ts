import path from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.e2e.spec.ts'],
    exclude: ['**/node_modules/**'],
    setupFiles: ['./src/test/setup.global.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    // Run e2e tests sequentially to avoid database conflicts
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@common': path.resolve(__dirname, './src/common'),
    },
  },
});
