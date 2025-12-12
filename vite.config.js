import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    define: {
      // Make environment variables available at build time
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'https://crepa-urbana-backend-production.up.railway.app')
    }
  }
})
