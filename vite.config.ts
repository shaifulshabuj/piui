import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Used for web-only builds (`npm run dev:web` / `npm run build:web`).
// Electron builds use electron.vite.config.ts instead.
export default defineConfig({
  plugins: [react()],
  base: './',
})
