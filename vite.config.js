import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // We'll define the JSX transform here, which is a more direct
  // instruction for the underlying bundler (esbuild).
  esbuild: {
    jsxFactory: 'createFalconElement',
    jsxFragment: 'Fragment',
  },
  plugins: [
    // The react plugin is still needed to enable JSX processing in files.
    // We configure it to use the classic runtime, which respects the
    // jsxFactory we defined in the esbuild config above.
    react({
      jsxRuntime: 'classic',
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'FalconJS',
      fileName: format => `falcon.${format}.js`,
    },
    sourcemap: true,
  },
});
