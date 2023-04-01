import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/app/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Vacansee',
        short_name: 'Vacansee',
        description: 'Predicting campus occupancy and room availability @ RPI',
        background_color: '#ffffff',
        theme_color: '#b6c1cd',

        display_override: [ 'window-controls-overlay' ],
        display: 'standalone',
        icons: [
          {
            src: 'public/icon.png',
            sizes: '144x144',
            type: 'image/png'
          },
        ]
      }
    })
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
