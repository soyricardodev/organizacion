# organización

Plataforma de gestión financiera para la economía venezolana.

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

- `pnpm dev` — desarrollo
- `pnpm db:push` — sincronizar esquema
- `pnpm db:seed` — datos demo

## UI

Dark mode por defecto, Geist Mono, estética minimalista tipo Vercel — bordes sutiles, labels uppercase, barras de progreso de 1px.
