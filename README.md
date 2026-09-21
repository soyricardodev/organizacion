# Organización

Local-first personal finance software designed for the Venezuelan economy.

> Experimental project. Use synthetic data when sharing screenshots or demos.

**Stack:** TanStack Start · Drizzle · libSQL · Dinero.js · OpenRouter (AI SDK)

## Inicio rápido

```bash
cp .env.example .env
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `TURSO_DATABASE_URL` | `file:local.db` en dev, `libsql://…` en prod |
| `RATES_API_URL` | Default: `https://dolary.zoysoftware.com/api/rates` |
| `OPENROUTER_API_KEY` | API key de [OpenRouter](https://openrouter.ai) |
| `OPENROUTER_MODEL` | Default: `deepseek/deepseek-r1-distill-qwen-32b` (barato + razonamiento) |

## Scripts

- `pnpm dev` — desarrollo (http://localhost:3000)
- `pnpm db:push` — sincronizar esquema
- `pnpm db:seed` — datos iniciales (ahorros en $0)
- `pnpm db:reset` — borrar DB local y volver a sembrar desde cero
- `pnpm db:studio` — editar deudas, buckets y metas

## UI

Dark mode por defecto, Geist Mono, estética minimalista tipo Vercel — bordes sutiles, labels uppercase, barras de progreso de 1px.

## Offline y PWA

- **Datos offline:** cache React Query + cola de mutaciones en `localStorage` + sync al reconectar.
- **PWA:** instalable, service worker con app shell (`/_shell.html`), updates con prompt manual.
- **Dev PWA:** el service worker está habilitado en desarrollo; para probar install en móvil usa HTTPS (p. ej. Cloudflare Tunnel).
- **Build:** genera `sw.js` y `manifest.webmanifest` en `.output/public/`.
- Detalle técnico: [docs/PWA-PLAN.md](./docs/PWA-PLAN.md)
