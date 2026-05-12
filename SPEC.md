# SPEC.md — Clubsites Platform

**Versión:** 1.0
**Última actualización:** Mayo 2026
**Autor:** Agustín

Este documento describe la arquitectura, estructura y funcionamiento del sistema Clubsites: una plataforma multi-tenant para hostear webs de boliches, espacios de eventos y similares en Argentina. Es el manual de referencia del proyecto. Cualquier cliente nuevo se construye siguiendo este SPEC.

---

## 1. Visión y propósito

Clubsites es un servicio que provee a boliches y espacios de eventos una web profesional one-page con panel de administración propio, por una suscripción mensual.

**Propuesta de valor para el cliente final:**
- Web propia con dominio personalizado.
- Panel admin para autoeditar eventos, fotos y contenido sin necesidad de saber código.
- Hosting profesional con CDN global.
- Diseño custom, no plantilla.
- Sin sorpresas técnicas: no se rompe, no se hackea, carga rápido.

**Propuesta de valor para el operador (Agustín):**
- Una sola base de código mantenida que sirve a múltiples clientes.
- Onboarding de un cliente nuevo en 1-2 horas una vez maduro el sistema.
- Margen alto a escala (90%+ a partir de 10-20 clientes).
- Mejoras del template benefician a todos los clientes simultáneamente.

**Modelo de negocio:** USD 30/mes por cliente. Sin setup fee para los primeros 10 clientes; setup fee de USD 200-300 después. Plan anual con 2 meses de descuento (USD 300/año).

---

## 2. Stack técnico

| Capa | Tecnología | Razón |
|---|---|---|
| Frontend | HTML/CSS/JS vanilla | Sin build complejo, fácil de mantener, performance máxima |
| Hosting | Cloudflare Pages | Gratis, CDN global, custom domains incluidos |
| Base de datos | Firestore (Firebase) | Multi-tenant nativo via security rules, free tier generoso |
| Storage de imágenes | Firebase Storage | Integración natural con Firestore. Cacheado vía Cloudflare |
| Autenticación admin | Firebase Auth | Email + password, custom claims para tenant scoping |
| Dominios | NIC.ar (.com.ar) o registrar internacional (.com) | Comprados a nombre del cliente |
| Cobranza | Mercado Pago suscripciones / transferencia | Argentina-first |

**Plan Firebase requerido:** Blaze (pay-as-you-go) por requerimiento de Cloud Storage desde febrero 2026. La operación se mantiene dentro del free tier hasta varios cientos de clientes, costo estimado a 100 clientes: USD 5-15/mes total.

---

## 3. Arquitectura multi-tenant

### 3.1. Principio fundamental

**Un solo proyecto Firebase, un solo deploy de Cloudflare Pages, múltiples tenants identificados por dominio.**

Cada cliente es un "tenant" con un identificador único (`tenantId`). Los datos están aislados en Firestore vía security rules, el código es compartido, y cada tenant tiene su propio dominio que apunta al mismo deploy.

### 3.2. Cómo funciona el routing por dominio

1. El usuario visita `gothamexperience.com.ar`.
2. Cloudflare Pages sirve el deploy compartido.
3. Al cargar, el JavaScript del frontend lee `window.location.hostname`.
4. Mapea el hostname al `tenantId` correspondiente vía un archivo `tenants-map.json` o un documento de Firestore.
5. Carga la configuración del tenant (colores, contenido, eventos) desde Firestore en `/tenants/{tenantId}/`.
6. Renderiza la web personalizada.

### 3.3. Modelo de datos en Firestore

```
/tenants/{tenantId}/
    info: {
        name: string,
        domain: string,
        address: string,
        email: string,
        instagram: string,
        passlineUrl: string,
        themeColors: { primary, secondary, accent, background, text },
        themeFonts: { display, body },
        slotCustomEnabled: boolean,
        active: boolean,
        plan: "monthly" | "annual",
        createdAt: timestamp
    }

    /events/{eventId}: {
        name: string,
        date: timestamp,
        headliner: string,
        supportingActs: string[],
        cycles: string[],          // tags de ciclos: ["Undermove", "Ciclic"]
        flyerUrl: string,
        passlineUrl: string,
        soldOut: boolean,
        archived: boolean,         // auto-true cuando date < now
        createdAt: timestamp
    }

    /admins/{userId}: {
        email: string,
        role: "owner" | "editor",
        createdAt: timestamp
    }

    /content/{sectionId}: {
        // contenido editable de secciones del template
        // ej: "about", "experience", "hours"
        title: string,
        body: string,
        updatedAt: timestamp
    }

/global/
    /domains-map/{domain}: { tenantId: string }
    /billing/{tenantId}: { lastPayment, status, plan }
```

### 3.4. Security rules (resumen conceptual)

- **Lectura pública:** cualquiera puede leer `/tenants/{tenantId}/info` y `/tenants/{tenantId}/events` donde `archived == false`.
- **Escritura del admin:** un usuario autenticado solo puede escribir en `/tenants/{tenantId}/...` si su `customClaims.tenantId == tenantId`.
- **Solo el operador (Agustín):** puede escribir en `/global/...` y modificar `themeColors` y `themeFonts` (estilo). Los admins de cada tenant editan contenido, no estilo.

Las reglas concretas en código viven en `firestore.rules` y se deployan con Firebase CLI.

### 3.5. Storage de imágenes

Estructura en Firebase Storage:
```
/tenants/{tenantId}/
    /events/{eventId}/flyer.{ext}
    /content/{sectionId}/{imageId}.{ext}
    /branding/logo.{ext}
```

Las imágenes se sirven vía Cloudflare con cache agresivo para minimizar bandwidth de Firebase.

---

## 4. Estructura del repositorio

```
clubsites/
│
├── SPEC.md                           # Este documento (manual del sistema)
├── PROMPT.md                         # Prompt de arranque para Claude Code
├── README.md                         # Documentación operativa breve
│
├── core/                             # Código compartido entre todos los tenants
│   ├── public/
│   │   ├── index.html                # Template base de la web pública
│   │   ├── admin/
│   │   │   ├── index.html            # Panel admin
│   │   │   ├── login.html
│   │   │   └── ...
│   │   └── assets/
│   │       └── (assets compartidos)
│   │
│   ├── styles/
│   │   ├── base.css                  # Reset, tipografías base, layout
│   │   ├── components.css            # Componentes (cards, buttons, modals)
│   │   ├── sections.css              # Estilos por sección
│   │   └── tokens.css                # Variables CSS por defecto
│   │
│   ├── js/
│   │   ├── app.js                    # Bootstrap principal
│   │   ├── tenant-loader.js          # Resuelve hostname → tenantId
│   │   ├── firebase-config.js
│   │   ├── events-engine.js          # CRUD de eventos, render
│   │   ├── content-engine.js         # Render de secciones editables
│   │   └── admin/
│   │       ├── admin-app.js
│   │       ├── auth.js
│   │       └── events-crud.js
│   │
│   └── firebase/
│       ├── firestore.rules
│       ├── storage.rules
│       └── firebase.json
│
└── tenants/                          # Configuración específica por cliente
    ├── _template/                    # Plantilla para clonar al crear un tenant nuevo
    │   ├── CONFIG.md
    │   ├── theme.css
    │   ├── content.json
    │   └── custom-section.html
    │
    └── {tenantId}/
        ├── CONFIG.md                 # Especificación del cliente
        ├── theme.css                 # Override de variables CSS (colores, fuentes)
        ├── content.json              # Textos iniciales (se cargan en Firestore al onboarding)
        └── custom-section.html       # HTML del slot custom específico
```

---

## 5. Estructura de la web pública (template base)

Toda web Clubsites tiene la misma estructura macro. Solo varían contenido, estilo y la sección custom.

### 5.1. Secciones (en orden)

1. **Header (fixed)**
   - Logo del cliente (izquierda).
   - Navegación: Eventos / Experiencia / Cómo llegar / Instagram (derecha).
   - Mobile: hamburguesa.

2. **Hero**
   - Pantalla completa o casi completa.
   - Fondo: gradient o imagen/video del cliente.
   - Título principal (nombre del lugar).
   - Subtítulo (ubicación o tagline).
   - CTA principal: "Ver próximos eventos" (scroll a sección).
   - CTA secundario: "Comprar entradas" → link Passline o externo.

3. **Próximos eventos**
   - Título de sección.
   - Grid de cards (4-6 eventos máximo). Mobile: lista vertical.
   - Cada card muestra:
     - Flyer.
     - Fecha en formato "DÍA DD.MM" (ej: "SÁB 16.05").
     - Headliner.
     - Tags de ciclos (opcional, ej: "GOTHAM + CICLIC").
     - Badge "SOLD OUT" si aplica.
     - Botón "Comprar entradas" → link Passline.
   - Si no hay eventos: mensaje "Próximamente nuevos eventos. Seguinos en Instagram para enterarte primero."
   - Auto-hide de eventos pasados.

4. **Slot custom**
   - Sección de identidad única del cliente.
   - El operador (Agustín) la diseña al onboarding.
   - Define un `<section id="custom">` con HTML/CSS específico del cliente.
   - Va entre eventos y ubicación.

5. **Cómo llegar**
   - Mapa Google Maps embebido.
   - Dirección.
   - Link "Abrir en Google Maps".
   - Horarios (opcional).
   - Edad mínima (configurable, default +21).

6. **Redes y contacto**
   - Logo grande de Instagram (link).
   - Mail de contacto.
   - Otros links si aplica (Spotify, TikTok).
   - **No incluye Linktree por defecto.**

7. **Footer**
   - Nombre del lugar.
   - Año + © + nombre.
   - Eventual disclaimer legal (+18, +21, etc.).

### 5.2. Comportamiento

- **Mobile-first.** Diseño primero pensado para celular, luego desktop.
- **Performance.** Lazy loading de imágenes, fuentes con `font-display: swap`, JS no bloqueante.
- **SEO básico.** Meta tags, Open Graph, structured data (Event schema).
- **Accesibilidad básica.** Contrastes mínimos, roles ARIA, navegación por teclado.

---

## 6. Panel de administración

URL: `{dominio-cliente}/admin/`

### 6.1. Pantallas

1. **Login**
   - Email + password (Firebase Auth).
   - Reset de password vía email.

2. **Dashboard**
   - Resumen: cantidad de eventos próximos, último evento creado, accesos rápidos.

3. **Eventos**
   - Lista de **próximos** eventos (los que se ven en la web pública).
   - Botón "Agregar evento".
   - Cada evento es editable: nombre, fecha, hora, headliner, soporte, ciclos (tags), flyer (upload), link Passline, sold out (toggle).
   - Botón "Archivar" (oculta de la web pública).
   - Botón "Eliminar" (con confirmación).

4. **Historial**
   - Lista de eventos pasados (auto-archivados cuando la fecha pasó).
   - Solo lectura por defecto. Posibilidad de "restaurar" cambiándole la fecha.

5. **Contenido**
   - Editor simple de textos de secciones (ej: descripción de "Sobre nosotros" si aplica).
   - Edición de datos de contacto (mail, instagram).
   - Edición de horarios.

6. **Configuración (limitada)**
   - Cambio de password.
   - Solo para el operador: variables de tema (colores, fuentes), dominio, plan.

### 6.2. Permisos

- **Cliente (rol "owner" o "editor"):** puede CRUD de eventos, edición de contenido, edición de datos básicos.
- **Operador (Agustín, rol global):** puede todo lo anterior + cambio de tema visual + creación/eliminación de tenants.

### 6.3. UX del admin

- Diseño limpio, funcional, no decorativo.
- Mobile-friendly (clientes editan desde el celular).
- Feedback inmediato al guardar (toast notifications).
- Sin tutoriales largos: la interfaz tiene que ser autoexplicativa.

---

## 7. Personalización por cliente

### 7.1. Lo que cada cliente puede tener distinto

| Elemento | Variable | Quién lo controla |
|---|---|---|
| Logo | imagen subida | Operador al onboarding, cliente puede actualizar |
| Colores | CSS vars en `theme.css` | Operador (no editable por cliente) |
| Tipografías | CSS vars en `theme.css` | Operador (no editable por cliente) |
| Textos | content.json + Firestore | Cliente desde admin |
| Eventos | Firestore | Cliente desde admin |
| Slot custom | HTML/CSS único en `custom-section.html` | Operador al onboarding |
| Dirección, redes, mail | Firestore `/tenants/{id}/info` | Cliente desde admin |
| Dominio | Cloudflare Pages custom domain | Operador |

### 7.2. Decisión clave: estilo gestionado por operador

Los colores y tipografías **NO son editables por el cliente**. El operador los define al onboarding según la marca del cliente. Esto:
- Garantiza coherencia visual.
- Evita que el cliente arruine el diseño con malas decisiones.
- Reduce la complejidad del panel admin.
- Si el cliente quiere cambios visuales, los pide y se cobran o se incluyen en el mantenimiento mensual según alcance.

### 7.3. Slot custom

Es una sección de la web única para cada cliente, diseñada por el operador. Sirve para que cada web tenga personalidad propia más allá del color. Ejemplos posibles:

- "Concept" / "About" con storytelling visual.
- Showcase de DJs residentes.
- Galería tipo wall de fiestas pasadas.
- Sistema técnico del lugar (sonido/luces/pantallas).
- Carta de tragos signature.
- Timeline de la noche.

Es lo que justifica el setup fee y diferencia un Clubsite de un Wix.

---

## 8. Workflow operativo

### 8.1. Alta de un cliente nuevo

1. **Discovery (15-30 min):** definir identidad visual, slot custom, datos básicos.
2. **Crear `tenants/{tenantId}/CONFIG.md`** con la especificación.
3. **Generar archivos del tenant:**
   - `theme.css` con variables CSS del cliente.
   - `content.json` con textos iniciales.
   - `custom-section.html` con el slot custom.
4. **Crear el tenant en Firestore** (`/tenants/{tenantId}/info`, doc inicial).
5. **Crear usuario admin** en Firebase Auth con custom claim `tenantId`.
6. **Configurar dominio en Cloudflare Pages** (custom domain).
7. **Mapear dominio → tenantId** en `/global/domains-map/`.
8. **QA:** revisar la web en el dominio.
9. **Entrega:** mandar credenciales al cliente, tutorial breve del admin.
10. **Activar cobranza** (suscripción Mercado Pago o factura).

**Tiempo estimado primera vez (Gotham): 1-2 días.**
**Tiempo estimado a partir del cliente 5: 2-4 horas.**
**Tiempo estimado con onboarding semi-automatizado (cliente 15+): 30-60 min.**

### 8.2. Modificación de un cliente existente

- Cambios de contenido: el cliente lo hace desde el admin.
- Cambios de estilo: el operador edita `theme.css` del tenant y redeploya.
- Cambios estructurales del template: se modifican en `core/`, benefician a todos los tenants.
- Cambios de slot custom: el operador edita `custom-section.html` del tenant.

### 8.3. Baja de un cliente

1. Marcar `info.active = false` en Firestore (la web muestra "Sitio en pausa").
2. Avisar al cliente con 30 días de anticipación.
3. Pasados los 30 días sin pago: archivar tenant (datos preservados en backup), eliminar custom domain de Cloudflare.
4. El dominio sigue siendo del cliente (registrado a su nombre); puede llevárselo donde quiera.

---

## 9. Convenciones y reglas

### 9.1. Naming de tenants

- `tenantId` es lowercase, sin espacios, sin caracteres especiales.
- Ej: `gotham`, `pacha`, `crobar-bariloche`.
- Una vez creado, **no se cambia** (el tenantId está en URLs, claims, security rules).

### 9.2. CSS variables (tokens)

Todas las variables visuales viven en `core/styles/tokens.css` con valores por defecto. Cada tenant las sobreescribe en su `theme.css`.

Tokens mínimos que todo tenant debe definir:
```css
:root {
    --color-bg: #...;
    --color-bg-elevated: #...;
    --color-text: #...;
    --color-text-muted: #...;
    --color-primary: #...;
    --color-primary-hover: #...;
    --color-accent: #...;
    --color-border: #...;

    --font-display: '...', sans-serif;
    --font-body: '...', sans-serif;

    --radius-sm: ...px;
    --radius-md: ...px;
    --radius-lg: ...px;

    --shadow-sm: ...;
    --shadow-md: ...;
    --shadow-glow: ...;  /* glow específico del cliente */
}
```

### 9.3. Naming de archivos y componentes

- HTML: kebab-case (`event-card.html`).
- CSS: kebab-case en clases, BEM modificado (`event-card`, `event-card--sold-out`, `event-card__title`).
- JS: camelCase en variables y funciones, PascalCase en clases.

### 9.4. Reglas de mantenimiento

- **No se rompe la API de tenants existentes** sin migración explícita.
- **Cambios en `core/` deben funcionar para TODOS los tenants vivos.** Si un cambio rompe a alguno, se hace fork del componente.
- **Antes de deployar a producción:** test manual en el dominio de Gotham y al menos un tenant más.

---

## 10. Operación legal y administrativa

Esta sección define los aspectos no técnicos del negocio Clubsites: seguridad, fiscal, contratos y SLA. Vivir sin estos definidos funciona para 1-3 clientes amigos, no escala más allá.

### 10.1. Inscripción fiscal (AR)

- **Requisito mínimo:** estar inscripto en AFIP, mínimo en Monotributo.
- A USD 30/mes × hasta ~10 clientes, Monotributo categoría A-B alcanza.
- A USD 30/mes × 100 clientes (~USD 3.000/mes), Responsable Inscripto con IVA.
- **Antes del primer cobro:** confirmar categoría y, si es necesario, dar de alta la actividad ("Servicios de diseño y desarrollo web", código de actividad correspondiente).
- Emitir Factura C (Monotributo) o Factura A/B (Responsable Inscripto) por cada cobro.

### 10.2. Cobranza

- **Vehículo principal:** Mercado Pago Suscripciones (cobro recurrente con tarjeta).
- **Vehículo backup:** transferencia bancaria + factura manual (para los primeros 3-5 clientes o clientes que prefieran no usar tarjeta).
- Comisión MP estimada: 5-6% sobre el cobro (verificar tarifa vigente en mercadopago.com.ar).
- **Cotización:** todos los planes se cotizan en USD. Cobro en pesos al tipo de cambio MEP del día del cobro.

### 10.3. Términos y condiciones (T&C) entre operador y cliente

Cada cliente nuevo recibe (mínimo) un email con las condiciones del servicio antes del primer cobro. A partir del cliente 5, se firma un documento simple (puede ser email con conformidad explícita).

T&C mínimos a cubrir:

1. **Servicio incluido:** hosting + dominio + admin + 1 hora/mes de modificaciones menores + soporte por canal definido.
2. **No incluido:** rediseños mayores, nuevas funcionalidades, copy, fotografía, SEO continuo (se cotizan aparte).
3. **Propiedad:**
   - Código y template: **del operador**. El cliente paga por el servicio, no por el código.
   - Datos del cliente (eventos, fotos, textos): **del cliente**. Se exportan si se va.
   - Dominio: **del cliente**. Comprado a su nombre desde el día uno.
4. **Política de baja:** el cliente puede dar de baja con 30 días de aviso. Al final del período, exportación de datos en JSON y entrega del dominio.
5. **Política de impago:** después de 30 días sin pago, el sitio se marca como `active=false` y muestra mensaje "Sitio en pausa". A los 60 días, archivado definitivo.
6. **Confidencialidad:** el operador no comparte datos del cliente con terceros excepto por requerimiento legal.

### 10.4. SLA (Service Level Agreement)

Compromiso del operador con cada cliente. Comunicado en el email de onboarding.

| Item | Compromiso |
|---|---|
| Uptime garantizado | 99% mensual (≈7 horas de caída tolerada al mes) |
| Tiempo de respuesta a soporte | < 24hs hábiles |
| Horarios de atención | Lun a Vie, 9-19hs ART (verificar zona horaria del operador) |
| Soporte de emergencia (sitio caído) | Best-effort en menos de 4hs incluso fuera de horario |
| Modificaciones menores incluidas | 1 hora/mes (cambios de textos, fotos, datos de contacto) |
| Compensación si SLA no se cumple | Si la web está caída por más de 24hs continuas por causa del operador, se bonifica el mes |

### 10.5. T&C para el visitante del sitio público

Cada web Clubsites debe incluir en el footer:

- Link a "Términos de uso" y "Política de privacidad" (templates genéricos, editables por el cliente).
- Aviso de edad mínima si aplica (+18 / +21 según el lugar).
- Aviso de uso responsable del consumo si el lugar vende alcohol (recomendado, no obligatorio).

### 10.6. Protección de datos personales

- En v1, **no se capturan datos personales de visitantes** (no hay formulario de contacto que guarde email, no hay newsletter). Por lo tanto, la Ley 25.326 no aplica directamente.
- Cuando v1.1 incorpore newsletter o formularios, el operador debe:
   - Inscribir la base de datos en la Agencia de Acceso a la Información Pública (AAIP).
   - Agregar consentimiento explícito y política de privacidad detallada.

### 10.7. Seguridad operativa

Checklist obligatorio antes del primer cliente en producción:

- [ ] 2FA activado en cuenta Google/Firebase del operador.
- [ ] Budget Alerts configuradas en Google Cloud (alerta al 50% y 90% de USD 20/mes).
- [ ] Kill switch automático configurado (Cloud Function que deshabilita servicios al pasar USD 50/mes).
- [ ] Backups diarios de Firestore activados con retención de 30 días.
- [ ] Security rules de Firestore testeadas (un tenant no puede leer/escribir datos de otro).
- [ ] Variables de entorno con credenciales Firebase fuera de control de versiones (no commitear `firebase-config.js` con keys reales).

### 10.8. Soporte y operación

- **Canal principal:** WhatsApp Business (un solo número para todos los clientes).
- **Canal secundario:** email (`soporte@clubsites.ar` cuando exista el dominio propio).
- **Capacitación inicial del cliente:** video de Loom de 5-7 minutos mostrando el panel admin. Se manda en el email de onboarding.
- **Documentación operativa interna:** este SPEC.md más una carpeta `ops/` con checklists, plantillas de email y scripts utilitarios.

### 10.9. Crecimiento del negocio

- **A partir de cliente 5:** redactar T&C formales (template legal revisado por abogado).
- **A partir de cliente 10:** evaluar contratar colaborador para soporte/onboarding.
- **A partir de cliente 20:** sistema de tickets formal (Linear, Notion, o similar) en lugar de WhatsApp directo.
- **A partir de USD 5K/mes facturados:** evaluar pasar de Monotributo a Responsable Inscripto, o estructura societaria (SAS).

---

## 11. Roadmap de features (futuro)

Cosas que NO están en v1 pero sí en planes:

- **v1.1:** Newsletter con captación de email (Resend o Mailchimp).
- **v1.2:** Galería de fotos de eventos pasados (opcional por tenant).
- **v1.3:** Multi-idioma (español/inglés/portugués) para clientes con turistas.
- **v1.4:** Onboarding self-service (página pública de signup + checkout).
- **v1.5:** Analytics en el admin (visitas, eventos más vistos).
- **v2.0:** App nativa o PWA para que el cliente edite desde celular como app.

---

## 12. Referencias y links

- Firebase pricing: https://firebase.google.com/pricing
- Cloudflare Pages: https://pages.cloudflare.com
- Passline (ticketera de los clientes): https://passline.com
- NIC.ar (dominios .com.ar): https://nic.ar
- AFIP Monotributo: https://www.afip.gob.ar/monotributo/
- Mercado Pago para desarrolladores: https://www.mercadopago.com.ar/developers

---

## 13. Glosario

- **Tenant:** un cliente del sistema (un boliche). Tiene su tenantId, dominio, datos y usuario admin.
- **Operador:** Agustín. El que opera el sistema, agrega clientes, edita estilo.
- **Slot custom:** la sección única de cada cliente, diseñada por el operador.
- **Theme:** conjunto de variables CSS (colores, fuentes) de un tenant.
- **Headliner:** DJ o artista principal de un evento.
- **Ciclo:** sublabel o serie de eventos recurrente (ej: "Undermove", "Ciclic" en el caso de Gotham).
- **SLA:** Service Level Agreement. Acuerdo formal del nivel de servicio que el operador se compromete a brindar al cliente.
- **MEP:** Mercado Electrónico de Pagos. Tipo de cambio implícito que se usa para cotizar el dólar legal en Argentina.

---

**Fin de SPEC.md.**
