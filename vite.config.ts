import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/poker/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
});
