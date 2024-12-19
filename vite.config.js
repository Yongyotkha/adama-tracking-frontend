import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@mui/x-charts'], // Include MUI X Charts for optimized bundling
  },
});
