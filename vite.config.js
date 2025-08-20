import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    // This is the part that tells Vite we are building a library.
    lib: {
      // The entry point for our library.
      entry: path.resolve(__dirname, 'src/index.js'),
      // The name for the global variable in UMD builds.
      name: 'FalconJS',
      // The file names for the output bundles.
      fileName: format => `falcon.${format}.js`,
    },
    // We don't need to worry about this for now, but it can be useful for debugging.
    sourcemap: true,
  },
});
