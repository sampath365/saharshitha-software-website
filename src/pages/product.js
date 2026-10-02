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

  $('#pdCaps').innerHTML = product.capabilities.map((c) => `
    <article class="cap" data-reveal="up">
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.body)}</p>
    </article>`).join('');

  $('#pdWho').innerHTML = product.who.map((w) => `
    <div class="who" data-reveal="up"><span>${esc(w)}</span></div>`).join('');

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