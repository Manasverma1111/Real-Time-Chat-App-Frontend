import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    global: 'window', // ✅ THIS FIXES THE ERROR
  },
});
