# Clubsites

Plataforma multi-tenant para hostear webs de boliches y espacios de eventos en Argentina. Cada cliente vive en `tenants/{tenantId}/` con su propia config, theme y slot custom, todo corriendo sobre el mismo código compartido en `core/`.

Para la arquitectura completa, ver [`SPEC.md`](./SPEC.md).
Cada tenant tiene su propio [`CONFIG.md`](./tenants/gotham/CONFIG.md).

---

## Stack

- **Frontend:** HTML/CSS/JS vanilla con ES modules. Sin build step.
- **Hosting:** Cloudflare Pages (pendiente de configurar).
- **Datos:** Firestore (Firebase) — pendiente. Hoy se lee desde JSON local.
- **Storage de imágenes:** Firebase Storage — pendiente. Hoy desde `tenants/{id}/branding/`.
- **Auth admin:** Firebase Auth — pendiente.

---

## Dev local

La estructura multi-tenant necesita un server local (los `fetch` a assets del tenant no funcionan vía `file://`).

```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node sin instalar nada
npx serve -p 8000 .
```

Después abrí:

- Sitio público: <http://localhost:8000/core/public/>
- Override de tenant para QA: <http://localhost:8000/core/public/?tenant=gotham>
- Panel admin (placeholder fase 3): <http://localhost:8000/core/public/admin/>

### Preview standalone (sin server)

[`preview-gotham.html`](./preview-gotham.html) en la raíz es un standalone con todo inline. Abrilo con doble click para ver el diseño rápido, sin levantar nada.

---

## Estructura

```
clubsites/
├── SPEC.md                       # Manual de la plataforma
├── README.md                     # Este archivo
├── preview-gotham.html           # Preview standalone (no requiere server)
├── tenants-map.json              # hostname → tenantId
├── .gitignore                    # Qué NO commitear
├── .gitattributes                # Normalización LF
│
├── core/                         # Código compartido entre todos los tenants
│   ├── public/
│   │   ├── index.html            # Shell del sitio público
│   │   └── admin/
│   │       └── index.html        # Stub del panel admin (fase 3)
│   ├── styles/
│   │   ├── tokens.css            # Variables CSS por defecto
│   │   ├── base.css              # Reset, container, prefers-reduced-motion
│   │   ├── components.css        # Botones, cards, chips, pillars
│   │   └── sections.css          # Header, hero, eventos, mapa, redes, footer
│   ├── js/
│   │   ├── app.js                # Entry point
│   │   ├── tenant-loader.js      # Resuelve hostname → tenantId y carga assets
│   │   ├── content-engine.js     # Hidrata el shell con datos del tenant
│   │   ├── events-engine.js      # Render de eventos
│   │   └── firebase-config.js    # Stub (fase 2)
│   └── firebase/
│       ├── firestore.rules       # Reglas multi-tenant (Firestore)
│       ├── storage.rules         # Reglas multi-tenant (Storage)
│       └── firebase.json         # Config rules + emuladores
│
└── tenants/
    ├── _template/                # Plantilla para clonar al alta de un cliente
    │   ├── CONFIG.md
    │   ├── theme.css
    │   ├── content.json
    │   └── custom-section.html
    │
    └── gotham/                   # Tenant: Gotham Experience (Bariloche)
        ├── CONFIG.md
        ├── theme.css             # Overrides de tokens (rojo + negro + Manrope)
        ├── content.json          # Brand, location, social, footer, events[]
        ├── custom-section.html   # Slot "La Experiencia" con 3 pilares
        └── branding/
            ├── README.md         # Dónde van logo y flyers reales
            ├── logo.png          # Logo del cliente
            └── flyers/           # Flyers por evento (evt-XXX.jpg)
```

---

## Tenants vivos

| Tenant ID | Cliente | Estado | Dominio |
|---|---|---|---|
| `gotham` | Gotham Experience (Bariloche) | En implementación | Pendiente |

---

## Onboarding de un cliente nuevo

1. Clonar `tenants/_template/` a `tenants/{tenantId}/`.
2. Editar `CONFIG.md`, `theme.css`, `content.json` y `custom-section.html`.
3. Dropear logo y flyers en `tenants/{tenantId}/branding/`.
4. Agregar entrada en `tenants-map.json` mapeando el dominio del cliente al tenantId.
5. (Fase 2) Crear documentos en Firestore + usuario admin con `customClaims.tenantId`.
6. (Fase 2) Configurar custom domain en Cloudflare Pages.
7. QA local con `?tenant={tenantId}`, después deploy.

Pasos detallados en `SPEC.md` sección 8.

---

## Subir a GitHub

El repo todavía no está inicializado. Pasos:

```bash
# 1) Inicializar git
git init -b main

# 2) Primer commit
git add .
git status   # revisar que no esté commiteando nada raro
git commit -m "feat: estructura multi-tenant inicial + tenant Gotham"

# 3) Crear el repo en GitHub (vacío, sin README ni .gitignore) y agregarlo
git remote add origin git@github.com:TU_USUARIO/clubsites.git
git push -u origin main
```

**Antes del primer push, revisá:**

- [ ] Borrar manualmente el `CONFIG.md` de la raíz si todavía existe (es duplicado — el canónico está en `tenants/gotham/CONFIG.md`). El `.gitignore` ya lo excluye, pero conviene dejarlo limpio.
- [ ] Confirmar que el repo va a ser **privado** (recomendado, así podés commitear logos y flyers del cliente sin issues legales). Si va a ser **público**, descomentá en `.gitignore` las líneas de `tenants/*/branding/*.png|jpg`.
- [ ] No commitear `core/js/firebase-config.js` con keys reales cuando lo conectes. Las keys van por env vars de Cloudflare Pages.

---

## Estado del proyecto

**Fase 1 (actual) — Estructura + mock data.** ✅ Listo.
- Shell HTML + CSS modular.
- Tenant-loader leyendo de `/tenants/{id}/content.json`.
- Gotham renderiza completo desde JSON local con logo real (con fallback SVG).

**Fase 2 — Firebase.** Pendiente.
- Crear proyecto Firebase (plan Blaze).
- Completar `core/js/firebase-config.js` con credenciales.
- Switch en `tenant-loader.js` para leer de Firestore en vez de JSON local.
- Seed inicial de Gotham (script que push'ea `content.json` a Firestore).
- Deploy de `firestore.rules` y `storage.rules`.

**Fase 3 — Panel admin.** Pendiente.
- Login con Firebase Auth.
- CRUD de eventos.
- Upload de flyers a Firebase Storage.
- Edición de contenido y datos básicos.

**Fase 4 — Deploy a producción.** Pendiente.
- Cloudflare Pages conectado al repo.
- Custom domain por tenant.
- Budget alerts + kill switch en Google Cloud.

---

## Convenciones

- **HTML/CSS/JS vanilla.** Sin build step, sin frameworks.
- **ES modules** en JS (`type="module"`).
- **CSS:** BEM modificado, kebab-case en clases.
- **Tenants:** `tenantId` lowercase, sin espacios, sin caracteres especiales. Una vez asignado, no se cambia.
- **Tipografía:** Manrope (cargada por tenant via `brand.googleFonts`), pesos 200-800. Display = 700/800. Body = 400/500.
- **Paleta default:** neutra (gris). Cada tenant override con sus brand colors en `theme.css`.
- **No commitear keys reales** en `firebase-config.js`. Usar variables de entorno de Cloudflare Pages al deployar.
