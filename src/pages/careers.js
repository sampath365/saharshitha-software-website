import '../styles/base.css';
import '../styles/sections.css';
import '../styles/pages.css';

import { COMPANY } from '../data/company.js';
import { OPENINGS, TEAMS } from '../data/careers.js';
import {
  $, $$, runLoader, initScroll, initNav, initCursor, initMagnetic,
  initReveals, initSplits,
} from '../ui/shared.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

function renderOpenings() {
  const host = $('#openings');

  if (!OPENINGS.length) {
    host.innerHTML = `
      <div class="empty-state" data-reveal="up">
        <h3>No openings listed right now</h3>
        <p>
          We are not advertising specific roles at the moment. We still read every
          introduction, so if your work fits where we are heading, send it across.
        </p>
        <a class="btn btn--primary magnetic" href="#apply">
          <span>Send an introduction</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
        </a>
      </div>`;
    return;
  }

  host.innerHTML = OPENINGS.map((o) => `
    <article class="opening" data-reveal="up">
      <button class="opening__head" aria-expanded="false">
        <span>
          <span class="opening__title">${esc(o.title)}</span>
          <span class="opening__meta">
            <span>${esc(o.team)}</span><span>${esc(o.location)}</span><span>${esc(o.type)}</span>
          </span>
        </span>
        <span class="opening__toggle" aria-hidden="true"></span>
      </button>
      <div class="opening__body"><div><div class="opening__inner">
        <div>
          <h4>About the role</h4>
          <p style="color:var(--ink-2);font-size:.92rem;line-height:1.7">${esc(o.summary)}</p>
        </div>
        <div>
          <h4>Responsibilities</h4>
          <ul>${(o.responsibilities || []).map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
        </div>
        <div>
          <h4>Requirements</h4>
          <ul>${(o.requirements || []).map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
        </div>
      </div></div></div>
    </article>`).join('');

  $$('.opening__head').forEach((b) => b.addEventListener('click', () => {
    const card = b.closest('.opening');
    const open = card.classList.toggle('is-open');
    b.setAttribute('aria-expanded', String(open));
  }));
}

function render() {
  $('#aTeam').innerHTML = ['Any team', ...TEAMS]
    .map((t) => `<option>${t}</option>`).join('');
  renderOpenings();

  const form = $('#applyForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const status = $('#applyStatus');
    const data = new FormData(form);
    const name = (data.get('name') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const role = (data.get('role') || '').toString();
    const team = (data.get('team') || '').toString();
    const portfolio = (data.get('portfolio') || '').toString().trim();
    const note = (data.get('note') || '').toString().trim();

    if (!name || !email) {
      status.className = 'form__status is-on is-err';
      status.textContent = 'Please add your name and email so we can reply.';
      return;
    }

    const subject = `Application — ${role || team} — ${name}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Team: ${team}`,
      role ? `Role: ${role}` : null,
      portfolio ? `Portfolio: ${portfolio}` : null,
      '',
      note || '(no note)',
    ].filter(Boolean).join('\n');

    window.location.href =
      `mailto:${COMPANY.careersEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    status.className = 'form__status is-on is-ok';
    status.textContent =
      'Opening your email app with the application ready to send. If nothing happens, email us directly at ' + COMPANY.careersEmail + '.';
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