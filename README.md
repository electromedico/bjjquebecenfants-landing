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

## Turnstile (formulario de contacto)

- **Site key** (pública): hardcodeada en los workflows
  (`PUBLIC_TURNSTILE_SITE_KEY`); Astro la inlinea en el build y el widget
  se renderiza en `ContactForm.astro` con `action: contact`.
- **Runtime** (variables del proyecto Pages, entornos production y preview):
  - `TURNSTILE_SECRET_KEY` — secret key del widget (sensible).
  - `TURNSTILE_HOSTNAMES` — allowlist exacta de hostnames que siteverify
    acepta (soporta sufijos `*.`). En prod: dominios reales del site;
    nunca `localhost`.
- Verificación server-side en `functions/api/contact.js`: exige
  `success === true`, `action === contact` y hostname en la allowlist.
  Los tokens son single-use: el frontend hace `turnstile.reset()` tras
  cada intento fallido para permitir reintentos.
- Dev local: `.env` define `TURNSTILE_HOSTNAMES=localhost,127.0.0.1,...`.
- Nota: las variables de proyecto Pages se capturan al crearse el
  deployment — cambiarlas exige un nuevo deploy (push a `main`).

## Resend (envío de mails del formulario)

- **Runtime** (variables del proyecto Pages, entornos production y preview):
  - `RESEND_API_KEY` — API key de Resend (sensible; key restringida a solo envío).
  - `RESEND_FROM` — remitente: `BJJ Québec Enfants <noreply@mailhighway.com>`
    (dominio verificado en Resend).
  - `RESEND_TO` — destino de los mensajes. Provisional:
    `agent@mailhighway.com` (cambiar a la inbox definitiva cuando haya).
- `functions/api/contact.js` degrada si falta `RESEND_API_KEY` (el form
  responde `ok` sin enviar nada) y responde `502 email_failed` si Resend
  rechaza el envío (no hay fallo silencioso).

## CI

- Push a `main` → `deploy.yml`: build + `wrangler pages deploy` a producción.
- PR → `preview.yml`: deploy preview + comentario con la URL en el PR.
  Al cerrar el PR se borran los previews.

## Estructura

- `src/pages/` — rutas (`index.astro` = homepage FR).
- `src/components/layout/` — `Layout`, `Header`, `Footer`, `StickyCta` (CTA fija abajo, mobile: libellé exacto, visible entre el hero y el formulario).
- `src/components/sections/` — Hero, Programs, Why, Instructeurs, Temoignages, WhereAndWhen, Faq, ContactForm.
- `src/styles/global.css` — sistema base (vars, botones, formularios).
- `functions/api/contact.js` — Pages Function del formulario.
