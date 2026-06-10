import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // axios and the api client must share a chunk: api.js calls
            // axios.create() at module top level, and if the bundler splits
            // them apart the api chunk can execute before the chunk holding
            // axios has initialized (circular chunk imports), crashing the
            // app at startup with "Cannot read properties of undefined".
            {
              name: 'api-client',
              test: /node_modules[\\/]axios[\\/]|src[\\/]services[\\/]api\.js/,
              priority: 100,
            },
          ],
        },
      },
    },
  },
})
