import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' => le build fonctionne aussi sur GitHub Pages (sous-dossier)
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173 },
});
