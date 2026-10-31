/* ============================================================
   EGAN PAYROLL — standalone site behaviour
   ------------------------------------------------------------
   No bundler, no dependencies: sticky nav, a mobile menu built from the
   desktop links, and a reveal-on-scroll pass. Everything degrades to a
   plain document if this file never loads.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- sticky nav ---- */
  var nav = document.getElementById('nav');
  var onScroll = function () {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- mobile menu, built from the desktop nav ---- */
  var burger = document.getElementById('burger');
  var links = document.querySelectorAll('.nav__links a');
  if (burger && links.length) {
    var menu = document.createElement('nav');
    menu.className = 'menu';
    menu.setAttribute('aria-label', 'Mobile');
    Array.prototype.forEach.call(links, function (a) {
      var link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = a.textContent;
      menu.appendChild(link);
    });
    document.body.appendChild(menu);

    var close = function () {
      document.body.classList.remove('menu-open');
      burger.setAttribute('aria-expanded', 'false');
    };
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') close();
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  /* ---- reveal on scroll, with a sweep for fast scrolls ---- */
  var targets = document.querySelectorAll(
    '.hero__wrap, .section .eyebrow, .section .display, .section .lede, .split .panel, .cycle__step, .card, .who__item, .note, .contact__cta'
  );
  Array.prototype.forEach.call(targets, function (el, i) {
    el.setAttribute('data-reveal', '');
    el.style.transitionDelay = (Math.min(i, 8) * 0.04).toFixed(2) + 's';
  });

  if (reduce || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-in'); });
    return;
  }

  var pending = new Set(targets);
  var show = function (el) { el.classList.add('is-in'); pending.delete(el); };

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  pending.forEach(function (el) { io.observe(el); });

  var sweep = function () {
    if (!pending.size) return;
    var line = window.innerHeight * 0.92;
    pending.forEach(function (el) {
      if (el.getBoundingClientRect().top < line) { show(el); io.unobserve(el); }
    });
  };
  window.addEventListener('scroll', sweep, { passive: true });
  window.addEventListener('resize', sweep, { passive: true });
  setTimeout(sweep, 500);
})();
