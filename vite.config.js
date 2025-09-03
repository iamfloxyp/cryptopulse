import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // dev-only fallback straight to CoinGecko when /api-cg/* is used
      '/api-cg': {
        target: 'https://api.coingecko.com/api/v3',
        changeOrigin: true,
        secure: true,
        rewrite: p => p.replace(/^\/api-cg/, ''),
        headers: { accept: 'application/json', 'user-agent': 'cryptopulse' }
      }
    }
  }
});