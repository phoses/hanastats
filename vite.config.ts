import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const useMock =
    process.env.VITE_USE_MOCK === 'true' || mode === 'mock'

  const mockPath = (file: string) =>
    fileURLToPath(new URL(`./src/mocks/firebase/${file}`, import.meta.url))

  const firebaseAliases = useMock
    ? {
        'firebase/app': mockPath('app.ts'),
        'firebase/auth': mockPath('auth.ts'),
        'firebase/database': mockPath('database.ts'),
        '@firebase/database': mockPath('database.ts'),
      }
    : {}

  return {
    plugins: [vue(), vueJsx()],
    resolve: {
      alias: {
        ...firebaseAliases,
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
