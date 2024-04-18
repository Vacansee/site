import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/app/',
  plugins: [
    vue(),
    svgLoader({
      svgo: false
    }),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      // Used to build the manifest.json file for PWAs:
      manifest: { 
        name: 'Vacansee',
        short_name: 'Vacansee',
        description: 'Predicting campus occupancy and room availability @ RPI',
        background_color: '#ffffff',
        theme_color: '#b6c1cd',

        display_override: ['window-controls-overlay'],
        display: 'standalone',
        icons: [
          {
            src: 'icon.png',
            sizes: '144x144',
            type: 'image/png'
          },
        ]
      }
    })
  ],
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
