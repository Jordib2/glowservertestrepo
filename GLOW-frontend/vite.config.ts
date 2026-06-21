import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.svg',
        'pwa-192x192.png',
        'pwa-512x512.png',
      ],

      manifest: {
        id: '/',
        name: 'GLOW',
        short_name: 'GLOW',
        description: 'Digital storytelling and projection platform for GLOW',

        theme_color: '#000000',
        background_color: '#000000',

        display: 'standalone',
        start_url: '/',

        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],

        screenshots: [
          {
            src: '/screenshot-mobile.png',
            sizes: '540x720',
            type: 'image/png',
          },
          {
            src: '/screenshot-desktop.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
          },
        ],
      },

      devOptions: {
        enabled: true,
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//],   // ← THIS IS THE KEY LINE
        skipWaiting: true,        // ← new
        clientsClaim: true,       // ← new

      },
    }),
  ],
})
