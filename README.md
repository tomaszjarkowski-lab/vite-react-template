# MedMetrix Frontend

Vite + React + TypeScript na Cloudflare Workers (Hono). Frontend łączy się z NestJS API `medmetrix-backend`.

## Uruchomienie lokalne

```bash
npm i
npm run dev
```

Aplikacja: http://localhost:3000  
API (`VITE_API_BASE_URL`): http://localhost:3332

## Strony

- `/` — login (magic link)
- `/dashboard` — sesja + wyniki analiz
- `/auth/callback` — callback z tokenami w hashu

## Deploy na Cloudflare Workers

```bash
npm run build
npm run deploy
```

Dry-run / sprawdzenie:

```bash
npm run check
```

Na produkcji ustaw `VITE_API_BASE_URL` na publiczny URL backendu (build-time env), oraz dodaj origin frontendu do CORS na BE.
