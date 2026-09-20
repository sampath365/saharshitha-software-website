import * as THREE from 'three';

export const PAL = {
  cyan: 0x5fe3ff,
  violet: 0x8b7bff,
  magenta: 0xff6fd8,
  deep: 0x1b9fe0,
  ink: 0xeef2ff,
};

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const damp = (a, b, l, dt) => lerp(a, b, 1 - Math.exp(-l * dt));
export const rand = (a, b) => a + Math.random() * (b - a);

/* ---------------------------------------------------------------
   Shared textures (generated — no external assets)
   --------------------------------------------------------------- */
function canvas2d(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, x: c.getContext('2d') };
}

let _dot;
export function dotTexture() {
  if (_dot) return _dot;
  const { c, x } = canvas2d(64, 64);
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  _dot = new THREE.CanvasTexture(c);
  return _dot;
}

let _glow;
export function glowTexture() {
  if (_glow) return _glow;
  const { c, x } = canvas2d(256, 256);
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,.95)');
  g.addColorStop(0.16, 'rgba(190,240,255,.5)');
  g.addColorStop(0.45, 'rgba(130,190,255,.16)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  _glow = new THREE.CanvasTexture(c);
  return _glow;
}

function rr(x, px, py, w, h, r) {
  x.beginPath();
  x.moveTo(px + r, py);
  x.arcTo(px + w, py, px + w, py + h, r);
  x.arcTo(px + w, py + h, px, py + h, r);
  x.arcTo(px, py + h, px, py, r);
  x.arcTo(px, py, px + w, py, r);
  x.closePath();
}

/** Abstract product UI drawn as a transparent texture. */
export function uiTexture(kind = 'egan') {
  const phone = kind !== 'desk';
  const W = phone ? 520 : 1040;
  const H = phone ? 1040 : 660;
  const { c, x } = canvas2d(W, H);
  const pad = phone ? 18 : 14;

  x.clearRect(0, 0, W, H);
  rr(x, pad, pad, W - pad * 2, H - pad * 2, phone ? 62 : 26);
  const bg = x.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, kind === 'call' ? 'rgba(24,20,56,.94)' : 'rgba(10,20,40,.94)');
  bg.addColorStop(1, kind === 'call' ? 'rgba(46,22,72,.92)' : 'rgba(14,12,40,.92)');
  x.fillStyle = bg; x.fill();
  x.lineWidth = 2.5;
  x.strokeStyle = kind === 'call' ? 'rgba(180,160,255,.5)' : 'rgba(140,220,255,.5)';
  x.stroke();

  const accent = kind === 'call' ? 'rgba(190,170,255,' : 'rgba(140,225,255,';
  // top chrome
  x.fillStyle = accent + '.75)';
  rr(x, pad + 24, pad + 26, phone ? 92 : 120, 10, 5); x.fill();
  x.fillStyle = 'rgba(255,255,255,.22)';
  rr(x, W - pad - 90, pad + 26, 60, 10, 5); x.fill();

  if (kind === 'call') {
    // incoming call interface
    const cx = W / 2, cy = phone ? H * 0.34 : H * 0.42;
    x.fillStyle = 'rgba(255,255,255,.10)';
    x.beginPath(); x.arc(cx, cy, phone ? 108 : 92, 0, Math.PI * 2); x.fill();
    x.fillStyle = 'rgba(255,255,255,.16)';
    x.beginPath(); x.arc(cx, cy, phone ? 72 : 62, 0, Math.PI * 2); x.fill();
    x.fillStyle = 'rgba(255,255,255,.30)';
    x.beginPath(); x.arc(cx, cy, phone ? 38 : 33, 0, Math.PI * 2); x.fill();

    x.fillStyle = 'rgba(255,255,255,.85)';
    rr(x, cx - 90, cy + (phone ? 150 : 126), 180, 16, 8); x.fill();
    x.fillStyle = 'rgba(255,255,255,.35)';
    rr(x, cx - 62, cy + (phone ? 182 : 156), 124, 12, 6); x.fill();

    // accept / decline
    const by = phone ? H * 0.72 : H * 0.78;
    [cx - 78, cx + 78].forEach((bx, i) => {
      x.fillStyle = i === 0 ? 'rgba(255,110,140,.85)' : 'rgba(110,240,190,.85)';
      x.beginPath(); x.arc(bx, by, 34, 0, Math.PI * 2); x.fill();
      x.fillStyle = 'rgba(255,255,255,.9)';
      rr(x, bx - 15, by - 4, 30, 8, 4); x.fill();
    });

    // signal rows
    for (let i = 0; i < 3; i++) {
      const y = by + (phone ? 108 : 84) + i * 34;
      x.fillStyle = 'rgba(255,255,255,.10)';
      rr(x, pad + 40, y, W - pad * 2 - 80, 22, 11); x.fill();
      x.fillStyle = accent + '.55)';
      rr(x, pad + 40, y, (W - pad * 2 - 80) * (0.62 - i * 0.16), 22, 11); x.fill();
    }
  } else {
    // layered product interface
    const rows = phone ? 6 : 4;
    const top = pad + 64;
    const cardW = phone ? W - pad * 2 - 44 : (W - pad * 2 - 80) / 2.35;
    const cardH = phone ? 150 : 190;

    x.fillStyle = accent + '.14)';
    rr(x, pad + 22, top, W - pad * 2 - 44, phone ? 220 : 250, 22); x.fill();
    x.strokeStyle = accent + '.30)'; x.lineWidth = 2;
    rr(x, pad + 22, top, W - pad * 2 - 44, phone ? 220 : 250, 22); x.stroke();

    x.fillStyle = 'rgba(255,255,255,.55)';
    rr(x, pad + 48, top + 30, cardW * 0.62, 18, 9); x.fill();
    x.fillStyle = accent + '.55)';
    rr(x, pad + 48, top + 62, cardW * 0.9, 12, 6); x.fill();
    x.fillStyle = 'rgba(255,255,255,.18)';
    rr(x, pad + 48, top + 88, cardW * 1.1, 12, 6); x.fill();

    let y = top + (phone ? 252 : 286);
    for (let i = 0; i < rows; i++) {
      if (phone) {
        x.fillStyle = 'rgba(255,255,255,.075)';
        rr(x, pad + 22, y, W - pad * 2 - 44, cardH * 0.66, 18); x.fill();
        x.fillStyle = accent + '.5)';
        x.beginPath(); x.arc(pad + 70, y + 44, 20, 0, Math.PI * 2); x.fill();
        x.fillStyle = 'rgba(255,255,255,.30)';
        rr(x, pad + 104, y + 30, cardW * 0.8, 14, 7); x.fill();
        x.fillStyle = 'rgba(255,255,255,.13)';
        rr(x, pad + 104, y + 54, cardW * 1.2, 12, 6); x.fill();
        y += cardH * 0.66 + 20;
      } else {
        for (let j = 0; j < 2; j++) {
          const bx = pad + 22 + j * (cardW + 24);
          x.fillStyle = 'rgba(255,255,255,.075)';
          rr(x, bx, y, cardW, cardH * 0.72, 18); x.fill();
          x.strokeStyle = 'rgba(255,255,255,.10)'; x.lineWidth = 2;
          rr(x, bx, y, cardW, cardH * 0.72, 18); x.stroke();
          x.fillStyle = accent + '.45)';
          rr(x, bx + 22, y + 24, cardW * 0.42, 14, 7); x.fill();
          x.fillStyle = 'rgba(255,255,255,.14)';
          rr(x, bx + 22, y + 54, cardW * 0.72, 11, 5); x.fill();
          rr(x, bx + 22, y + 76, cardW * 0.55, 11, 5); x.fill();
        }
        y += cardH * 0.72 + 24;
      }
      if (y > H - 60) break;
    }
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/* ---------------------------------------------------------------
   Engine — one WebGL context, scissor-rendered per section
   --------------------------------------------------------------- */
export function createEngine() {
  const canvas = document.createElement('canvas');
  canvas.className = 'gl-root';
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    zIndex: '1', pointerEvents: 'none', display: 'block',
  });
  document.body.prepend(canvas);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: true,
      powerPreference: 'high-performance',
    });
  } catch (e) {
    document.documentElement.classList.add('no-webgl');
    return null;
  }

  const DPR = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;

  const scenes = [];
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false, ctaBoost: 0 };
  const size = { w: 0, h: 0 };
  const clock = new THREE.Clock();

  const onResize = () => {
    size.w = window.innerWidth;
    size.h = window.innerHeight;
    renderer.setSize(size.w, size.h, false);
  };
  window.addEventListener('resize', onResize, { passive: true });
  onResize();

  addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / size.w) * 2 - 1;
    mouse.ty = -((e.clientY / size.h) * 2 - 1);
    mouse.active = true;
  }, { passive: true });

  /* register a scene against a [data-scene] placeholder element */
  function register(name, factory) {
    const el = document.querySelector(`[data-scene="${name}"]`);
    if (!el) return;
    const section = el.closest('[data-scene-section]') || el.closest('section') || el;
    let obj = null;
    try { obj = factory({ THREE, PAL, rand, lerp, clamp, damp, dotTexture, glowTexture, uiTexture, el, section }); }
    catch (e) { console.warn(`[scene:${name}]`, e); return; }
    if (!obj) return;
    el.style.visibility = 'hidden';
    scenes.push({ name, el, section, obj, progress: 0, smooth: 0, seen: false });
  }

  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    const vh = size.h;
    const vw = size.w;
    mouse.x = damp(mouse.x, mouse.tx, 3.2, dt);
    mouse.y = damp(mouse.y, mouse.ty, 3.2, dt);

    renderer.setScissorTest(false);
    renderer.clear(true, true, true);
    renderer.setScissorTest(true);

    for (const s of scenes) {
      const r = s.el.getBoundingClientRect();
      const sr = s.section.getBoundingClientRect();

      // Clip the render region to the section box as well as the viewport.
      // A sticky placeholder can extend past its section (that is how the
      // pinned viewports work), and CSS overflow clips it visually — but the
      // engine draws into one fixed canvas that CSS never clips, so without
      // this intersection a scene paints over the section below it.
      const top = Math.max(0, r.top, sr.top);
      const bottom = Math.min(vh, r.bottom, sr.bottom);
      const left = Math.max(0, r.left, sr.left);
      const right = Math.min(vw, r.right, sr.right);
      const h = bottom - top;
      const w = right - left;

      if (h < 4 || w < 4) {
        s.obj.visible = false;
        continue;
      }
      s.obj.visible = true;
      const p = clamp((vh - sr.top) / (sr.height + vh));
      s.progress = p;
      s.smooth = damp(s.smooth, p, 4.5, dt);

      const gx = (r.left + r.width / 2) / vw * 2 - 1;
      const gy = (vh - (r.top + r.height / 2)) / vh * 2 - 1;

      // frame the scene to the element's own box so the view crops like a window
      const aspect = r.width / Math.max(1, r.height);
      if (s.obj.camera && s.obj.camera.isPerspectiveCamera) {
        s.obj.camera.aspect = aspect;
        s.obj.camera.updateProjectionMatrix();
      }

      renderer.setViewport(left * DPR, (vh - bottom) * DPR, w * DPR, h * DPR);
      renderer.setScissor(left * DPR, (vh - bottom) * DPR, w * DPR, h * DPR);

      try {
        s.obj.update(t, s.smooth, dt, {
          w, h, aspect, mx: mouse.x, my: mouse.y, gx, gy,
          raw: s.progress, ctaBoost: mouse.ctaBoost,
          elW: r.width, elH: r.height,
        });
      }
      catch (e) { /* keep the loop alive */ }
      renderer.render(s.obj.scene, s.obj.camera);
    }
  }

  frame();

  return { register, mouse, size, renderer, THREE };
}