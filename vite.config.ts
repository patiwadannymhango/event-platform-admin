import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Deploys standalone on Vercel at its own domain root — no path prefix
  // needed (this used to be served under /dashboard behind a shared
  // Caddy origin; now it's a fully separate deployment from the backend
  // and the public site, so `base` stays at Vite's default '/').
  build: {
    rollupOptions: {
      output: {
        // Split MUI/DataGrid/Charts into their own chunk — they're large
        // but change far less often than app code, so this keeps repeat
        // visits fast via browser caching.
        manualChunks(id) {
          if (id.includes('@mui/x-data-grid') || id.includes('@mui/x-charts')) {
            return 'mui-x';
          }
          if (id.includes('@mui') || id.includes('@emotion')) {
            return 'mui';
          }
        },
      },
    },
  },
})
