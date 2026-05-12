# PROMPT.md — Clubsites

Este archivo contiene los prompts que se pegan en Claude Code para construir o modificar el sistema. Hay 3 prompts principales:

1. **Prompt de arranque inicial:** construye el sistema desde cero (úsalo una sola vez).
2. **Prompt de alta de tenant:** agrega un cliente nuevo al sistema existente.
3. **Prompt de modificación de tenant:** cambia algo de un cliente existente.

---

## 1. Prompt de arranque inicial

> **Cuándo usarlo:** la primera vez, para construir todo el sistema con Gotham como primer cliente.
> **Dónde:** Claude Code en una nueva sesión. Asegurate de estar parado en la carpeta raíz del proyecto (`clubsites/`).

```
Sos un desarrollador senior frontend especializado en sistemas multi-tenant. Te pido que construyas la versión 1 del sistema Clubsites.

## Contexto

Clubsites es una plataforma SaaS multi-tenant que provee webs one-page con panel de administración a boliches y espacios de eventos. Cada cliente es un "tenant" identificado por dominio. La arquitectura es: un solo deploy de Cloudflare Pages, una sola base Firebase, múltiples tenants resueltos por hostname.

## Documentos de referencia (LEELOS PRIMERO, EN ESTE ORDEN)

1. `SPEC.md` en la raíz del proyecto: manual completo del sistema. Define stack, arquitectura, modelo de datos, estructura de carpetas, secciones del template, panel admin, convenciones, security rules.
2. `tenants/gotham/CONFIG.md`: especificación del primer cliente (Gotham Experience, Bariloche). Define identidad visual, contenido, slot custom específico, eventos iniciales.

Leé ambos archivos en su totalidad antes de escribir una sola línea de código. Si después de leerlos hay decisiones técnicas que necesitan aclaración (ej: librería específica a usar, manejo de un edge case), preguntá ANTES de avanzar.

## Tu tarea

Construir el sistema completo siguiendo SPEC.md y configurándolo para Gotham según CONFIG.md. El resultado debe ser un proyecto funcional, deployable a Cloudflare Pages, con Firestore configurado, panel admin operativo y la web pública de Gotham lista para mostrar al cliente.

## Stack obligatorio (no improvisar otro)

- HTML/CSS/JS vanilla en el frontend. NO usar frameworks (no React, no Vue, no Svelte).
- Firebase v10+ con módulos ES6 importados desde CDN (gstatic).
- Firestore para datos.
- Firebase Auth para login del admin.
- Firebase Storage para imágenes (Cloudflare cacheará por delante).
- Cloudflare Pages como hosting.

## Plan de trabajo sugerido (proponé el tuyo si pensás algo mejor)

1. Crear estructura de carpetas según SPEC.md sección 4.
2. Configurar Firebase: `firebase.json`, `firestore.rules`, `storage.rules`.
3. Construir `core/` (template compartido):
   - HTML base de la web pública con las 7 secciones.
   - CSS con tokens, components, sections.
   - JS: tenant-loader, firebase-config, events-engine, content-engine.
4. Construir el panel admin completo (login, dashboard, eventos, historial, contenido).
5. Configurar el tenant Gotham: theme.css, content.json, custom-section.html.
6. Cargar datos iniciales de Gotham en Firestore (eventos del CONFIG.md sección 5).
7. Documentar README.md con pasos de deploy.

## Restricciones críticas

- **Mobile-first.** Cada componente debe verse y funcionar perfecto en mobile antes que en desktop.
- **Performance.** Sin librerías pesadas innecesarias. Lazy loading de imágenes. Fuentes con font-display swap.
- **Accesibilidad básica.** Roles ARIA donde corresponda, navegación por teclado, contrastes mínimos.
- **Multi-tenant desde el día uno.** Aunque solo haya un cliente (Gotham), la arquitectura tiene que soportar agregar tenants nuevos sin reescribir nada.
- **Security rules estrictas.** Un admin de Gotham no debe poder modificar datos de otro tenant. Lectura pública solo de eventos no archivados.
- **Variables CSS para todo.** Ningún color hardcodeado en componentes. Todo a través de tokens en `theme.css`.

## Entregables esperados

Al terminar, debe quedar:
- Estructura de carpetas completa según SPEC.md.
- Código del template funcionando localmente con un mock de Firebase si es necesario para demo.
- `firebase.json`, `firestore.rules`, `storage.rules` listos para deployar.
- Tenant Gotham configurado con sus 6 eventos iniciales (mockeables si Firebase no está conectado todavía).
- Panel admin funcional con login, lista de eventos, alta/edición/baja.
- README.md con instrucciones para que Agustín pueda:
  - Crear el proyecto Firebase.
  - Deployar a Cloudflare Pages.
  - Configurar el dominio de Gotham.
  - Crear el primer usuario admin.

## Instrucciones de comunicación

- Si no estás seguro de una decisión, preguntá. No improvises.
- Después de cada hito mayor (estructura creada, template HTML listo, admin terminado), hacé un breve recap de lo que hiciste y qué sigue.
- Si encontrás contradicciones entre SPEC.md y CONFIG.md, frená y preguntá antes de avanzar.
- Si SPEC.md o CONFIG.md no cubren un caso (ej: qué pasa si el admin pierde la password), proponé una solución y validá antes de implementar.

Empezá leyendo SPEC.md y CONFIG.md ahora. Cuando termines de leer ambos, hacé un resumen breve de tu entendimiento y proponé el plan de trabajo concreto antes de escribir código.
```

---

## 2. Prompt de alta de tenant nuevo

> **Cuándo usarlo:** ya existe el sistema, querés agregar un cliente nuevo (ej: "Pacha Bariloche", "Crobar", etc.).
> **Pre-requisito:** crear `tenants/{nuevo-tenant}/CONFIG.md` con la especificación del cliente, basándose en el template `tenants/_template/CONFIG.md`.

```
El sistema Clubsites ya está construido y operativo. Tengo que agregar un cliente nuevo.

## Documentos de referencia (LEELOS PRIMERO)

1. `SPEC.md`: manual del sistema (sin cambios respecto a la versión actual).
2. `tenants/{NUEVO_TENANT_ID}/CONFIG.md`: especificación del nuevo cliente.
3. `tenants/gotham/`: ejemplo de tenant existente, úsalo como referencia para estructura.

## Tu tarea

Agregar el tenant `{NUEVO_TENANT_ID}` al sistema sin modificar el código de `core/` ni los datos de tenants existentes.

Pasos esperados:

1. Leer el CONFIG.md del nuevo tenant.
2. Crear `tenants/{NUEVO_TENANT_ID}/theme.css` con las variables CSS según la identidad visual del CONFIG.
3. Crear `tenants/{NUEVO_TENANT_ID}/content.json` con los textos iniciales del CONFIG.
4. Crear `tenants/{NUEVO_TENANT_ID}/custom-section.html` con el slot custom del CONFIG.
5. Generar el script o instrucciones para:
   - Crear el documento del tenant en Firestore (`/tenants/{tenantId}/info`).
   - Cargar los eventos iniciales (si los hay).
   - Crear el usuario admin en Firebase Auth con custom claim `tenantId`.
   - Mapear el dominio en `/global/domains-map/`.
6. Documentar los pasos manuales que tengo que hacer en Cloudflare Pages para configurar el custom domain.

## Restricciones

- NO modificar archivos en `core/`.
- NO modificar archivos de otros tenants existentes.
- Si el CONFIG.md tiene algo que no se puede implementar con la versión actual del sistema, FRENAR y avisarme. No improvises features que no existan.

Reemplazá `{NUEVO_TENANT_ID}` por el id real del tenant cuando uses este prompt.
```

---

## 3. Prompt de modificación de tenant existente

> **Cuándo usarlo:** un cliente existente pide un cambio (ej: actualizar el slot custom, cambiar paleta, agregar sección, etc.).

```
El sistema Clubsites está operativo. Necesito hacer un cambio en un tenant existente.

## Tenant a modificar

`tenants/{TENANT_ID}/`

## Cambio solicitado

{DESCRIPCIÓN DEL CAMBIO. Ej: "El cliente quiere agregar una sección de DJs residentes después del slot custom actual. Tienen 4 DJs residentes con foto, nombre y un texto corto."}

## Documentos de referencia

1. `SPEC.md`: manual del sistema.
2. `tenants/{TENANT_ID}/CONFIG.md`: especificación actual del tenant.
3. Archivos en `tenants/{TENANT_ID}/`.

## Tu tarea

1. Leer SPEC.md y el CONFIG.md actual del tenant.
2. Determinar si el cambio es:
   a. Solo afecta a este tenant (modificar archivos en `tenants/{TENANT_ID}/`).
   b. Es una feature genérica que beneficiaría a todos los tenants (modificar `core/` y SPEC.md).
3. Si es (b), proponer el diseño antes de implementar.
4. Si es (a), implementar y actualizar el CONFIG.md del tenant para reflejar el cambio.

## Restricciones

- Si el cambio implica modificar `core/`, validar conmigo primero (afecta a otros clientes).
- Mantener compatibilidad: el cambio no debe romper la web pública mientras está implementándose.
- Documentar en el CONFIG.md la fecha y descripción del cambio.

Reemplazá los placeholders y empezá leyendo los documentos.
```

---

## Notas operativas

### Antes de usar cualquier prompt

- Tenés que tener Claude Code instalado y autenticado (vos ya lo hiciste).
- Estar parado en la carpeta raíz del proyecto (`clubsites/`).
- Que los archivos `SPEC.md` y `tenants/{tenantId}/CONFIG.md` existan y estén actualizados.

### Si Claude Code se confunde o pierde el hilo

- Reiniciá la sesión.
- Pegá el prompt nuevamente.
- Recordale que leyó SPEC.md y CONFIG.md antes de avanzar.

### Si tenés que dividir el trabajo

Si el prompt de arranque inicial es muy grande para una sola sesión, podés dividirlo así:

1. **Sesión 1:** "Leé SPEC.md y CONFIG.md. Construí solo la estructura de carpetas y los archivos de configuración Firebase."
2. **Sesión 2:** "Construí el `core/` (HTML/CSS/JS del template público) según SPEC.md."
3. **Sesión 3:** "Construí el panel admin completo según SPEC.md."
4. **Sesión 4:** "Configurá el tenant Gotham según CONFIG.md y cargá los eventos iniciales."

### Después de construir todo

- Hacer QA en local (mock de Firebase está bien).
- Crear proyecto Firebase real.
- Deployar a Cloudflare Pages.
- Configurar dominio de Gotham.
- Cargar datos reales en Firestore.
- Crear usuario admin para el cliente.
- Entregar credenciales.

### Checklist pre-producción (obligatorio antes del primer cobro real)

Esto NO lo hace Claude Code, lo tenés que hacer vos. Ver SPEC.md sección 10 para detalles.

**Técnico:**
- [ ] 2FA activado en cuenta Google/Firebase.
- [ ] Budget Alerts en Google Cloud (USD 20 alert / USD 50 kill switch).
- [ ] Backups diarios de Firestore activados.
- [ ] Security rules testeadas (un tenant no puede acceder a otro).
- [ ] Credenciales Firebase fuera del repo (no commitear keys).

**Legal/fiscal:**
- [ ] Inscripción en AFIP confirmada (mínimo Monotributo).
- [ ] Mercado Pago configurado para emitir factura automática.
- [ ] T&C enviadas al cliente por email antes del primer cobro.
- [ ] SLA comunicado explícitamente al cliente.
- [ ] Dominio comprado a nombre del cliente (no del operador).

**Operativo:**
- [ ] Video Loom de capacitación grabado.
- [ ] Canal de soporte definido y comunicado (WhatsApp Business, email).
- [ ] Horarios de atención comunicados.
- [ ] Backup de datos del cliente exportable en caso de baja.

---

**Fin de PROMPT.md.**
