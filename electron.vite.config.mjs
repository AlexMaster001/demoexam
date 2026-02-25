// electron.vite.config.mjs
import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import copy from 'rollup-plugin-copy';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      react(),
      copy({
        targets: [
          {
            src: 'src/renderer/src/assets/**/*',
            dest: 'out/renderer/assets'
          }
        ],
        hook: 'writeBundle',
        flatten: true, // ← ВАЖНО! Без подпапок
        verbose: true
      })
    ],
    build: {
      outDir: 'out/renderer',
      emptyOutDir: true
    }
  }
});
