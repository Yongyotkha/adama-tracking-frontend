import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function generateRuntimeConfig() {
  return {
    name: 'generate-runtime-config',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url.startsWith('/config.js')) {
          const mode = server.config.mode;
          const env = loadEnv(mode, server.config.root, 'VITE_');
          const content = `window.__ENV__ = {
  VITE_API_BASE_URL: "${env.VITE_API_BASE_URL || ''}",
  VITE_LIFF_ID: "${env.VITE_LIFF_ID || ''}",
  VITE_IS_UAT: "${env.VITE_IS_UAT || 'false'}",
};`;
          res.setHeader('Content-Type', 'application/javascript');
          res.end(content);
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), generateRuntimeConfig()],
  optimizeDeps: {
    include: ['@mui/x-charts'],
  },
});