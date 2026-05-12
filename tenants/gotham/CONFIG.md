# CONFIG.md — Gotham Experience

**Tenant ID:** `gotham`
**Cliente:** Gotham Experience
**Ubicación:** Bariloche, Río Negro, Argentina
**Estado:** En implementación
**Fecha de alta:** Mayo 2026
**Plan:** Mensual USD 30

> Este documento es la especificación del tenant Gotham. Se lee junto con SPEC.md (manual del sistema) para construir su web.

---

## 1. Datos del cliente

| Campo | Valor |
|---|---|
| Nombre comercial | Gotham Experience |
| Tagline | Gotham Experience — BRC |
| Tipo | Espacio de eventos / boliche electrónico premium |
| Dirección | Elflein 149, Bariloche, Río Negro |
| Email | experiencegotham@gmail.com |
| Instagram | @gotham.bariloche (https://instagram.com/gotham.bariloche) |
| Linktree | linktr.ee/GothamExperience (NO se incluye en la web) |
| Ticketera | Passline |
| Edad mínima | +21 |
| Frecuencia eventos | ~5 por mes (viernes y sábados principalmente) |

**Posicionamiento:** Gotham no es un boliche cualquiera, es una marca de "experiencias" electrónicas de gama alta en Bariloche. Tiene 9.5K+ seguidores en Instagram, programa DJs internacionales y argentinos top (D-Nox, Emiliano Demarco, John Cosani, Fernanda Pistelli), maneja sistema de membresía (Black Pass / Red Pass), hace sorteos pulidos, comunica con estética cuidada. La web tiene que estar a la altura: premium, oscura, cinematográfica.

**Diferencial técnico que comunica:** última tecnología en sonido, luces y pantallas LED.

**Ciclos / colaboraciones activas:** Undermove, Ciclic, Dharma, Exp.360, CrobarTrip, MTN, TSOM, Zisko. Aparecen como tags opcionales en cada evento.

---

## 2. Identidad visual

### 2.1. Logo

- Disco negro sólido (sin border de color — el ring magenta/naranja que aparece en redes es el ring del avatar de Instagram, no es parte del logo).
- Reflejo lunar sutil en el cuadrante superior-izquierdo (highlight blanco arqueado).
- Texto interno "GOTHAM" en sans-serif medium-bold + "EXPERIENCE" debajo en light tracked.
- **Archivo:** `tenants/gotham/branding/logo.png` (provisto por el cliente).
- Referenciado en `content.json` vía `brand.logoUrl`. Fallback: SVG inline en `core/js/content-engine.js` con la misma estética (disco negro + reflejo lunar + tipografía Manrope 700/300).

### 2.2. Paleta de colores (CSS tokens)

> **Corrección de paleta — Mayo 2026.** La versión original de este CONFIG describía el logo con un "borde gradient magenta → naranja → amarillo". Ese gradient **no es parte del logo**: es el ring del avatar de Instagram Story. El logo real es un disco negro con reflejo lunar y texto blanco. Paleta corregida a **rojo + negro** replicando los flyers reales de Gotham (Sold Out, Sorteamos 10 Red Pass, 10 Black Pass).

```css
:root {
    /* Backgrounds — negro pleno para matchear el fondo del logo PNG */
    --color-bg: #000000;              /* Negro absoluto (matchea logo.png) */
    --color-bg-elevated: #121212;     /* Cards, modals — sutilmente elevado del bg */
    --color-bg-input: #1a1a1a;        /* Inputs en admin */

    /* Text */
    --color-text: #ffffff;            /* Texto principal */
    --color-text-muted: #a3a3a3;      /* Texto secundario, captions */
    --color-text-dim: #6b6b6b;        /* Texto terciario, placeholders */

    /* Brand: rojo Gotham (paleta a dos colores, rojo + negro) */
    --color-primary: #dc2626;         /* red-600 — brand red de los flyers */
    --color-primary-hover: #ef4444;   /* red-500 — hover */
    --color-primary-deep: #991b1b;    /* red-800 — depth para glows */
    --color-accent: #dc2626;          /* misma referencia: dos colores únicos */
    --color-accent-hover: #ef4444;

    /* Gradient sutil para hovers y elementos con depth */
    --gradient-brand: linear-gradient(135deg, #ef4444 0%, #991b1b 100%);

    /* Estado / utilidad */
    --color-danger: #dc2626;          /* coincide con el brand red — los Sold Out son del mismo rojo */
    --color-success: #16a34a;
    --color-border: #262626;
    --color-border-elevated: #404040;

    /* Glow para hovers y CTAs */
    --shadow-glow-primary: 0 0 32px rgba(220, 38, 38, 0.5);
}
```

### 2.3. Tipografías

- **Display (titulares):** Anton (fallback Bebas Neue). Sans-serif condensada, peso fuerte. Replica el feel de los flyers de Gotham (mayúsculas, impacto).
- **Cuerpo:** **Manrope**. Sans humanista con carácter geométrico — más distintiva que Inter, conserva la legibilidad. Decisión tomada en el preview standalone, sustituye el `Inter` que aparecía en versiones previas.
- **Eventos (fechas, nombres):** font-display en mayúsculas con letter-spacing aumentado, replicando el formato Passline ("SÁB 16.05 – FERNANDA PISTELLI").

```css
:root {
    --font-display: 'Anton', 'Bebas Neue', sans-serif;
    --font-body:    'Manrope', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}
```

Cargar desde Google Fonts en el `<head>` con `display=swap`. URL canónica:
`https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Manrope:wght@400;500;600;700&display=swap`

### 2.4. Mood y referencias

- **Cinematográfico, oscuro, premium.**
- Referencias visuales: webs de festivales electrónicos internacionales (Time Warp, Awakenings), club Berghain, Boiler Room.
- **No** usar: estética rave colorida, neón saturado tipo "fiesta de los 80", dorados barrocos.
- **Sí** usar: gradients sutiles del logo en hover/CTA, mucho espacio negativo, tipografía grande, transiciones suaves.

---

## 3. Estructura de la web

### 3.1. Header

- Logo Gotham circular (44px de alto).
- Nav (desktop): Eventos · La Experiencia · Cómo llegar · Instagram (icono).
- Mobile: hamburguesa.
- Background: transparente al inicio, se vuelve `--color-bg` con blur al hacer scroll.

### 3.2. Hero

- **Pantalla:** 90vh.
- **Fondo:** negro con gradient radial sutil del logo (magenta → naranja → transparente) en el centro-arriba, simulando un destello.
- **Animación de fondo:** un blur/glow muy lento que se mueve, dando sensación de movimiento sin distraer.
- **Contenido:**
    - Logo grande centrado (o desplazado a la izquierda en desktop).
    - Título: `GOTHAM EXPERIENCE` en font-display, ~80-120px desktop. Apilado en dos líneas (espeja la jerarquía del logo).
    - Subtítulo: `Bariloche` en font-body, mayúsculas, letter-spacing alto, color muted.
    - CTA primario: "Ver próximos eventos" → scroll suave a sección eventos. Background con gradient brand, shadow-glow al hover.
    - CTA secundario: "Comprar entradas" → link a Passline. Outline white.
- **Mobile:** logo más chico, título 48-64px, CTAs apilados.

### 3.3. Próximos eventos

- **Título de sección:** "PRÓXIMOS EVENTOS" en font-display.
- **Subtítulo:** opcional, "Reservá tu lugar antes que se agote." en font-body muted.
- **Grid:** desktop 2 columnas (cards grandes verticales), tablet 2 columnas, mobile 1 columna.
- **Card de evento:**
    - Flyer arriba (aspect ratio 1:1.4, replica el formato Instagram story).
    - Fecha en formato "SÁB 16.05" en gradient brand (texto), font-display.
    - Headliner en font-display blanco (ej: "FERNANDA PISTELLI"), mayúsculas.
    - Soporte en font-body muted (ej: "Nico Cano · Pablo Yang").
    - Tags de ciclos: chips pequeños con borde primary (ej: "GOTHAM + CICLIC"). Opcional.
    - Si `soldOut == true`: badge rojo grande superpuesto al flyer "SOLD OUT" diagonal.
    - Botón: "Comprar entradas" con gradient brand. Si sold out: "Sold Out" deshabilitado.
- **Vacío:** si no hay eventos próximos: mensaje centrado "Próximos eventos en preparación. Seguinos en Instagram para enterarte primero." con icono de Instagram link.
- **Cantidad:** mostrar 4-6 próximos eventos. Si hay más de 6, paginación o "Ver todos" (en v1 no se implementa, alcanza con 6).

### 3.4. Slot custom: "LA EXPERIENCIA"

Esta es la sección única de Gotham. Diseñada para comunicar el diferencial técnico (sonido + luces + pantallas) sin fotos.

**Layout:**

- Título grande font-display: "LA EXPERIENCIA"
- Subtítulo font-body: "Tres pilares que hacen de cada noche un evento."
- 3 cards / pilares en grid (desktop 3 columnas, mobile 1 columna apilada):

**Pilar 1 — SONIDO**
- Icono SVG custom: un altavoz minimalista o ondas de audio.
- Título: "SONIDO"
- Texto corto (50-70 palabras): texto sobre el sistema de audio. Algo tipo:
  > "Sistema line array de última generación. Cada frecuencia donde tiene que estar, sin distorsión, sin pérdida. La diferencia entre escuchar música y sentirla."
- Animación: las ondas del icono pulsan sutilmente.

**Pilar 2 — LUCES**
- Icono SVG custom: rayo de luz, o varios haces.
- Título: "LUCES"
- Texto corto:
  > "Cabezas móviles, lasers y mapping sincronizado a cada track. Iluminación que no acompaña la música: la traduce."
- Animación: el icono cambia de color sutilmente entre tonos del gradient brand.

**Pilar 3 — PANTALLAS**
- Icono SVG custom: una grilla LED, varios cuadrados.
- Título: "PANTALLAS"
- Texto corto:
  > "Paredes LED de alta densidad con visuales en 4K, generados en vivo o curados por cada artista. La pista de baile como obra audiovisual."
- Animación: los cuadrados de la grilla parpadean en patrón.

**Estilo visual:**

- Fondo: `--color-bg` con un overlay sutil de gradient brand al 5% de opacidad.
- Cards: fondo `--color-bg-elevated` con borde 1px `--color-border`. En hover: borde se vuelve gradient brand (1px), shadow-glow-primary aparece sutil.
- Iconos: SVG monocromáticos blancos por defecto, en hover toman el color primary o accent.
- Texto: alineado a la izquierda dentro de cada card.

**Animaciones de entrada:**

- Las 3 cards aparecen con stagger (delay incremental 0.1s entre cada una).
- Fade in + slide up 20px.
- Trigger: cuando la sección entra al viewport (Intersection Observer).

### 3.5. Cómo llegar

- Título: "CÓMO LLEGAR".
- Mapa Google Maps embebido (iframe estándar, dirección Elflein 149 Bariloche).
- Bordes redondeados, sin sombra, ocupa todo el ancho del container.
- Debajo del mapa:
    - Dirección: "Elflein 149, San Carlos de Bariloche, Río Negro".
    - Link: "Abrir en Google Maps" (abre en nueva pestaña).
    - Edad mínima: "+21 años" (chip distintivo).

### 3.6. Redes y contacto

- Título: "SEGUINOS".
- Layout: centrado.
- Logo de Instagram grande (~80px), link a https://instagram.com/gotham.bariloche.
- Handle visible: "@gotham.bariloche" con hover en gradient brand.
- Mail: "experiencegotham@gmail.com" (link `mailto:`).
- **No incluir Linktree.**

### 3.7. Footer

- Centrado.
- Logo pequeño Gotham.
- Texto: "GOTHAM EXPERIENCE · Bariloche · +21".
- Línea inferior: "© 2026 Gotham Experience. Todos los derechos reservados."
- Color de texto: muted.

---

## 4. Slot custom — código de referencia

Estructura HTML básica para `tenants/gotham/custom-section.html`:

```html
<section id="experiencia" class="custom-section gotham-experience">
    <div class="container">
        <header class="section-header">
            <h2 class="section-title">LA EXPERIENCIA</h2>
            <p class="section-subtitle">Tres pilares que hacen de cada noche un evento.</p>
        </header>

        <div class="pillars-grid">
            <article class="pillar" data-pillar="sound">
                <div class="pillar-icon"><!-- SVG sonido --></div>
                <h3 class="pillar-title">SONIDO</h3>
                <p class="pillar-text">Sistema line array de última generación...</p>
            </article>

            <article class="pillar" data-pillar="lights">
                <div class="pillar-icon"><!-- SVG luces --></div>
                <h3 class="pillar-title">LUCES</h3>
                <p class="pillar-text">Cabezas móviles, lasers y mapping...</p>
            </article>

            <article class="pillar" data-pillar="screens">
                <div class="pillar-icon"><!-- SVG pantallas --></div>
                <h3 class="pillar-title">PANTALLAS</h3>
                <p class="pillar-text">Paredes LED de alta densidad...</p>
            </article>
        </div>
    </div>
</section>
```

Los SVGs y CSS específicos se generan al construir la web siguiendo las descripciones de la sección 3.4.

---

## 5. Eventos iniciales (carga inicial)

Snapshot de Passline a Mayo 2026 (los eventos VIE 08.05 y SÁB 09.05 ya pasaron y fueron retirados del listado público):

| ID | Fecha | Headliner | Soporte / detalle | Ciclos |
|---|---|---|---|---|
| evt-001 | SÁB 16.05 | Fernanda Pistelli | — | Gotham + Ciclic |
| evt-002 | DOM 31.05 | Fiesta de Hitazos | — | — |
| evt-003 | SÁB 06.06 | Gotham × MTN × TSOM | Press. Zisko | — |
| evt-004 | SÁB 13.06 | D-Nox | — | Gotham + Ciclic |

> Estos datos viven hoy en `tenants/gotham/content.json` (mock mode). Al conectar Firestore se pushean ahí y el cliente los gestiona desde el panel admin. Los flyers reales van en `tenants/gotham/branding/flyers/evt-NNN.jpg` y el código los toma automáticamente; si alguno falta cae al gradient placeholder.

---

## 6. Datos editables por el cliente desde el admin

| Campo | Editable | Notas |
|---|---|---|
| Eventos (CRUD) | Sí | Todos los campos |
| Flyer de evento | Sí | Upload a Firebase Storage |
| Mail de contacto | Sí | |
| Instagram URL | Sí | |
| Dirección | Sí | (idealmente no cambia, pero por flexibilidad) |
| Horarios | Sí | Si más adelante se agrega un campo |
| Textos de "La Experiencia" | **No (v1)** | Diseñado por operador. Si quieren cambios, lo piden. |
| Colores | **No** | Solo operador |
| Tipografías | **No** | Solo operador |
| Logo | Sí (con cuidado) | Upload, pero el operador lo aprueba |

---

## 7. Dominio

**Pendiente de definir.** Opciones a chequear:

1. `gothamexperience.com.ar` — primera opción. Matchea con su mail.
2. `gothambariloche.com.ar` — backup.
3. `gothamexperience.com` — más caro pero más corto y reconocible.
4. `gothamexp.com.ar` — backup más corto.

Comprar a nombre del cliente (Gotham Experience), no a nombre del operador. Esto les da seguridad y a nosotros nos protege legalmente.

---

## 8. Onboarding del cliente

### 8.1. Materiales que necesitamos del cliente

- [x] Logo (recibido).
- [ ] Flyers en alta calidad de los próximos eventos.
- [ ] Texto sobre el lugar (opcional, hay templates listos).
- [ ] Confirmación del email para login del admin.

### 8.2. Entregables al cliente

- URL de la web pública.
- URL del panel admin + credenciales.
- Tutorial breve (video corto o instructivo PDF de 1 página) sobre cómo agregar/editar un evento.
- Contacto del operador para soporte (WhatsApp + mail).

### 8.3. Tiempo estimado de implementación

- Setup técnico (tenant en Firestore, theme, custom section, deploy): 6-10 horas (es el primero, sirve para construir el template completo).
- QA y ajustes: 2-3 horas.
- Onboarding y capacitación cliente: 1 hora.

**Total estimado:** 1-2 días de trabajo concentrado.

---

## 9. Métricas de éxito (a 90 días post-lanzamiento)

- Cliente loguea al admin al menos 1 vez por semana.
- Eventos cargados al menos 3 días antes del evento.
- Web carga en < 2 segundos en mobile.
- 0 reportes de bugs críticos.
- Cliente renueva el plan al mes 3.

---

**Fin de CONFIG.md de Gotham.**
