# Branding · Gotham

Carpeta donde van los assets visuales reales del cliente. El código los toma automáticamente y cae de vuelta a placeholders si no existen.

## Estructura esperada

```
branding/
├── logo.png            # Logo activo (negro pleno + crescent + texto). Usado por el sitio.
├── logo-original.png   # Backup del primer PNG entregado por el cliente (con fondo blanco)
└── flyers/
    ├── evt-001.jpg     # SÁB 16.05 — Fernanda Pistelli
    ├── evt-002.jpg     # DOM 31.05 — Fiesta de Hitazos
    ├── evt-003.jpg     # SÁB 06.06 — Gotham × MTN × TSOM
    └── evt-004.jpg     # SÁB 13.06 — D-Nox
```

**Naming de flyers:** cada flyer va con el `id` del evento (mirá `content.json` campo `events[].id`). Si renumerás eventos, renombrá también el archivo.

## Cómo funciona

- **Logo:** si dropeás `logo.png` (o `logo.svg`), el renderer usa la imagen. Si no, cae al SVG generado inline. Para activarlo, settear `brand.logoUrl` en `tenants/gotham/content.json` apuntando a `/tenants/gotham/branding/logo.png`.
- **Flyers:** cada evento en `content.json` tiene un campo `flyerUrl` que apunta a `/tenants/gotham/branding/flyers/{id}.jpg`. Si la imagen existe, se renderiza encima del gradient. Si 404ea, queda el gradient (manejo del fallback vía `onerror` en `events-engine.js`).

## Especificaciones técnicas

### Logo
- Formato: PNG con transparencia, o SVG.
- Tamaño mínimo: 256×256 px (para que se vea nítido en hero a 128px y retina).
- Si es PNG, ideal 512×512 para mobile retina + desktop.

### Flyers
- Formato: JPG (preferido) o WEBP.
- Aspect ratio: **1:1.4 vertical** (formato Instagram Story / Passline).
- Tamaño recomendado: **800×1120 px** (suficiente para la card al doble de densidad).
- Peso máximo: 200 KB por flyer (comprimido).
- Naming: usar el `id` del evento en `content.json` (ej: `evt-001.jpg`).

## Notas

- **Estos archivos no se commitean** si tienen logos/flyers con derechos de autor del cliente. Considerar agregar a `.gitignore` los `*.jpg` y `*.png` si el repo es público.
- Para v2 (Firebase activo), los flyers van a **Firebase Storage** en `/tenants/gotham/events/{eventId}/flyer.jpg`, no en esta carpeta. Esta carpeta es solo para fase 1 (mock mode local).
