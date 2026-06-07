import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Bloom · 나의 주기 다이어리',
        short_name: 'Bloom',
        description:
          '마지막 생리 시작일과 평균 주기를 바탕으로 다음 일정과 컨디션 흐름을 안내합니다.',
        lang: 'ko',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fff7ed',
        theme_color: '#f43f5e',
        icons: [
          {
            src: '/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern:
              /^https:\/\/cdn\.jsdelivr\.net\/gh\/orioncactus\/pretendard@.*\/.*\.(?:css|woff2)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pretendard-assets',
              expiration: {
                maxEntries: 12,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
})
