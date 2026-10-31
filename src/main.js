import './styles/base.css';
import './styles/sections.css';
import './styles/pages.css';

import { createEngine } from './webgl/engine.js';
import { registerScenes } from './webgl/scenes.js';
import { registerAmbient } from './webgl/ambient.js';
import { PLATFORMS, APP_DOWNLOAD } from './data/platforms.js';
import {
  $, $$, lenis, runLoader, initScroll, initNav, initCursor, initMagnetic,
  initReveals, initSplits, initTilt, initJourney, initFuture, initTechNodes,
  initContactAndParallax, initPlatforms, scrollTo,
} from './ui/shared.js';

/* ============================================================
   BOOT
   ============================================================ */
function boot() {
  initScroll();
  initNav();
  initCursor();
  initMagnetic();

  // render the live-platform grid before reveals so its cards animate in
  initPlatforms({ platforms: PLATFORMS, app: APP_DOWNLOAD });

  initReveals();
  initSplits();
  initTilt();
  initJourney();
  initFuture();
  initTechNodes();

  const engine = createEngine();
  if (engine) {
    registerAmbient(engine);
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