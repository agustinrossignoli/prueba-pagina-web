// tenant-loader.js — Resuelve hostname → tenantId, carga assets del tenant.
//
// Hoy lee JSON local desde /tenants/{id}/. Cuando se conecte Firebase,
// loadTenant() consultará Firestore en su lugar — el resto del código
// (content-engine, events-engine) no necesita cambiar.

const TENANTS_MAP_URL = '/tenants-map.json';

export async function resolveTenantId() {
    // Override por query string (útil para QA: ?tenant=gotham)
    const urlOverride = new URLSearchParams(window.location.search).get('tenant');
    if (urlOverride) return urlOverride;

    const host = window.location.hostname.toLowerCase();

    try {
        const res = await fetch(TENANTS_MAP_URL);
        if (!res.ok) throw new Error('tenants-map.json HTTP ' + res.status);
        const map = await res.json();
        return map[host] || map.default || null;
    } catch (err) {
        console.error('[resolveTenantId]', err);
        return null;
    }
}

export async function loadTenant(tenantId) {
    applyTheme(tenantId);

    const [content, customSectionHtml] = await Promise.all([
        fetchJson(`/tenants/${tenantId}/content.json`),
        fetchText(`/tenants/${tenantId}/custom-section.html`).catch(() => '')
    ]);

    return Object.assign({ tenantId, customSectionHtml }, content);
}

function applyTheme(tenantId) {
    const themeLink = document.getElementById('theme-link');
    if (themeLink) themeLink.href = `/tenants/${tenantId}/theme.css`;
}

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Fetch fail: ' + url + ' (' + res.status + ')');
    return res.json();
}

async function fetchText(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Fetch fail: ' + url + ' (' + res.status + ')');
    return res.text();
}
