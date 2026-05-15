import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: { entry: 'electron/main.ts' },
      rollupOptions: {
        output: { format: 'cjs', entryFileNames: 'index.cjs' },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: { entry: 'electron/preload.ts' },
      rollupOptions: {
        output: { format: 'cjs', entryFileNames: 'index.cjs' },
      },
    },
  },
  renderer: {
    root: '.',
    server: { port: 5616 },
    build: {
      rollupOptions: { input: './index.html' },
      outDir: 'out/renderer',
      emptyOutDir: true,
    },
    plugins: [
      react(),
      // Strip `crossorigin` from built HTML — file:// protocol in Electron
      // doesn't support CORS headers, blocking module scripts and stylesheets.
      {
        name: 'remove-crossorigin',
        enforce: 'post' as const,
        transformIndexHtml: (html: string) => html.replace(/ crossorigin/g, ''),
      },
    ],
  },
})
