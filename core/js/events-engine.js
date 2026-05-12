// events-engine.js — Renderiza eventos en #eventos-grid.
// Hoy recibe array (de content.json). Cuando se conecte Firestore,
// la query devolverá la misma shape de objetos.

const GRID_ID = 'eventos-grid';

export function renderEvents(events, opts = {}) {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;

    const visible = (events || []).filter(e => !e.archived);

    if (!visible.length) {
        grid.innerHTML = renderEmpty(opts.instagramUrl);
        return;
    }

    grid.innerHTML = visible.map(renderEvent).join('');

    // Si el flyer image 404ea, sacarlo para que se vea el gradient de fondo.
    grid.querySelectorAll('.event-flyer-image').forEach(img => {
        img.addEventListener('error', () => img.remove(), { once: true });
    });
}

function renderEvent(e) {
    const cyclesBody = (e.cycles && e.cycles.length)
        ? '<div class="event-cycles">' +
              e.cycles.map(c => '<span class="event-cycle">' + escapeHtml(c) + '</span>').join('') +
          '</div>'
        : '';

    const cyclesFlyer = (e.cycles && e.cycles.length)
        ? '<div class="event-flyer-cycles">' + e.cycles.map(escapeHtml).join(' · ') + '</div>'
        : '';

    const supporting = e.supporting
        ? '<p class="event-supporting">' + escapeHtml(e.supporting) + '</p>'
        : '';

    const ctaLabel = e.soldOut ? 'Sold Out' : 'Comprar entradas';
    const ctaClass = e.soldOut ? 'btn-disabled' : 'btn-primary';
    const ctaAttrs = e.soldOut
        ? 'href="#" tabindex="-1" aria-disabled="true"'
        : 'href="' + escapeAttr(e.ticketUrl || '#') + '" target="_blank" rel="noopener"';

    const soldoutStripe = e.soldOut
        ? '<span class="event-soldout-stripe">Sold Out</span>'
        : '';

    // Flyer: imagen si hay, si no gradient placeholder
    const flyerStyle = e.flyerUrl
        ? ''
        : (e.flyerGradient ? ' style="background:' + escapeAttr(e.flyerGradient) + '"' : '');

    const flyerImg = e.flyerUrl
        ? '<img class="event-flyer-image" src="' + escapeAttr(e.flyerUrl) +
              '" alt="Flyer ' + escapeHtml(e.headliner) + '" loading="lazy">'
        : '';

    return ''
        + '<article class="event-card">'
        +   '<div class="event-flyer"' + flyerStyle + '>'
        +       flyerImg
        +       soldoutStripe
        +       '<div class="event-flyer-top">'
        +           '<span>' + escapeHtml(e.dateLabel || '') + '</span>'
        +           '<span class="brand-mark" aria-hidden="true"></span>'
        +       '</div>'
        +       '<div class="event-flyer-bottom">'
        +           '<div class="event-flyer-headliner">' + escapeHtml(e.headliner || '') + '</div>'
        +           cyclesFlyer
        +       '</div>'
        +   '</div>'
        +   '<div class="event-body">'
        +       '<span class="event-date">' + escapeHtml(e.dateLabel || '') + '</span>'
        +       '<h3 class="event-headliner">' + escapeHtml(e.headliner || '') + '</h3>'
        +       supporting
        +       cyclesBody
        +       '<a class="btn ' + ctaClass + ' event-cta" ' + ctaAttrs + '>' + ctaLabel + '</a>'
        +   '</div>'
        + '</article>';
}

function renderEmpty(instagramUrl) {
    const ig = instagramUrl
        ? '<a href="' + escapeAttr(instagramUrl) + '" target="_blank" rel="noopener" style="color:var(--color-text);text-decoration:underline;">Instagram</a>'
        : 'Instagram';
    return ''
        + '<div class="eventos-empty">'
        +   'Próximos eventos en preparación. Seguinos en ' + ig + ' para enterarte primero.'
        + '</div>';
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    }[c]));
}
function escapeAttr(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    }[c]));
}
