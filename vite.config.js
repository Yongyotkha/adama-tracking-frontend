import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function writeConfigJs(config) {
  const env = config.env;
  const content = `
window.__ENV__ = {
  VITE_API_BASE_URL: "${env.VITE_API_BASE_URL || ''}",
  VITE_LIFF_ID: "${env.VITE_LIFF_ID || ''}",
  VITE_IS_UAT: "${env.VITE_IS_UAT || 'false'}",
};
`;
  const outPath = path.resolve(config.root, 'public/config.js');
  fs.writeFileSync(outPath, content, 'utf-8');
  console.log('[config.js] generated →', outPath);
}

function generateRuntimeConfig() {
  return {
    name: 'generate-runtime-config',
    configResolved(config) {
      writeConfigJs(config);
    },
  };
}

export default defineConfig({
  plugins: [react(), generateRuntimeConfig()],
  optimizeDeps: {
    include: ['@mui/x-charts'],
  },
});
