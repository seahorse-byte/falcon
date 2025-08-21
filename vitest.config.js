import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // This enables DOM APIs for our tests (e.g., document.createElement).
    environment: 'jsdom',
  },
});
