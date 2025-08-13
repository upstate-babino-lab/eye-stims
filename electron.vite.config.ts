import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        '@src': resolve('src'),
        '@renderer': resolve('src/renderer'),
        '@stims': resolve('src/stims'),
        '@assays': resolve('src/specs'),
      },
    },
    plugins: [react()],
    assetsInclude: ['**/*.otf', '**/*.ttf', '**/*.woff2'],
    build: {
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name][extname]',
        },
      },
    },
    base: './',
  },
});
