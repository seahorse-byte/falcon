import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // This section tells the build tool (esbuild) to use our custom functions
  // whenever it sees JSX syntax.
  esbuild: {
    jsxFactory: 'createFalconElement',
    jsxFragment: 'Fragment',
    // --- THE FIX IS HERE ---
    // This tells esbuild to treat .js files as .jsx files,
    // which is necessary for Vite's dependency scanner.
    loader: {
      '.js': 'jsx',
    },
  },
  plugins: [
    // We configure the React plugin to use our custom settings.
    react({
      // This is the crucial part. It tells the plugin to use the "classic"
      // runtime, which relies on the jsxFactory setting above, instead of
      // trying to automatically import from React.
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
