import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Safely expose the API_KEY from Vercel build environment to the browser code
    // This allows `process.env.API_KEY` to work without changing the app code.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});