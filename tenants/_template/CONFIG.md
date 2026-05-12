# CONFIG.md — {Nombre del cliente}

**Tenant ID:** `{tenant-id}`
**Cliente:** {Nombre comercial}
**Ubicación:** {Ciudad, Provincia}
**Estado:** En implementación
**Fecha de alta:** {YYYY-MM}
**Plan:** Mensual USD 30 / Anual USD 300

> Plantilla. Clonar a `tenants/{tenant-id}/CONFIG.md` y completar.
> Leer junto con `SPEC.md` (manual del sistema).

---

## 1. Datos del cliente

| Campo | Valor |
|---|---|
| Nombre comercial | |
| Tagline | |
| Tipo | (boliche / espacio de eventos / club) |
| Dirección | |
| Email | |
| Instagram | |
| Ticketera | (Passline / Alpogo / otra) |
| Edad mínima | (+18 / +21) |
| Frecuencia eventos | |

**Posicionamiento:** (1-2 párrafos: qué quiere transmitir, referencias, qué lo hace distinto)

**Ciclos / colaboraciones activas:** (tags opcionales por evento)

---

## 2. Identidad visual

### 2.1. Logo
- (descripción del logo)
- Archivo: `tenants/{tenant-id}/branding/logo.{ext}` (opcional)

### 2.2. Paleta de colores

Editar `tenants/{tenant-id}/theme.css`. Solo overridear lo que cambia respecto a `core/styles/tokens.css`.

### 2.3. Tipografías
- **Display (titulares):**
- **Cuerpo:**
- URL Google Fonts: `https://fonts.googleapis.com/css2?family=...&display=swap`

### 2.4. Mood y referencias
- (referencias visuales: webs, clubs, festivales)
- (qué evitar y qué buscar)

---

## 3. Estructura de la web

Heredar del SPEC sección 5. Acá solo documentar lo que difiere del template:
- Texto del hero
- Subtítulo de la sección eventos
- Slot custom (sección 4 de este doc)
- Edad mínima
- Cualquier override de UI específico

---

## 4. Slot custom

Diseñado por el operador al onboarding. Vive en `tenants/{tenant-id}/custom-section.html`.

**Concepto:**

**Layout:**

**Animaciones:**

---

## 5. Eventos iniciales

Cargar en `tenants/{tenant-id}/content.json` campo `events[]`. Ejemplo:

| Fecha | Headliner | Soporte | Ciclos |
|---|---|---|---|
| | | | |

---

## 6. Datos editables por el cliente desde el admin

Heredar de SPEC sección 7.1. Solo documentar excepciones.

---

## 7. Dominio

| Opción | Disponible | Decisión |
|---|---|---|
| | | |

---

## 8. Onboarding

### 8.1. Materiales del cliente
- [ ] Logo en alta
- [ ] Flyers de próximos eventos
- [ ] Email para login del admin

### 8.2. Entregables
- URL pública
- URL admin + credenciales
- Tutorial breve

---

**Fin de CONFIG.md.**
