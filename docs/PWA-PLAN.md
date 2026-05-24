# Plan PWA — organización

Plan exhaustivo para convertir **organización** en una PWA instalable, offline-first y coherente con la arquitectura actual (TanStack Start + Nitro + TanStack Query + cola offline).

**Contexto del proyecto hoy**

| Capa | Estado actual | Gap PWA |
|------|---------------|---------|
| Datos offline | Query persist + cola `localStorage` | No hay cache de shell ni assets |
| Sync | `flushPendingTransactions` al reconectar | No hay Background Sync API |
| UI offline | Banner en header (`offline` / `N pend.`) | Falta install prompt, update prompt |
| Server | `createServerFn` vía Nitro | SW no debe cachear `_serverFn` incorrectamente |
| Build | TanStack Start + `nitro/vite` | `vite-plugin-pwa` / Serwist rotos en prod ([issue #4988](https://github.com/TanStack/router/issues/4988)) |

---

## Objetivos

1. **Instalable** en iOS/Android/desktop (Add to Home Screen / Install app).
2. **App shell** precacheado: dashboard carga al instante sin red.
3. **Offline real**: registrar gastos, ver últimos datos cacheados, sync al volver online.
4. **Updates controlados**: `registerType: 'prompt'` — tú decides cuándo recargar (finanzas = no silent stale).
5. **Single-user**: simplicidad > multi-tenant; Turso local en dev, deploy HTTPS en prod.

---

## Restricción crítica: TanStack Start + PWA plugins

Investigación (enero–mayo 2026):

| Fuente | Hallazgo |
|--------|----------|
| [TanStack/router#4988](https://github.com/TanStack/router/issues/4988) | `vite-plugin-pwa` **no ejecuta** build SW en `vite build` con `tanstackStart()` |
| [serwist/serwist#300](https://github.com/serwist/serwist/issues/300) | Serwist falla por `viteConfig.build.ssr === true` en builds Nitro |
| [Discussion #4770](https://github.com/TanStack/router/discussions/4770) | Workaround: plugin custom + `closeBundle` → `.output/public/sw.js` |
| [@neisukee comment (may 2026)](https://github.com/TanStack/router/issues/4988#issuecomment-...) | **SPA mode** + `closeBundleOrder: 'pre'` + `outDir: '.output/public'` + `_shell.html` |
| [Robel Estifanos guide](https://robelest.com/journal/pwa-tanstack-start) | Post-build `workbox-build injectManifest` (manifest solo en VitePWA) |

**Conclusión:** no instalar `vite-plugin-pwa` a ciegas. Elegir **una** estrategia probada abajo.

---

## Estrategia recomendada (3 fases)

### Opción A — SPA mode + vite-plugin-pwa (más simple si aceptas SPA)

> Recomendada para app personal mobile-first donde SSR no aporta mucho.

```ts
// vite.config.ts (extracto)
tanstackStart({ spa: { enabled: true } })

VitePWA({
  registerType: 'prompt',
  injectRegister: false,
  outDir: '.output/public',
  integration: { closeBundleOrder: 'pre' },
  manifest: { /* ver Fase 2 */ },
  workbox: {
    navigateFallback: '/_shell.html',
    navigateFallbackDenylist: [/^\/api\//, /^\/_serverFn\//],
    globPatterns: ['**/*.{js,css,woff2}'],
    additionalManifestEntries: [
      { url: '/_shell.html', revision: BUILD_ID },
    ],
  },
})
```

Registro en `src/client.tsx`:

```tsx
import { registerSW } from 'virtual:pwa-register'
registerSW({ immediate: true, onNeedRefresh: () => { /* toast */ } })
```

**Pros:** menos código custom, documentado en issue #4988.  
**Contras:** pierdes SSR en rutas; loaders siguen corriendo en cliente (ya es el caso práctico en dashboard).

### Opción B — Post-build Workbox (SSR-friendly)

> Si quieres mantener SSR completo.

1. `VitePWA({ injectRegister: false, strategies: 'injectManifest' })` **solo manifest** — o generar `manifest.webmanifest` a mano en `public/`.
2. `scripts/generate-sw.ts` post-`vite build` con `workbox-build injectManifest`.
3. Output a `.output/public/sw.js` (Nitro public assets).

Patrón de [robelest.com/journal/pwa-tanstack-start](https://robelest.com/journal/pwa-tanstack-start).

**Pros:** control total, SSR intacto, navigation NetworkFirst cachea HTML renderizado.  
**Contras:** más scripts de build, mantener `src/sw.ts` a mano.

### Opción C — Serwist + plugin custom TanStack

Plugin `closeBundle` que llama `buildServiceWorker` → `.output/public/` ([discussion #4770](https://github.com/TanStack/router/discussions/4770)).

**Pros:** API moderna, `defaultCache` out of the box.  
**Contras:** bugs abiertos con Nitro; requiere plugin custom.

**Decisión sugerida para organización:** **Opción A** (SPA + VitePWA) — app personal, ya offline-first en datos, SSR no es requisito.

---

## Fase 1 — Fundamentos (1–2 días)

### 1.1 Assets e identidad

Crear en `public/`:

```
public/
├── manifest.webmanifest   (si no usa VitePWA auto)
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── icon-512-maskable.png
├── apple-touch-icon.png
└── favicon.ico
```

**Manifest mínimo (installability Chrome):**

```json
{
  "name": "organización",
  "short_name": "org",
  "description": "Finanzas personales — economía venezolana",
  "start_url": "/dashboard",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#0a0a0a",
  "background_color": "#0a0a0a",
  "lang": "es",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 1.2 Meta tags en `__root.tsx`

```tsx
head: () => ({
  meta: [
    { name: "theme-color", content: "#0a0a0a" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    { name: "mobile-web-app-capable", content: "yes" },
  ],
  links: [
    { rel: "manifest", href: "/manifest.webmanifest" },
    { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
  ],
})
```

### 1.3 Dependencias

```bash
pnpm add -D vite-plugin-pwa workbox-build
# Opción B adicional: workbox-precaching workbox-routing workbox-strategies workbox-expiration
```

### 1.4 Habilitar SPA mode (Opción A)

```ts
tanstackStart({ spa: { enabled: true } })
```

Verificar que `/dashboard` sigue funcionando y que `_shell.html` existe en `.output/public/` tras build.

### 1.5 Verificación build

```bash
pnpm build
ls .output/public/sw.js          # debe existir
ls .output/public/manifest.webmanifest
pnpm preview                     # o deploy staging HTTPS
```

Chrome DevTools → Application → Manifest → "Installability" sin errores.

---

## Fase 2 — Service Worker y caching (2–3 días)

### 2.1 Estrategias por tipo de request

| Recurso | Estrategia Workbox | Razón |
|---------|-------------------|-------|
| JS/CSS/fonts (precache) | **Precache** | App shell instantáneo |
| Navegación `/dashboard` | **NetworkFirst** (3s timeout) → cache | SSR/SPA shell + offline fallback |
| `/_serverFn/*` | **NetworkOnly** | Mutaciones deben ir al server o cola client |
| Tasas API externa (Dolary) | **NetworkFirst** + ExpirationPlugin | Ya cacheadas en SQLite server-side |
| Imágenes | **CacheFirst** | Iconos, poco cambio |

**Denylist obligatoria:**

```ts
navigateFallbackDenylist: [
  /^\/api\//,
  /^\/_serverFn\//,
  /^\/__vite/,
]
```

### 2.2 Integrar con capa offline existente

Tu app **ya tiene**:

- `PersistQueryClientProvider` → cache React Query en `localStorage`
- `offline-queue.ts` → mutaciones pendientes
- `flushPendingTransactions()` → sync al `online`

El SW **no reemplaza** esto; lo complementa:

```
┌─────────────────────────────────────────────────────────┐
│  PWA Service Worker                                      │
│  • Precache shell (JS/CSS)                               │
│  • Offline navigation fallback                           │
└─────────────────────────────────────────────────────────┘
                          +
┌─────────────────────────────────────────────────────────┐
│  App layer (existente)                                   │
│  • Query cache persistido                                │
│  • Cola localStorage + optimistic updates                │
│  • OfflineSync flush                                     │
└─────────────────────────────────────────────────────────┘
```

### 2.3 Background Sync (opcional, Fase 2b)

Para reintentos más robustos que `window.addEventListener('online')`:

```ts
// En SW (Workbox)
import { BackgroundSyncPlugin } from 'workbox-background-sync'

const syncPlugin = new BackgroundSyncPlugin('transaction-queue', {
  maxRetentionTime: 24 * 60, // minutos
})
```

Requiere refactor: cola en IndexedDB accesible desde SW **o** delegar sync solo en app (más simple; **recomendado mantener app-layer** para single-user).

### 2.4 Componente `PwaUpdatePrompt`

```tsx
// src/components/pwa-update-prompt.tsx
// registerType: 'prompt' → toast "Nueva versión" + botón recargar
// onOfflineReady → toast "Lista para usar sin conexión"
```

Integrar en `QueryProvider` o `__root.tsx` (solo cliente).

---

## Fase 3 — UX instalable y polish (1–2 días)

### 3.1 Install prompt

- Escuchar `beforeinstallprompt` → botón discreto en dashboard header ("instalar").
- iOS: instrucciones manuales (Share → Add to Home Screen) — no hay API.

### 3.2 Offline UX unificado

| Estado | UI |
|--------|-----|
| Online | Normal |
| Offline + cache | Banner "sin conexión · datos locales" |
| Offline + cola | "+ N pendientes de sync" (ya existe) |
| SW updating | Toast "actualizando…" |

### 3.3 Rutas y scope

- `start_url: "/dashboard"` — entrada directa al flujo principal.
- Redirect `/` → `/dashboard` (ya existe).
- `scope: "/"` — toda la app bajo un SW.

### 3.4 Seguridad

- **HTTPS obligatorio** en prod (requisito PWA).
- Dev mobile: [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) o `vite --host` + cert local.
- CSP: permitir `worker-src 'self'`.

### 3.5 Lighthouse CI

```bash
pnpm add -D @lhci/cli
```

Script `pnpm lighthouse:pwa` contra preview HTTPS:

- PWA audit ≥ 90
- Installable = pass
- Service worker = registered

---

## Fase 4 — Deploy y Nitro (1 día)

### 4.1 Headers Nitro

```ts
// nitro.config o route rules
'/sw.js': { headers: { 'Cache-Control': 'no-cache' } },
'/manifest.webmanifest': { headers: { 'Content-Type': 'application/manifest+json' } },
```

### 4.2 Turso en prod

- PWA cachea **UI**, no la DB.
- Server functions siguen necesitando red **excepto** mutaciones en cola client.
- Considerar Turso embedded replica / sync futuro (out of scope PWA básica).

### 4.3 Presets probados

| Host | Notas |
|------|-------|
| Vercel | `nitro({ preset: 'vercel' })` |
| Cloudflare | `preset: 'cloudflare-module'` + Workers |
| Node VPS | `preset: 'node-server'` + HTTPS reverse proxy |

---

## Fase 5 — Tests y checklist final

### Tests automatizados

| Test | Herramienta |
|------|-------------|
| Manifest válido | Vitest + schema JSON |
| `buildExpensePayload` + flush | ✅ ya existe |
| SW generado en build | CI script `test -f .output/public/sw.js` |
| E2E offline register | Playwright: go offline → submit → online → synced |

### Checklist manual (Chrome Android)

- [ ] Install prompt aparece tras 2ª visita
- [ ] App abre standalone sin barra URL
- [ ] Offline: dashboard muestra datos cacheados
- [ ] Offline: registrar gasto → aparece + "1 pend."
- [ ] Online: cola se vacía sola
- [ ] Deploy nuevo: toast "nueva versión" (no auto-reload silencioso)
- [ ] iOS Safari: Add to Home Screen funciona

---

## Orden de implementación sugerido

| # | Tarea | Esfuerzo | Dependencia |
|---|-------|----------|-------------|
| 1 | Iconos + manifest + meta tags | 2h | — |
| 2 | SPA mode + VitePWA config (Opción A) | 4h | #1 |
| 3 | `src/client.tsx` registerSW | 1h | #2 |
| 4 | Verificar build `.output/public/sw.js` | 2h | #2 |
| 5 | `PwaUpdatePrompt` component | 2h | #3 |
| 6 | Denylist `_serverFn` + runtime caching | 3h | #4 |
| 7 | Install button + iOS fallback UI | 2h | #4 |
| 8 | Lighthouse CI + deploy HTTPS staging | 3h | #4 |
| 9 | Playwright offline E2E | 4h | #6 |
| 10 | (Opcional) Background Sync IDB | 8h | #6 |

**Total estimado:** 4–6 días para PWA production-ready (sin Background Sync).

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| SW no se genera en build | Verificar Opción A config; fallback Opción B post-build script |
| `_shell.html` no precacheado | `additionalManifestEntries` con BUILD_ID |
| Datos stale en dashboard | `registerType: 'prompt'` + invalidación Query al update |
| iOS limitaciones (no push, sync parcial) | Documentar; cola app-layer suficiente |
| Server functions cacheadas por error | Denylist estricta en Workbox |
| Vitest cuelga post-test | `pool: 'forks'` o `singleThread: true` en vite.config test |

---

## Referencias

- [MDN — Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev — Workbox](https://web.dev/articles/workbox)
- [Chrome — Caching strategies](https://developer.chrome.com/docs/workbox/caching-resources-during-runtime)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [Serwist Vite](https://serwist.pages.dev/docs/vite/getting-started)
- [TanStack Start — Client entry](https://tanstack.com/start/latest/docs/framework/react/guide/client-entry-point)
- [TanStack/router#4988 — PWA incompatibility](https://github.com/TanStack/router/issues/4988)
- [PWA TanStack Start — Robel Estifanos](https://robelest.com/journal/pwa-tanstack-start)

---

## Próximo paso inmediato

Implementar **Fase 1 + Fase 2 con Opción A** en una rama `feat/pwa`:

1. Generar iconos minimalistas (fondo `#0a0a0a`, texto "org" Geist Mono).
2. Añadir `vite-plugin-pwa` con config del issue #4988.
3. Crear `src/client.tsx` si no existe.
4. Probar install en Chrome mobile vía Cloudflare Tunnel.

¿Seguimos con la implementación en código?
