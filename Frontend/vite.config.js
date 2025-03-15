import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist'  // Ensure the build output goes to the 'dist' directory
  },
  server: {
    port: 3000
  },
  preview: {
    port: 3000
  }
})
