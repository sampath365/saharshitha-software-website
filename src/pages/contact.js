import '../styles/base.css';
import '../styles/sections.css';
import '../styles/pages.css';

import { COMPANY, contactLines } from '../data/company.js';
import { PRODUCTS } from '../data/products.js';
import {
  $, $$, runLoader, initScroll, initNav, initCursor, initMagnetic,
  initReveals, initSplits,
} from '../ui/shared.js';

function render() {
  $('#infoList').innerHTML = contactLines().map((l) => `
    <div class="info">
      <span class="info__label">${l.label}</span>
      ${l.href
        ? `<a class="info__value" href="${l.href}">${l.value}</a>`
        : `<span class="info__value">${l.value}</span>`}
    </div>`).join('');

  $('#cTopic').innerHTML = [
    'General enquiry',
    ...PRODUCTS.map((p) => p.name),
    'Partnership',
    'Support',
  ].map((t) => `<option>${t}</option>`).join('');

  // mailto fallback: the form opens the user's mail client with the message
  // pre-filled. Swap the handler for a real endpoint when one exists.
  const form = $('#contactForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const status = $('#formStatus');
    const data = new FormData(form);
    const name = (data.get('name') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const topic = (data.get('topic') || '').toString();
    const message = (data.get('message') || '').toString().trim();

    if (!name || !email || !message) {
      status.className = 'form__status is-on is-err';
      status.textContent = 'Please fill in your name, email and message.';
      return;
    }

    const subject = `${topic} — ${name}`;
    const body = `${message}\n\n—\n${name}\n${email}`;
    window.location.href =
      `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    status.className = 'form__status is-on is-ok';
    status.textContent =
      'Opening your email app with the message ready to send. If nothing happens, email us directly at ' + COMPANY.email + '.';
  });
}

function boot() {
  render();
  initScroll();
  initNav();
  initCursor();
  initMagnetic();
  initReveals();
  initSplits();
  document.fonts?.ready.then(() => dispatchEvent(new Event('resize')));
}

runLoader(boot);