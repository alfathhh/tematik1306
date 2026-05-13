import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    // Treat .geojson files as JSON so Rollup bundles them inline
    {
      name: 'geojson',
      transform(code, id) {
        if (!id.endsWith('.geojson')) return null;
        return { code: `export default ${code}`, map: null };
      },
    },
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
