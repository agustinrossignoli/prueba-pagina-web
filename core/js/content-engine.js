// content-engine.js — Hidrata el shell HTML con datos del tenant.
// Inyecta texto, links, logo (imagen + SVG fallback) y monta el slot custom.

const LOGO_SVG_TEMPLATE = `
<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{NAME}">
    <circle cx="40" cy="40" r="38" fill="#0a0a0a" stroke="rgba(255,255,255,0.18)" stroke-width="0.8"/>
    <path d="M 14 32 A 30 30 0 0 1 36 12"
          stroke="rgba(255,255,255,0.45)" stroke-width="2.8" fill="none" stroke-linecap="round" opacity="0.7"/>
    <text x="40" y="40" text-anchor="middle" fill="#ffffff"
          font-family="Manrope, system-ui, sans-serif"
          font-weight="700" font-size="11" letter-spacing="0.5">{LINE1}</text>
    <text x="40" y="52" text-anchor="middle" fill="#ffffff"
          font-family="Manrope, system-ui, sans-serif"
          font-weight="300" font-size="4.5" letter-spacing="2.2">{LINE2}</text>
</svg>`;

export function applyContent(tenant) {
    const brand    = tenant.brand    || {};
    const location = tenant.location || {};
    const social   = tenant.social   || {};
    const footer   = tenant.footer   || {};

    document.title = [brand.line1, brand.line2, brand.location].filter(Boolean).join(' · ');
    setMeta('description', brand.description || '');
    setMeta('theme-color',  brand.themeColor  || '#0a0a0a');

    if (brand.googleFonts) {
        const fontLink = document.getElementById('font-link');
        if (fontLink) fontLink.href = brand.googleFonts;
    }

    setText('brand-line-1',     brand.line1);
    setText('brand-line-2',     brand.line2);
    setText('brand-location',   brand.location);
    setText('address',          location.address);
    setText('age-restriction',  location.ageRestriction);
    setText('instagram-handle', social.instagramHandle);
    setText('email-display',    social.email);
    setText('footer-line',      footer.line);
    setText('footer-copy',      footer.copyright);

    setLink('instagram', social.instagramUrl);
    setLink('tickets',   social.ticketsUrl || '#');
    setLink('map',       location.mapUrl);
    if (social.email) setLink('email', 'mailto:' + social.email);

    const iframe = document.getElementById('mapa-iframe');
    if (iframe && location.embedMapUrl) iframe.src = location.embedMapUrl;

    if (brand.customSectionLabel) {
        document.querySelectorAll('[data-nav-custom]').forEach(el => {
            el.textContent = brand.customSectionLabel;
        });
    }
}

export function mountCustomSection(html) {
    const slot = document.querySelector('[data-slot="custom"]');
    if (!slot) return;
    if (!html || !html.trim()) {
        slot.remove();
        return;
    }
    slot.innerHTML = html;
}

export function injectLogo(tenant) {
    const brand = tenant.brand || {};
    const line1 = (brand.logoLine1 || brand.line1 || '').toUpperCase();
    const line2 = (brand.logoLine2 || brand.line2 || '').toUpperCase();
    const name  = [brand.line1, brand.line2].filter(Boolean).join(' ');

    const svgFallback = LOGO_SVG_TEMPLATE
        .replace(/\{NAME\}/g,  escapeXml(name))
        .replace(/\{LINE1\}/g, escapeXml(line1))
        .replace(/\{LINE2\}/g, escapeXml(line2));

    const paintSvg = () => {
        document.querySelectorAll('[data-logo]').forEach(el => {
            el.innerHTML = svgFallback;
        });
    };

    if (brand.logoUrl) {
        const probe = new Image();
        probe.onload = () => {
            document.querySelectorAll('[data-logo]').forEach(el => {
                el.innerHTML = `<img src="${escapeAttr(brand.logoUrl)}" alt="${escapeAttr(name)}">`;
            });
        };
        probe.onerror = paintSvg;
        probe.src = brand.logoUrl;
    } else {
        paintSvg();
    }
}

// ===== helpers =====

function setText(key, value) {
    if (value == null) return;
    document.querySelectorAll(`[data-text="${key}"]`).forEach(el => {
        el.textContent = value;
    });
}

function setLink(key, value) {
    if (!value) return;
    document.querySelectorAll(`[data-link="${key}"]`).forEach(el => {
        el.setAttribute('href', value);
    });
}

function setMeta(name, content) {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function escapeXml(s) {
    return String(s).replace(/[<>&'"]/g, c => ({
        '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
    }[c]));
}
function escapeAttr(s) {
    return String(s).replace(/[<>&"']/g, c => ({
        '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
    }[c]));
}
