// app.js — Entry point.
// 1) Resuelve tenantId desde hostname / query.
// 2) Carga theme + content + custom-section del tenant.
// 3) Hidrata el shell HTML.
// 4) Monta interacciones (scroll del header, mobile menu, IntersectionObservers).

import { resolveTenantId, loadTenant } from './tenant-loader.js';
import { renderEvents } from './events-engine.js';
import { applyContent, mountCustomSection, injectLogo } from './content-engine.js';

async function boot() {
    try {
        const tenantId = await resolveTenantId();
        if (!tenantId) {
            showFatal('Sitio no configurado para este dominio.');
            return;
        }

        const tenant = await loadTenant(tenantId);

        applyContent(tenant);
        renderEvents(tenant.events || [], { instagramUrl: tenant.social?.instagramUrl });
        mountCustomSection(tenant.customSectionHtml);
        injectLogo(tenant);

        document.body.classList.remove('is-loading');
        document.body.classList.add('tenant-ready');

        setupHeaderScroll();
        setupMobileMenu();
        setupObservers();
    } catch (err) {
        console.error('[boot] error:', err);
        showFatal('No se pudo cargar el sitio. Probá de nuevo en unos minutos.');
    }
}

function showFatal(message) {
    document.body.innerHTML =
        '<div style="position:fixed;inset:0;display:flex;align-items:center;' +
        'justify-content:center;color:#fff;font-family:system-ui,sans-serif;' +
        'padding:24px;text-align:center;background:#0a0a0a;">' +
        message + '</div>';
}

function setupHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;
    const onScroll = () => {
        if (window.scrollY > 24) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

function setupMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const menu   = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        document.body.style.overflow = open ? 'hidden' : '';
    });

    menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            menu.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Abrir menú');
            document.body.style.overflow = '';
        });
    });
}

function setupObservers() {
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.event-card, .pillar').forEach(el => {
            el.classList.add('is-visible');
        });
        return;
    }

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.event-card').forEach(c => cardObserver.observe(c));

    const pillarObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.pillar').forEach((p, i) => {
                    setTimeout(() => p.classList.add('is-visible'), i * 130);
                });
                pillarObserver.disconnect();
            }
        });
    }, { threshold: 0.2 });
    const customSlot = document.querySelector('[data-slot="custom"]');
    if (customSlot) pillarObserver.observe(customSlot);
}

boot();
