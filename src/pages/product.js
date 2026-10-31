import '../styles/base.css';
import '../styles/sections.css';
import '../styles/pages.css';

import { createEngine } from '../webgl/engine.js';
import { registerProductScene } from '../webgl/product-scene.js';
import { PRODUCTS, getProduct } from '../data/products.js';
import { COMPANY } from '../data/company.js';
import {
  $, $$, runLoader, initScroll, initNav, initCursor, initMagnetic,
  initReveals, initSplits, initTilt,
} from '../ui/shared.js';

const params = new URLSearchParams(location.search);
const product = getProduct(params.get('p')) || PRODUCTS[0];

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

function render() {
  document.title = `${product.name} — ${COMPANY.name}`;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', product.summary);

  $('#crumbName').textContent = product.name;

  $('#pdBadge').innerHTML = `<i></i>${esc(product.tag)}`;
  $('#pdName').textContent = product.name;
  $('#pdLine').textContent = product.line;
  $('#pdOverview').textContent = product.overview;

  // live-site strip: only products with a deployed URL get one
  const live = $('#pdLive');
  if (product.url) {
    live.innerHTML = `
      <span class="pd__liveBadge"><i></i>Live now</span>
      <span class="pd__liveHost">${esc(product.urlLabel || product.url)}</span>
      <a class="pd__liveLink" href="${esc(product.url)}" target="_blank" rel="noopener noreferrer"
         data-cursor="Open live site">
        <span>Open the live site</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7"/></svg>
      </a>`;
  } else {
    live.remove();
  }

  $('#pdCaps').innerHTML = product.capabilities.map((c) => `
    <article class="cap" data-reveal="up">
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.body)}</p>
    </article>`).join('');

  const audience = product.audience?.length
    ? product.audience
    : product.who.map((w) => ({ title: null, body: w }));
  $('#pdWho').innerHTML = audience.map((a) => `
    <div class="who" data-reveal="up">
      <span>${a.title ? `<strong>${esc(a.title)}</strong><br>` : ''}${esc(a.body)}</span>
    </div>`).join('');

  // optional blocks, shown only when the product defines them
  const cats = $('#pdCats');
  const catsSection = $('#pdCatsSection');
  if (product.categories?.length) {
    cats.innerHTML = product.categories.map((c) => `
      <li class="cat" data-reveal="up">
        <span class="cat__icon" aria-hidden="true">${c.icon}</span>
        <span class="cat__name">${esc(c.name)}</span>
      </li>`).join('');
  } else {
    catsSection.remove();
  }

  const vision = $('#pdVision');
  const visionSection = $('#pdVisionSection');
  if (product.vision) {
    vision.textContent = product.vision;
  } else {
    visionSection.remove();
  }

  $('#pdSwitch').innerHTML = PRODUCTS.map((p) => `
    <a href="?p=${p.id}"${p.id === product.id ? ' class="is-current" aria-current="page"' : ''}>${esc(p.name)}</a>`
  ).join('');

  $('#pdStageLabel').textContent = `${product.name} · live view`;
  document.documentElement.dataset.accent = product.accent;
}

function boot() {
  render();
  initScroll();
  initNav();
  initCursor();
  initMagnetic();
  initReveals();
  initSplits();
  initTilt();

  const engine = createEngine();
  if (engine) registerProductScene(engine, product.id);

  document.fonts?.ready.then(() => dispatchEvent(new Event('resize')));
}

runLoader(boot);