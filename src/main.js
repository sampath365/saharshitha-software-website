import './styles/base.css';
import './styles/sections.css';

import Lenis from 'lenis';
import { createEngine } from './webgl/engine.js';
import { registerScenes, techLayout, techLive } from './webgl/scenes.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ============================================================
   1. LOADER
   ============================================================ */
const STEPS = ['S', 'SA', 'SAH', 'SAHA', 'SAHARSHITHA', 'SAHARSHITHA SOFTWARE'];

function runLoader(done) {
  const word = $('#loaderWord');
  const bar = $('#loaderBar');
  const html = document.documentElement;

  const finish = () => {
    html.classList.remove('is-loading');
    document.body.classList.remove('is-locked');
    done();
  };

  if (reduce) { word.textContent = STEPS[5]; bar.style.width = '100%'; setTimeout(finish, 120); return; }

  document.body.classList.add('is-locked');
  let i = 0;
  const step = () => {
    word.textContent = STEPS[i];
    bar.style.width = `${((i + 1) / STEPS.length) * 100}%`;
    i++;
    if (i < STEPS.length) setTimeout(step, i < 5 ? 92 : 230);
    else setTimeout(finish, 420);
  };
  setTimeout(step, 130);
}

/* ============================================================
   2. SMOOTH SCROLL
   ============================================================ */
let lenis = null;
function initScroll() {
  if (reduce) return null;
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6,
    wheelMultiplier: 1,
  });
  const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  return lenis;
}

function scrollTo(target) {
  const el = typeof target === 'string' ? $(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.25 });
  else el.scrollIntoView({ behavior: 'smooth' });
}

/* ============================================================
   3. NAV
   ============================================================ */
function initNav() {
  const nav = $('#nav');
  const indicator = $('#navIndicator');
  const links = $$('.nav__links a[data-nav]');
  const sections = ['#home', '#about', '#products', '#technology', '#careers', '#insights', '#contact']
    .map((s) => $(s)).filter(Boolean);

  const moveIndicator = (a) => {
    if (!a) { indicator.style.opacity = '0'; return; }
    const nb = $('.nav__links').getBoundingClientRect();
    const ab = a.getBoundingClientRect();
    indicator.style.opacity = '1';
    indicator.style.width = `${ab.width}px`;
    indicator.style.transform = `translateY(-50%) translateX(${ab.left - nb.left}px)`;
  };

  let lastY = window.scrollY;
  let active = null;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 40);
    if (document.body.classList.contains('menu-open')) return;
    if (y > lastY && y > 500) nav.classList.add('is-hidden');
    else nav.classList.remove('is-hidden');
    lastY = y;

    // active section
    let idx = 0;
    sections.forEach((s, i) => {
      if (s.getBoundingClientRect().top <= window.innerHeight * 0.42) idx = i;
    });
    const a = links[idx];
    if (a && a !== active) {
      active = a;
      links.forEach((l) => l.classList.toggle('is-active', l === a));
      moveIndicator(a);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => moveIndicator(active), { passive: true });
  setTimeout(onScroll, 400);

  links.forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); scrollTo(a.getAttribute('href')); }));

  // mobile menu
  const burger = $('#burger');
  const menu = $('#menu');
  burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('is-locked', open);
    if (lenis) open ? lenis.stop() : lenis.start();
  });
  $$('.menu__links a, .menu__foot a').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    const href = a.getAttribute('href');
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (lenis) lenis.start();
    setTimeout(() => scrollTo(href), 120);
  }));
}

/* ============================================================
   4. CURSOR
   ============================================================ */
function initCursor() {
  if (!fine || reduce) return;
  document.body.classList.add('has-cursor');
  const root = $('#cursor');
  const dot = $('.cursor__dot');
  const ring = $('.cursor__ring');
  const label = $('#cursorLabel');

  let mx = innerWidth / 2, my = innerHeight / 2;
  let rx = mx, ry = my;

  addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
  }, { passive: true });

  const loop = () => {
    rx = lerp(rx, mx, 0.16); ry = lerp(ry, my, 0.16);
    ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  };
  loop();

  const enter = (e) => {
    const t = e.target.closest('a, button, .node, .icard, .vcard, .pillar');
    if (!t) return;
    const txt = t.dataset.cursor;
    root.classList.add('is-hover');
    if (txt) { root.classList.add('is-label'); label.textContent = txt; }
  };
  const leave = (e) => {
    const t = e.target.closest('a, button, .node, .icard, .vcard, .pillar');
    if (!t) return;
    root.classList.remove('is-hover', 'is-label');
    label.textContent = '';
  };
  document.addEventListener('pointerover', enter);
  document.addEventListener('pointerout', leave);
  addEventListener('pointerdown', () => root.classList.add('is-down'));
  addEventListener('pointerup', () => root.classList.remove('is-down'));
}

/* ============================================================
   5. MAGNETIC BUTTONS
   ============================================================ */
function initMagnetic() {
  if (!fine || reduce) return;
  $$('.magnetic').forEach((el) => {
    let raf = null;
    const strength = 0.26;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      el.style.setProperty('--mx', `${mx}%`);
      el.style.setProperty('--my', `${my}%`);
    };
    el.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = null; move(e); });
    });
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform .7s cubic-bezier(.22,1,.36,1), box-shadow .55s, background-color .3s, border-color .3s, color .3s';
      el.style.transform = 'translate(0,0)';
      setTimeout(() => { el.style.transition = ''; }, 720);
    });
  });
}

/* ============================================================
   6. REVEALS
   ============================================================ */
function initReveals() {
  $$('[data-reveal]').forEach((el) => {
    const d = parseFloat(el.dataset.revealDelay || '0');
    el.style.setProperty('--rd', `${d}s`);
  });

  const pending = new Set($$('[data-reveal]'));
  const show = (el) => { el.classList.add('is-in'); pending.delete(el); };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  pending.forEach((el) => io.observe(el));

  // Fallback sweep: a fast scroll can carry an element past the viewport between
  // observer deliveries, so anything already at or above the reveal line is shown.
  const sweep = () => {
    if (!pending.size) return;
    const line = innerHeight * 0.9;
    pending.forEach((el) => {
      if (el.getBoundingClientRect().top < line) { show(el); io.unobserve(el); }
    });
  };
  window.addEventListener('scroll', sweep, { passive: true });
  if (lenis) lenis.on('scroll', sweep);
  addEventListener('resize', sweep, { passive: true });
  setTimeout(sweep, 600);
}

/* ============================================================
   7. TEXT SPLIT REVEAL
   ============================================================ */
function splitWords(el) {
  const lineRuns = [];
  const walk = (node) => {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((tok) => {
          if (!tok.trim()) { frag.appendChild(document.createTextNode(tok)); return; }
          const w = document.createElement('span');
          w.className = 'word';
          const inner = document.createElement('i');
          inner.textContent = tok;
          w.appendChild(inner);
          frag.appendChild(w);
        });
        node.replaceChild(frag, n);
      } else if (n.nodeType === 1 && !n.classList.contains('line')) {
        walk(n);
      } else if (n.nodeType === 1) {
        lineRuns.push(n);
      }
    });
  };
  walk(el);
  return $$('.word > i', el);
}

function initSplits() {
  const targets = $$('[data-split], .hero__title, .future__big, .contact__big');
  const all = [];
  targets.forEach((t) => {
    const inners = splitWords(t);
    inners.forEach((i) => {
      i.style.transform = 'translateY(112%) rotate(3deg)';
      i.style.opacity = '0';
      i.style.transition = `transform 1.15s cubic-bezier(.22,1,.36,1), opacity .9s ease`;
    });
    all.push({ el: t, inners });
  });

  if (reduce) {
    all.forEach(({ inners }) => inners.forEach((i) => { i.style.transform = 'none'; i.style.opacity = '1'; }));
    return;
  }

  const reveal = (rec) => {
    rec.inners.forEach((i, k) => {
      i.style.transitionDelay = `${0.05 + k * 0.032}s`;
      i.style.transform = 'none';
      i.style.opacity = '1';
    });
  };

  const pending = new Set(all);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const rec = all.find((a) => a.el === en.target);
      if (rec) { reveal(rec); pending.delete(rec); }
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
  pending.forEach((a) => io.observe(a.el));

  const sweep = () => {
    if (!pending.size) return;
    const line = innerHeight * 0.88;
    pending.forEach((rec) => {
      if (rec.el.getBoundingClientRect().top < line) { reveal(rec); pending.delete(rec); io.unobserve(rec.el); }
    });
  };
  window.addEventListener('scroll', sweep, { passive: true });
  if (lenis) lenis.on('scroll', sweep);
  setTimeout(sweep, 700);
}

/* ============================================================
   8. TILT
   ============================================================ */
function initTilt() {
  if (!fine || reduce) return;
  $$('.tilt').forEach((el) => {
    let raf = null;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.transform =
          `perspective(1000px) rotateX(${(0.5 - py) * 7}deg) rotateY(${(px - 0.5) * 7}deg) translateY(-4px)`;
        el.style.setProperty('--gx', `${px * 100}%`);
        el.style.setProperty('--gy', `${py * 100}%`);
      });
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform .8s cubic-bezier(.22,1,.36,1)';
      el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
      setTimeout(() => { el.style.transition = ''; }, 820);
    });
  });
}

/* ============================================================
   9. JOURNEY
   ============================================================ */
function initJourney() {
  const section = $('.journey');
  const steps = $$('#journeySteps .step');
  const prog = $('#journeyProgress');
  if (!section) return;

  const onScroll = () => {
    const r = section.getBoundingClientRect();
    const total = r.height - innerHeight;
    const p = clamp(-r.top / Math.max(1, total));
    if (prog) prog.style.width = `${p * 100}%`;
    const n = steps.length;
    steps.forEach((s, i) => s.classList.toggle('is-on', p >= i / n - 0.02));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ============================================================
   10. FUTURE dark → light
   ============================================================ */
function initFuture() {
  const section = $('.future');
  if (!section) return;
  const onScroll = () => {
    const r = section.getBoundingClientRect();
    const p = clamp((innerHeight * 0.62 - r.top) / (r.height * 0.72));
    section.classList.toggle('is-light', p > 0.52);
    section.style.setProperty('--fp', p.toFixed(3));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ============================================================
   11. TECH NODE SYNC (DOM labels locked to the 3D nodes)
   ============================================================ */
function initTechNodes() {
  const stage = $('.tech__stage');
  const nodes = $$('#techNodes .node');
  if (!stage || !nodes.length) return;

  const place = (aspect) => {
    const { percents, sx } = techLayout(aspect);
    percents.forEach(([px, py], i) => {
      const n = nodes[i];
      if (!n) return;
      n.style.left = `${px}%`;
      n.style.top = `${py}%`;
      n.dataset.base = `${px},${py}`;
    });
    stage.dataset.sx = String(sx);
  };

  const r = stage.getBoundingClientRect();
  place(r.width / Math.max(1, r.height));
  addEventListener('resize', () => {
    const b = stage.getBoundingClientRect();
    place(b.width / Math.max(1, b.height));
  }, { passive: true });

  let visible = false;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { rootMargin: '10%' })
    .observe(stage);

  const loop = () => {
    requestAnimationFrame(loop);
    // skip the DOM writes while the section is off-screen
    if (!visible) return;
    nodes.forEach((n, i) => {
      const t = techLive.pts[i];
      if (!t) return;
      // blend the analytic layout with the live projection for exact tracking
      const [bx, by] = (n.dataset.base || '50,50').split(',').map(Number);
      n.style.left = `${lerp(bx, t[0], 0.85)}%`;
      n.style.top = `${lerp(by, t[1], 0.85)}%`;
    });
  };
  if (!reduce) requestAnimationFrame(loop);

  // hover focus: dim the other nodes (connection lines are in the 3D scene)
  nodes.forEach((n) => {
    const on = () => nodes.forEach((o) => o.classList.toggle('is-dim', o !== n));
    const off = () => nodes.forEach((o) => o.classList.remove('is-dim'));
    n.addEventListener('pointerenter', on);
    n.addEventListener('pointerleave', off);
    n.addEventListener('focus', on);
    n.addEventListener('blur', off);
  });
}

/* ============================================================
   12. CONTACT CTA BOOST + careers parallax
   ============================================================ */
function initContactAndParallax(engine) {
  const cta = $('.contact .btn');
  if (cta && engine) {
    cta.addEventListener('pointerenter', () => { engine.mouse.ctaBoost = 1; });
    cta.addEventListener('pointerleave', () => { engine.mouse.ctaBoost = 0; });
  }

  if (reduce || !fine) return;
  const floats = $$('.careers__float .fl');
  const section = $('.careers');
  if (!floats.length || !section) return;
  let raf = null, mx = 0, my = 0;
  const render = () => {
    raf = null;
    floats.forEach((f) => {
      const d = parseFloat(f.dataset.depth || '0.3');
      f.style.transform = `translate3d(${mx * d * 60}px, ${my * d * 60}px, 0)`;
    });
  };
  section.addEventListener('pointermove', (e) => {
    const r = section.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width - 0.5;
    my = (e.clientY - r.top) / r.height - 0.5;
    if (!raf) raf = requestAnimationFrame(render);
  });
  section.addEventListener('pointerleave', () => {
    mx = 0; my = 0;
    if (!raf) raf = requestAnimationFrame(render);
  });
}

/* ============================================================
   BOOT
   ============================================================ */
function boot() {
  initScroll();
  initNav();
  initCursor();
  initMagnetic();
  initReveals();
  initSplits();
  initTilt();
  initJourney();
  initFuture();
  initTechNodes();

  const engine = createEngine();
  if (engine) {
    registerScenes(engine);
    initContactAndParallax(engine);
  } else {
    initContactAndParallax(null);
  }

  // anchor links
  $$('a[href^="#"]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href.length < 2) return;
    if (a.dataset.nav !== undefined || a.closest('.menu') || a.closest('.nav__brand') || a.closest('.footer') || a.closest('.scrollcue') || a.closest('.hero__cta')) {
      a.addEventListener('click', (e) => {
        if (!$(href)) return;
        e.preventDefault();
        if (lenis) lenis.start();
        scrollTo(href);
      });
    }
  });

  // keep the pinned sections measured correctly after fonts load
  document.fonts?.ready.then(() => {
    if (lenis) lenis.resize();
    dispatchEvent(new Event('resize'));
  });
}

runLoader(boot);