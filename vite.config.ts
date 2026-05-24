/// <reference types="vitest/config" />
import { defineConfig } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import viteTsConfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"
import { tanstackStartVirtualModules } from "./src/vite/tanstack-virtual-modules"

export default defineConfig({
  plugins: [
    tanstackStartVirtualModules(),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      srcDirectory: "src",
    }),
    viteReact(),
    nitro(),
  ],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
})
