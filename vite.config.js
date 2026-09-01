import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  resolve: {
    extensions: ['.jsx', '.js', '.json'],
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
};
