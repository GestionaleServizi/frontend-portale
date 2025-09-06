# Frontend Segnalazioni (Vite + React + React Router)

**Client-side only (CSR)** per deployment semplice su Railway/Render/Netlify/...
Niente SSR, niente @react-router/dev.

## Comandi
```bash
npm i
npm run dev
npm run build
npm start   # serve dist su PORT (default 3000)
```

## Struttura
- `src/pages/*` tutte le pagine (Welcome, Login, Admin, Dashboard, Clienti, Segnalazione)
- `src/App.tsx` definisce le route
- `vite.config.ts` pulito
- `Dockerfile` multi-stage: build + runtime con `serve`

## Env
Copia `.env.example` in `.env` e imposta `VITE_API_BASEURL` se vuoi chiamare un backend.
