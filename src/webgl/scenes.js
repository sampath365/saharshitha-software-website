import * as THREE from 'three';
import { PAL, rand, lerp, clamp, dotTexture, glowTexture, uiTexture } from './engine.js';

const { cyan, violet, magenta } = PAL;

function basic(color, pos, opts = {}) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({
    color, size: opts.size || 0.06, map: dotTexture(),
    transparent: true, opacity: opts.opacity ?? 0.9,
    depthWrite: false, blending: THREE.AdditiveBlending,
    sizeAttenuation: opts.attenuation ?? true,
  });
  return new THREE.Points(g, m);
}

function cloud(n, rMin, rMax, flatten = 1) {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = rand(rMin, rMax), th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    a[i * 3] = r * Math.sin(ph) * Math.cos(th);
    a[i * 3 + 1] = r * Math.cos(ph) * flatten;
    a[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  return a;
}

function shellPoints(n, r) {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    a[i * 3] = r * Math.sin(ph) * Math.cos(th);
    a[i * 3 + 1] = r * Math.cos(ph);
    a[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  return a;
}

/** Node cloud + proximity edges, generated once per scene. */
function graph(n, radius, spread, linkDist, colors) {
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    const r = radius * (0.55 + Math.random() * spread);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.cos(ph) * 0.8;
    pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    c.setHex(colors[i % colors.length]);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));

  const points = new THREE.Points(g, new THREE.PointsMaterial({
    size: 0.095, map: dotTexture(), vertexColors: true, transparent: true,
    opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending,
  }));

  const lp = [];
  const d2 = linkDist * linkDist;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = pos[i * 3] - pos[j * 3];
      const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
      const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
      const s = dx * dx + dy * dy + dz * dz;
      if (s < d2) lp.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]);
    }
  }
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
  const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({
    color: cyan, transparent: true, opacity: 0.16,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }));

  const group = new THREE.Group();
  group.add(points, lines);
  return { group, points, lines, positions: pos, count: n };
}

function glowSprite(scale, color = cyan, opacity = 0.55) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(), color, transparent: true, opacity,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  s.scale.set(scale, scale, 1);
  return s;
}

function rings(color, count, r0) {
  const g = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const r = r0 + i * 0.34;
    const geo = new THREE.RingGeometry(r, r + 0.008, 128);
    const m = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.3 - i * 0.05,
      side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const ring = new THREE.Mesh(geo, m);
    ring.rotation.x = Math.PI / 2 + (i % 2 ? 0.22 : -0.16);
    ring.rotation.y = i * 0.4;
    ring.userData.spin = (i % 2 ? 1 : -1) * (0.06 + i * 0.02);
    g.add(ring);
  }
  return g;
}

function torusKnot(color, scale) {
  const geo = new THREE.TorusKnotGeometry(1, 0.012, 320, 12, 2, 3);
  const m = new THREE.MeshBasicMaterial({
    color, transparent: true, opacity: 0.28,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, m);
  mesh.scale.setScalar(scale);
  return mesh;
}

/* Shared tech-node layout so DOM labels sit exactly on the 3D nodes. */
const TECH_FOV = 45, TECH_Z = 8.4;
export const TECH_POS = [
  [0, 2.5], [2.6, 1.5], [2.9, -0.5], [2.2, -2.2],
  [-2.4, -2.3], [-2.9, -0.3], [-2.7, 1.6], [0, -2.9],
];
export const techLive = { pts: TECH_POS.map(() => [50, 50]) };

export function techLayout(aspect) {
  const halfH = Math.tan((TECH_FOV / 2) * Math.PI / 180) * TECH_Z;
  const halfW = halfH * aspect;
  const sx = Math.min(1, Math.max(0.42, aspect / 1.65));
  const percents = TECH_POS.map(([x, y]) => [
    50 + (x * sx) / (2 * halfW) * 100,
    50 - y / (2 * halfH) * 100,
  ]);
  return { percents, sx, halfH, halfW };
}

export function registerScenes(engine) {
  const R = engine.register.bind(engine);

  /* ============================================================
     HERO — digital core, 5 scroll stages
     ============================================================ */
  R('hero', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.25, 7.4);

    const world = new THREE.Group();
    scene.add(world);

    const corePts = graph(96, 1.9, 0.5, 0.62, [cyan, 0xbfe9ff, violet]);
    const outerPts = graph(150, 3.5, 0.75, 0.5, [violet, cyan, magenta]);
    const dust = basic(1400, cloud(1400, 5, 14, 1), { size: 0.05, opacity: 0.5 });

    const knot = torusKnot(violet, 1.05);
    const ringSet = rings(cyan, 4, 2.3);
    const ringSet2 = rings(violet, 3, 3.1);
    const glow = glowSprite(9.5, cyan, 0.34);
    const glow2 = glowSprite(5, violet, 0.3);

    world.add(corePts.group, outerPts.group, dust, knot, ringSet, ringSet2, glow, glow2);

    const coreShell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.55, 3),
      new THREE.MeshBasicMaterial({
        color: 0x8fe6ff, transparent: true, opacity: 0.055,
        wireframe: true, depthWrite: false, blending: THREE.AdditiveBlending,
      })
    );
    world.add(coreShell);

    // product "cards" that the network resolves into (stage 4)
    const cardGeo = new THREE.PlaneGeometry(1.5, 1.05);
    const cards = [];
    [
      { t: uiTexture('desk'), x: -3.1, y: 0.5, z: 0.6, hex: cyan },
      { t: uiTexture('phone'), x: 3.15, y: 0.1, z: 0.4, hex: violet },
    ].forEach((cfg) => {
      const m = new THREE.MeshBasicMaterial({
        map: cfg.t, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(cardGeo, m);
      mesh.scale.setScalar(cfg.t.image.width > cfg.t.image.height ? 1.25 : 0.72);
      mesh.position.set(0, 0, 0);
      mesh.userData = { ...cfg };
      cards.push(mesh);
      world.add(mesh);
    });

    const st = { mx: 0, my: 0 };

    return {
      scene, camera,
      update(t, p, dt, m) {
        st.mx = lerp(st.mx, m.mx, 0.05);
        st.my = lerp(st.my, m.my, 0.05);

        // ---- staged scroll transformation ----
        const s1 = clamp((p - 0.02) / 0.16);
        const s2 = clamp((p - 0.16) / 0.18);
        const s3 = clamp((p - 0.34) / 0.18);
        const s4 = clamp((p - 0.52) / 0.20);
        const s5 = clamp((p - 0.74) / 0.22);

        world.rotation.y = t * 0.055 + st.mx * 0.3;
        world.rotation.x = Math.sin(t * 0.09) * 0.05 - st.my * 0.18;

        // Stage 1 → 2: core expands, lines fade in
        corePts.group.scale.setScalar(1 + s1 * 0.35);
        corePts.lines.material.opacity = 0.16 + s1 * 0.3;
        outerPts.group.scale.setScalar(0.35 + s2 * 0.78);
        outerPts.group.rotation.y = -t * 0.045 + s2 * 0.5;
        outerPts.lines.material.opacity = (0.05 + s2 * 0.34) * (1 - s5 * 0.65);

        // Stage 3: nodes brighten
        corePts.points.material.size = 0.095 + s3 * 0.055;
        outerPts.points.material.size = 0.09 + s3 * 0.05;
        knot.material.opacity = 0.3 * (1 - s2 * 0.7);
        coreShell.material.opacity = 0.06 + s1 * 0.05 - s3 * 0.05;

        ringSet.children.forEach((r, i) => { r.rotation.z += r.userData.spin * dt * 6; });
        ringSet2.children.forEach((r) => { r.rotation.z -= r.userData.spin * dt * 5; });
        ringSet.scale.setScalar(1 + s1 * 0.5 - s4 * 0.3);
        ringSet2.scale.setScalar(1 + s2 * 0.4 - s4 * 0.25);
        ringSet.children.forEach((r) => (r.material.opacity = Math.max(0, (0.3 - r.material.opacity * 0) * (1 - s4) * 0.9)));

        dust.rotation.y = t * 0.012;

        // Stage 4 → 5: cards resolve out of the network
        cards.forEach((c, i) => {
          const d = c.userData;
          c.material.opacity = s4 * (1 - s5 * 0.85);
          c.position.x = lerp(st.mx * 0.4, d.x * (1 + s5 * 0.3), s4);
          c.position.y = lerp(0, d.y, s4) + Math.sin(t * 0.7 + i) * 0.08;
          c.position.z = lerp(0, d.z, s4) + s5 * 2.2;
          c.rotation.y = -st.mx * 0.18 + s4 * (i ? -0.3 : 0.3) + s5 * (i ? -0.5 : 0.4);
          c.rotation.x = st.my * 0.12;
        });

        glow.material.opacity = 0.34 * (1 - s5);
        glow.scale.setScalar(9.5 + s1 * 3 - s5 * 5);
        glow2.position.set(st.mx * 1.4, st.my * 0.9, 0);

        // camera drift + exit push
        camera.position.x = lerp(camera.position.x, st.mx * 0.5, 0.06);
        camera.position.y = lerp(camera.position.y, 0.25 + st.my * 0.35, 0.06);
        camera.position.z = 7.4 - s1 * 0.5 + s3 * 0.4 + s5 * 3.4;
        camera.lookAt(0, 0, 0);
      },
    };
  });

  /* ============================================================
     STRUCTURE — disciplines: one structure, parts separate/reconnect
     ============================================================ */
  R('structure', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    const root = new THREE.Group();
    scene.add(root);

    const parts = [];
    const palette = [cyan, violet, magenta, 0x9fe8ff];
    for (let i = 0; i < 4; i++) {
      const g = new THREE.Group();
      const shell = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.85, 1),
        new THREE.MeshBasicMaterial({
          color: palette[i], transparent: true, opacity: 0.14,
          wireframe: true, depthWrite: false, blending: THREE.AdditiveBlending,
        })
      );
      const pts = basic(140, shellPoints(140, 0.9), { size: 0.05, opacity: 0.75 });
      const ring = rings(palette[i], 1, 1.05);
      g.add(shell, pts, ring);
      const ang = (i / 4) * Math.PI * 2;
      g.userData = {
        home: new THREE.Vector3(Math.cos(ang) * 1.5, Math.sin(ang * 1.3) * 0.7, Math.sin(ang) * 1.0),
        ang, shell, pts, ring,
      };
      parts.push(g);
      root.add(g);
    }

    const core = basic(200, shellPoints(200, 0.75), { size: 0.06, opacity: 0.9 });
    root.add(core, glowSprite(4.2, cyan, 0.3));

    const st = { mx: 0 };
    return {
      scene, camera,
      update(t, p, dt, m) {
        st.mx = lerp(st.mx, m.mx, 0.05);
        root.rotation.y = t * 0.09 + st.mx * 0.5;
        root.rotation.x = Math.sin(t * 0.13) * 0.1 - m.my * 0.22;

        // separate around 0.3–0.6, reconnect after
        const sep = Math.sin(clamp((p - 0.22) / 0.55) * Math.PI);
        parts.forEach((g, i) => {
          const d = g.userData;
          const k = 1 + sep * 1.35;
          g.position.set(d.home.x * k, d.home.y * k, d.home.z * k);
          g.rotation.y = t * (0.2 + i * 0.06) * (1 + sep);
          g.rotation.x = t * 0.1;
          d.shell.material.opacity = 0.1 + sep * 0.18;
          d.pts.material.opacity = 0.6 + sep * 0.4;
          d.ring.children[0].material.opacity = 0.22 + sep * 0.3;
        });
        const cs = 1 + sep * 0.5;
        core.scale.setScalar(cs);
        core.rotation.y = -t * 0.14;
      },
    };
  });

  /* ============================================================
     EGAN — desktop + phone with layered interface parallax
     ============================================================ */
  R('egan', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 7);
    camera.lookAt(0, 0, 0);

    const root = new THREE.Group();
    scene.add(root);

    const mk = (tex, w, h) => {
      const geo = new THREE.PlaneGeometry(w, h);
      const m = new THREE.MeshBasicMaterial({
        map: tex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide,
      });
      return new THREE.Mesh(geo, m);
    };

    const desk = mk(uiTexture('desk'), 4.1, 2.6);
    desk.position.set(-1.0, 0.1, 0);
    const phone = mk(uiTexture('phone'), 1.55, 3.1);
    phone.position.set(2.35, -0.15, 0.7);

    const backPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(5.6, 3.6),
      new THREE.MeshBasicMaterial({ color: cyan, transparent: true, opacity: 0.035, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    backPlate.position.set(-0.4, 0, -1.1);

    const net = graph(70, 3.4, 0.85, 0.62, [cyan, violet, 0xbfe9ff]);
    net.group.position.set(0.4, 0, -1.6);

    const dust = basic(700, cloud(700, 4, 10, 1), { size: 0.045, opacity: 0.45 });
    root.add(backPlate, desk, phone, net.group, dust);
    root.add(glowSprite(8, cyan, 0.22));

    const st = { mx: 0, my: 0 };
    return {
      scene, camera,
      update(t, p, dt, m) {
        st.mx = lerp(st.mx, m.mx, 0.06);
        st.my = lerp(st.my, m.my, 0.06);

        const inView = clamp((p - 0.1) / 0.28);
        const out = clamp((p - 0.72) / 0.26);
        const vis = inView * (1 - out);

        root.rotation.y = st.mx * 0.22 + (1 - out) * 0.06;
        root.rotation.x = -st.my * 0.12;

        desk.material.opacity = vis;
        phone.material.opacity = vis;
        backPlate.material.opacity = vis * 0.35;
        net.points.material.opacity = vis * 0.85;
        net.lines.material.opacity = vis * 0.2;

        // independent layer parallax
        desk.position.x = -1.0 + st.mx * 0.42;
        desk.position.y = 0.1 + st.my * 0.22 + Math.sin(t * 0.5) * 0.06;
        desk.rotation.y = st.mx * 0.16;
        desk.rotation.x = -st.my * 0.1;

        phone.position.x = 2.35 + st.mx * 0.14 + out * 1.6;
        phone.position.y = -0.15 + st.my * 0.38 + Math.sin(t * 0.6 + 1) * 0.09;
        phone.position.z = 0.7 + st.mx * 0.2;
        phone.rotation.y = -0.22 + st.mx * 0.3;
        phone.rotation.z = -0.03 + st.mx * 0.04;

        backPlate.position.x = -0.4 + st.mx * 0.2;
        net.group.rotation.y = t * 0.06 - st.mx * 0.2;
        dust.rotation.y = t * 0.014;

        // dissolve to particles on exit
        const sc = 1 - out * 0.25;
        root.scale.setScalar(sc);
      },
    };
  });

  /* ============================================================
     MORPH — EGAN particle stream → Callesense network
     ============================================================ */
  R('morph', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 5.6;

    const N = 900;
    const wide = new Float32Array(N * 3);   // EGAN-ish: flat layered band
    const ring = new Float32Array(N * 3);   // Callesense-ish: ring network
    for (let i = 0; i < N; i++) {
      wide[i * 3] = rand(-3.6, 3.6);
      wide[i * 3 + 1] = rand(-1.1, 1.1);
      wide[i * 3 + 2] = rand(-0.6, 0.6);

      const a = (i / N) * Math.PI * 2;
      const r = 2.1 + Math.sin(a * 5) * 0.22;
      ring[i * 3] = Math.cos(a) * r;
      ring[i * 3 + 1] = Math.sin(a) * r;
      ring[i * 3 + 2] = Math.sin(a * 3) * 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(wide.slice(), 3));
    const col = new Float32Array(N * 3);
    const c = new THREE.Color();
    for (let i = 0; i < N; i++) {
      c.setHex(i % 3 === 0 ? cyan : i % 3 === 1 ? violet : magenta);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));

    const pts = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.085, map: dotTexture(), vertexColors: true, transparent: true,
      opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    scene.add(pts, glowSprite(6, violet, 0.28));

    // ring edges materialise for the Callesense side
    const lp = [];
    for (let i = 0; i < N; i += 3) {
      const j = (i + 7) % N;
      lp.push(ring[i * 3], ring[i * 3 + 1], ring[i * 3 + 2], ring[j * 3], ring[j * 3 + 1], ring[j * 3 + 2]);
    }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
    const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({
      color: violet, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    scene.add(lines);

    const cur = wide.slice();
    return {
      scene, camera,
      update(t, p, dt, m) {
        const t01 = clamp((p - 0.06) / 0.72);
        const e = t01 * t01 * (3 - 2 * t01);
        const arr = geo.attributes.position.array;
        // swirl during transit
        const swirl = Math.sin(t01 * Math.PI) * 0.7;
        for (let i = 0; i < N; i++) {
          const i3 = i * 3;
          const x = lerp(wide[i3], ring[i3], e);
          const y = lerp(wide[i3 + 1], ring[i3 + 1], e);
          const z = lerp(wide[i3 + 2], ring[i3 + 2], e);
          const ca = Math.cos(swirl * 0.6), sa = Math.sin(swirl * 0.6);
          arr[i3] = x * ca - y * sa;
          arr[i3 + 1] = x * sa + y * ca;
          arr[i3 + 2] = z + swirl * 0.5;
        }
        geo.attributes.position.needsUpdate = true;

        const fade = Math.sin(clamp(p / 0.16) * Math.PI * 0.5) * (1 - clamp((p - 0.86) / 0.14));
        pts.material.opacity = 0.95 * fade;
        lines.material.opacity = clamp((e - 0.55) / 0.45) * 0.32 * fade;

        pts.rotation.y = t * 0.05 + m.mx * 0.22;
        pts.rotation.x = -m.my * 0.16;
        lines.rotation.copy(pts.rotation);
      },
    };
  });

  /* ============================================================
     CALLESENSE — incoming call interface + signal network
     ============================================================ */
  R('call', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 7);

    const root = new THREE.Group();
    scene.add(root);

    const phone = new THREE.Mesh(
      new THREE.PlaneGeometry(1.7, 3.4),
      new THREE.MeshBasicMaterial({ map: uiTexture('call'), transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })
    );
    phone.position.set(-0.5, 0, 0.6);

    const net = graph(84, 3.2, 0.9, 0.66, [violet, magenta, cyan]);
    net.group.position.set(1.5, 0, -1.4);

    // pulse rings emanating from the phone
    const pulses = [];
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(
        new THREE.RingGeometry(1, 1.014, 96),
        new THREE.MeshBasicMaterial({ color: violet, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })
      );
      m.userData.off = i / 3;
      pulses.push(m);
      root.add(m);
    }

    const dust = basic(600, cloud(600, 4, 10, 1), { size: 0.045, opacity: 0.4 });
    root.add(dust, glowSprite(8, violet, 0.24));
    root.add(phone, net.group);

    const st = { mx: 0, my: 0 };
    return {
      scene, camera,
      update(t, p, dt, m) {
        st.mx = lerp(st.mx, m.mx, 0.06);
        st.my = lerp(st.my, m.my, 0.06);

        const inView = clamp((p - 0.1) / 0.28);
        const vis = inView;
        root.rotation.y = st.mx * 0.24;
        root.rotation.x = -st.my * 0.12;

        phone.material.opacity = vis;
        phone.position.x = -0.5 + st.mx * 0.3;
        phone.position.y = st.my * 0.34 + Math.sin(t * 0.55) * 0.08;
        phone.rotation.y = 0.24 + st.mx * 0.28;
        phone.rotation.z = 0.03 - st.mx * 0.04;

        net.points.material.opacity = vis * 0.9;
        net.lines.material.opacity = vis * 0.24;
        net.group.rotation.y = -t * 0.07 - st.mx * 0.24;

        pulses.forEach((pu) => {
          const k = (t * 0.35 + pu.userData.off) % 1;
          const s = 0.6 + k * 3.4;
          pu.scale.setScalar(s);
          pu.position.set(phone.position.x, phone.position.y, 0.5);
          pu.material.opacity = vis * (1 - k) * 0.4;
        });

        dust.rotation.y = -t * 0.012;
      },
    };
  });

  /* ============================================================
     TECH — central core + 8 orbiting capability nodes
     ============================================================ */
  R('tech', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 8.4);

    const root = new THREE.Group();
    scene.add(root);

    const POS = TECH_POS;
    const nodePts = [];
    const nodeGeo = new THREE.SphereGeometry(0.085, 12, 12);
    const palette = [cyan, violet, magenta, 0x9fe8ff];
    POS.forEach(([px, py], i) => {
      const c = palette[i % palette.length];
      const m = new THREE.Mesh(nodeGeo, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.9 }));
      m.position.set(px, py, 0);
      nodePts.push(m);
      root.add(m);
      const halo = glowSprite(1.1, c, 0.22);
      halo.position.set(px, py, 0);
      root.add(halo);
    });

    const core = basic(420, shellPoints(420, 1.25), { size: 0.055, opacity: 0.85 });
    root.add(core);

    // connection lines core → nodes
    const lp = [];
    POS.forEach((p) => {
      const len = Math.hypot(p[0], p[1]);
      lp.push(0, 0, 0, p[0] * (1 - 0.1 / len), p[1] * (1 - 0.1 / len), 0);
    });
    // plus a rim
    const RIM = 20;
    for (let i = 0; i < RIM; i++) {
      const a1 = (i / RIM) * Math.PI * 2, a2 = ((i + 1) / RIM) * Math.PI * 2;
      lp.push(Math.cos(a1) * 3.4, Math.sin(a1) * 2.9, 0, Math.cos(a2) * 3.4, Math.sin(a2) * 2.9, 0);
    }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
    const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({
      color: cyan, transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    root.add(lines);

    const dust = basic(420, cloud(420, 4, 9, 1), { size: 0.04, opacity: 0.4 });
    root.add(dust);

    return {
      scene, camera,
      update(t, p, dt, m) {
        const vis = clamp(p / 0.2);
        root.scale.x = techLayout(m.aspect).sx;
        root.rotation.y = m.mx * 0.16;
        root.rotation.x = -m.my * 0.1;
        root.rotation.z = Math.sin(t * 0.1) * 0.02;

        // gentle individual drift, preserving the shared shape
        nodePts.forEach((n, i) => {
          const hp = POS[i];
          n.position.x = hp[0] + Math.sin(t * 0.5 + i) * 0.16;
          n.position.y = hp[1] + Math.cos(t * 0.42 + i * 1.4) * 0.16;
          n.material.opacity = 0.5 + vis * 0.45;
        });
        core.rotation.y = t * 0.14;
        core.rotation.x = -t * 0.07;
        core.material.opacity = 0.5 + vis * 0.35;
        lines.material.opacity = 0.12 + vis * 0.22 * (0.85 + Math.sin(t * 0.8) * 0.15);
        dust.rotation.y = t * 0.02;

        // publish projected node positions so the DOM labels sit exactly on them
        root.updateMatrixWorld();
        nodePts.forEach((n, i) => {
          const v = n.position.clone().applyMatrix4(root.matrixWorld).project(camera);
          techLive.pts[i] = [(v.x * 0.5 + 0.5) * 100, (-v.y * 0.5 + 0.5) * 100];
        });
      },
    };
  });

  /* ============================================================
     NETWORK — formless cloud resolving into the ecosystem shape
     ============================================================ */
  R('network', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.4, 8.6);

    const root = new THREE.Group();
    scene.add(root);

    const N = 230;
    const loose = cloud(N, 3.2, 7.2, 1);
    const shaped = new Float32Array(N * 3);
    // ecosystem shape: three interlocking rings (abstract, not a logo)
    for (let i = 0; i < N; i++) {
      const which = i % 3;
      const a = (i / N) * Math.PI * 2 * 6;
      const r = 2.5 + Math.sin(a * 2 + which) * 0.35;
      const off = (which - 1) * 1.7;
      const tilt = which * 0.5;
      const x = Math.cos(a) * r + off;
      const y = Math.sin(a) * r * 0.72;
      shaped[i * 3] = x * Math.cos(tilt) - 0.2 * Math.sin(tilt);
      shaped[i * 3 + 1] = y;
      shaped[i * 3 + 2] = Math.sin(a) * 0.9 + off * 0.35;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(loose, 3));
    const col = new Float32Array(N * 3);
    const c = new THREE.Color();
    for (let i = 0; i < N; i++) {
      c.setHex(i % 3 === 0 ? cyan : i % 3 === 1 ? violet : magenta);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.11, map: dotTexture(), vertexColors: true, transparent: true,
      opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending,
    }));

    // edges built from the formed shape
    const lp = [];
    for (let i = 0; i < N; i++) {
      for (let k = 1; k <= 2; k++) {
        const j = (i + k * 3) % N;
        const dx = shaped[i * 3] - shaped[j * 3];
        const dy = shaped[i * 3 + 1] - shaped[j * 3 + 1];
        const dz = shaped[i * 3 + 2] - shaped[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < 3.6) {
          lp.push(shaped[i * 3], shaped[i * 3 + 1], shaped[i * 3 + 2], shaped[j * 3], shaped[j * 3 + 1], shaped[j * 3 + 2]);
        }
      }
    }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
    const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({
      color: cyan, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending,
    }));

    root.add(pts, lines, glowSprite(11, violet, 0.2));
    const dust = basic(900, cloud(900, 8, 16, 1), { size: 0.05, opacity: 0.45 });
    root.add(dust);

    return {
      scene, camera,
      update(t, p, dt, m) {
        const f = clamp((p - 0.12) / 0.62);
        const e = f * f * (3 - 2 * f);
        const arr = geo.attributes.position.array;
        for (let i = 0; i < N * 3; i++) {
          arr[i] = lerp(loose[i], shaped[i], e);
        }
        geo.attributes.position.needsUpdate = true;

        pts.material.size = 0.09 + e * 0.05;
        lines.material.opacity = e * 0.2;
        root.rotation.y = t * 0.05 + m.mx * 0.3;
        root.rotation.x = -m.my * 0.18;
        root.scale.setScalar(0.85 + e * 0.2);
        dust.rotation.y = -t * 0.015;
      },
    };
  });

  /* ============================================================
     HORIZON — digital landscape, drives the dark→light transition
     ============================================================ */
  R('horizon', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 240);
    camera.position.set(0, 2.6, 15);

    const grid = new THREE.GridHelper(160, 96, 0x5fe3ff, 0x243055);
    grid.material.transparent = true;
    grid.material.opacity = 0.35;
    grid.material.depthWrite = false;
    grid.material.blending = THREE.AdditiveBlending;
    grid.position.y = -5.6;
    scene.add(grid);

    const grid2 = new THREE.GridHelper(200, 60, 0x8b7bff, 0x2a2160);
    grid2.material.transparent = true;
    grid2.material.opacity = 0.18;
    grid2.material.depthWrite = false;
    grid2.material.blending = THREE.AdditiveBlending;
    grid2.position.y = -3.2;
    scene.add(grid2);

    const stars = basic(1200, cloud(1200, 20, 90, 0.55), { size: 0.35, opacity: 0.6, attenuation: true });
    scene.add(stars);

    const sun = glowSprite(26, cyan, 0.3);
    sun.position.set(0, 1.2, -46);
    scene.add(sun);

    const pillars = [];
    for (let i = 0; i < 26; i++) {
      const h = rand(1.3, 6);
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(rand(0.12, 0.3), h, rand(0.12, 0.3)),
        new THREE.MeshBasicMaterial({
          color: i % 4 === 0 ? violet : cyan, transparent: true,
          opacity: 0.28, depthWrite: false, blending: THREE.AdditiveBlending,
        })
      );
      const side = i % 2 ? 1 : -1;
      m.position.set(side * rand(4, 26), -5.6 + h / 2, rand(-58, 4));
      m.userData.pulse = Math.random() * Math.PI * 2;
      pillars.push(m);
      scene.add(m);
    }

    return {
      scene, camera,
      update(t, p, dt, m) {
        grid.position.z = ((t * 1.5) % 1.66);
        grid2.position.z = ((t * 0.8) % 3.33);
        camera.position.x = lerp(camera.position.x, m.mx * 2.4, 0.05);
        camera.position.y = lerp(camera.position.y, 2.6 + m.my * 0.9 + p * 1.6, 0.05);
        camera.position.z = 15 - clamp(p) * 3;
        camera.lookAt(0, -0.6 + p * 2.2, -14);

        pillars.forEach((b) => {
          b.material.opacity = 0.16 + Math.abs(Math.sin(t * 0.6 + b.userData.pulse)) * 0.22;
          b.position.y += Math.sin(t * 0.5 + b.userData.pulse) * dt * 0.12;
        });
        stars.rotation.y = t * 0.006;
        sun.material.opacity = 0.3 - clamp(p) * 0.12;
      },
    };
  });

  /* ============================================================
     CONTACT — closing field, reacts to the CTA
     ============================================================ */
  R('contact', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    const root = new THREE.Group();
    scene.add(root);

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.5, 2),
      new THREE.MeshBasicMaterial({
        color: 0xbcd8ff, transparent: true, opacity: 0.1,
        wireframe: true, depthWrite: false, blending: THREE.AdditiveBlending,
      })
    );
    const pts = basic(500, shellPoints(500, 2.55), { size: 0.06, opacity: 0.85 });
    const ringSet = rings(violet, 3, 3.1);
    const dust = basic(800, cloud(800, 5, 12, 1), { size: 0.05, opacity: 0.45 });

    root.add(shell, pts, ringSet, dust, glowSprite(12, violet, 0.26));

    const st = { mx: 0, my: 0, boost: 0 };
    return {
      scene, camera,
      update(t, p, dt, m) {
        st.mx = lerp(st.mx, m.mx, 0.05);
        st.my = lerp(st.my, m.my, 0.05);
        const vis = clamp((p - 0.04) / 0.3);
        const boost = m.ctaBoost || 0;
        st.boost = lerp(st.boost, boost, 0.08);

        root.rotation.y = t * 0.06 + st.mx * 0.34;
        root.rotation.x = -st.my * 0.2;
        root.scale.setScalar((0.82 + vis * 0.18) * (1 + st.boost * 0.07));

        shell.material.opacity = (0.06 + vis * 0.08) * (1 + st.boost * 1.6);
        pts.material.opacity = vis * 0.75;
        pts.material.size = 0.05 + st.boost * 0.03;
        shell.rotation.y = -t * 0.09;
        pts.rotation.y = t * 0.11;
        ringSet.children.forEach((r, i) => {
          r.rotation.z += r.userData.spin * dt * 7;
          r.material.opacity = vis * (0.16 - i * 0.03) * (1 + st.boost * 2);
        });
        dust.material.opacity = 0.3 + st.boost * 0.4;
        dust.rotation.y = t * 0.01;
      },
    };
  });
}