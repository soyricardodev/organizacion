/// <reference types="vitest/config" />
import { defineConfig } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import viteTsConfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"
import { VitePWA } from "vite-plugin-pwa"
import { tanstackStartVirtualModules } from "./src/vite/tanstack-virtual-modules"

const BUILD_ID = new Date().toISOString()

export default defineConfig({
  plugins: [
    tanstackStartVirtualModules(),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      srcDirectory: "src",
      spa: { enabled: true },
    }),
    viteReact(),
    nitro(),
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      outDir: ".output/public",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png", "apple-touch-icon.png"],
      integration: {
        closeBundleOrder: "pre",
      },
      manifest: {
        name: "organización",
        short_name: "org",
        description: "Finanzas y LoveOps — economía venezolana",
        lang: "es",
        start_url: "/dashboard",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        theme_color: "#0a0a0a",
        background_color: "#0a0a0a",
        shortcuts: [
          {
            name: "Finanzas",
            url: "/dashboard",
            icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
          },
          {
            name: "LoveOps",
            url: "/loveops",
            icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
          },
        ],
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/_shell.html",
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/_serverFn\//,
          /^\/__vite/,
        ],
        globPatterns: ["**/*.{js,css,woff2,ico,png,svg,webmanifest}"],
        additionalManifestEntries: [
          { url: "/_shell.html", revision: BUILD_ID },
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/dolary\.zoysoftware\.com\/api\/rates/,
            handler: "NetworkFirst",
            options: {
              cacheName: "rates-api",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 4,
                maxAgeSeconds: 60 * 30,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "/_shell.html",
        suppressWarnings: true,
      },
    }),
  ],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    pool: "forks",
  },
})
