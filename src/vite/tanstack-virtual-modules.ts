import type { Plugin } from "vite"

/** Workaround: SSR runner no resuelve el virtual module de TanStack Start en dev */
export function tanstackStartVirtualModules(): Plugin {
  const injectedId = "\0tanstack-start-injected-head-scripts:v"

  return {
    name: "tanstack-start-virtual-modules",
    enforce: "pre",
    resolveId(source) {
      if (source === "tanstack-start-injected-head-scripts:v") {
        return injectedId
      }
      return null
    },
    load(id) {
      if (id === injectedId) {
        return `export const injectedHeadScripts = ""`
      }
      return null
    },
  }
}
