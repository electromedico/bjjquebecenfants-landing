# BJJ Québec Enfants — Landing

Landing statique (FR) : Astro + Cloudflare Pages, déployée par CI.
Inspirée de `locabot-landing` (même stack, mêmes workflows).

## Dev local

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # vérifie que le site compile (sortie: dist/)
npm run check    # astro check (types)
```

## Secrets GitHub requis (Settings → Secrets → Actions)

| Secret | Uso |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Token API Cloudflare (permiso Pages:Edit) |
| `CLOUDFLARE_ACCOUNT_ID` | ID de la cuenta Cloudflare |

El proyecto Pages se llama como el repo (`github.event.repository.name`)
y se crea en el primer deploy. Carga local: completar `.env` y correr
`./scripts/load-gh-secrets.sh`.

A futuro: Turnstile + Resend para el formulario (el código ya los soporta
y degrada si faltan: sin widget, sin envío, pero el form responde `ok`).

## CI

- Push a `main` → `deploy.yml`: build + `wrangler pages deploy` a producción.
- PR → `preview.yml`: deploy preview + comentario con la URL en el PR.
  Al cerrar el PR se borran los previews.

## Estructura

- `src/pages/` — rutas (`index.astro` = homepage FR).
- `src/components/layout/` — `Layout`, `Header`, `Footer`.
- `src/components/sections/` — Hero, Programs, Why, Faq, ContactForm.
- `src/styles/global.css` — sistema base (vars, botones, formularios).
- `functions/api/contact.js` — Pages Function del formulario.
