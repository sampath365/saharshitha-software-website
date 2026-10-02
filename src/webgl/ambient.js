import * as THREE from 'three';
import { PAL, rand, lerp, clamp, dotTexture, glowTexture } from './engine.js';

const { cyan, violet, magenta } = PAL;

function trail(color, count, spread, len) {
  const a = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = i / count;
    a[i * 3] = -t * len + rand(-spread, spread) * t;
    a[i * 3 + 1] = rand(-spread, spread) * t;
    a[i * 3 + 2] = rand(-spread, spread) * t;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(a, 3));
  const m = new THREE.PointsMaterial({
    color, size: 0.13, map: dotTexture(), transparent: true,
    opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(g, m);
}

function glow(scale, color, opacity) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(), color, transparent: true, opacity,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  s.scale.set(scale, scale, 1);
  return s;
}

/** Low-poly vehicle: a body with swept wings, nose forward along +x. */
function buildCar(color) {
  const g = new THREE.Group();
  const mat = (c, o = 0.55) => new THREE.MeshBasicMaterial({
    color: c, transparent: true, opacity: o,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.62, 4), mat(color, 0.7));
  body.rotation.z = -Math.PI / 2;
  const wing = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.46, 0.02), mat(color, 0.45));
  wing.position.set(-0.06, 0, 0);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.02), mat(color, 0.45));
  tail.position.set(-0.28, 0.11, 0);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.24), mat(color, 0.4));
  fin.position.set(-0.28, 0.02, 0);
  g.add(body, wing, tail, fin);
  return g;
}

/** Rocket: nose cone, cylindrical body, fins, engine glow. */
function buildRocket(color) {
  const g = new THREE.Group();
  const mat = (c, o = 0.6) => new THREE.MeshBasicMaterial({
    color: c, transparent: true, opacity: o,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.4, 12), mat(0xdff6ff, 0.8));
  nose.position.y = 0.62;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.85, 12), mat(color, 0.5));
  body.position.y = 0.02;
  const fins = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.3, 0.22), mat(color, 0.55));
    f.position.set(0, -0.3, 0.2);
    const pivot = new THREE.Group();
    pivot.rotation.y = (i / 3) * Math.PI * 2;
    pivot.add(f);
    fins.add(pivot);
  }
  const engine = glow(1.5, cyan, 0.85);
  engine.position.y = -0.5;
  g.add(nose, body, fins, engine);
  g.userData.engine = engine;
  return g;
}

/**
 * Two ambient animations that run across the whole page:
 *   - a vehicle flying past the edges with a light trail
 *   - a rocket launching, periodic, with exhaust
 * Both stay behind content and never intercept pointer events.
 */
export function registerAmbient(engine) {
  // One fixed, full-viewport scene driven by its own scroll progress so the
  // vehicles can travel the length of the page.
  engine.registerAmbient(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    camera.position.set(0, 0, 14);

    const root = new THREE.Group();
    scene.add(root);

    const dust = (() => {
      const n = 700;
      const a = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        a[i * 3] = rand(-22, 22);
        a[i * 3 + 1] = rand(-14, 14);
        a[i * 3 + 2] = rand(-16, 4);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(a, 3));
      return new THREE.Points(g, new THREE.PointsMaterial({
        color: 0x9fe8ff, size: 0.07, map: dotTexture(), transparent: true,
        opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending,
      }));
    })();
    root.add(dust);

    // --- vehicle ---
    const car = buildCar(cyan);
    const carTrail = trail(cyan, 90, 0.1, 5.5);
    car.add(carTrail);
    car.add(glow(1.8, cyan, 0.5));
    root.add(car);

    // --- rocket ---
    const rocket = buildRocket(violet);
    const rocketTrail = trail(magenta, 160, 0.16, 8);
    rocket.add(rocketTrail);
    root.add(rocket);

    return {
      scene, camera,
      update(t, p, dt, m) {
        // aspect is only known once the frame runs, so derive the frustum here
        camera.aspect = m.aspect;
        camera.updateProjectionMatrix();
        const halfH = Math.tan((45 / 2) * Math.PI / 180) * 14;
        const halfW = halfH * m.aspect;

        // vehicle crosses on a repeating loop, drifting vertically with the mouse
        const period = 11;
        const phase = (t % period) / period;
        const dir = Math.floor(t / period) % 2 === 0 ? 1 : -1;
        const x = dir * (halfW + 4) - dir * phase * (halfW * 2 + 8);
        const y = Math.sin(phase * Math.PI) * 2.2 - 1.2 + m.my * 1.4;
        car.position.set(x, y, -3 + Math.sin(t * 0.4) * 0.4);
        car.rotation.z = dir > 0
          ? Math.sin(phase * Math.PI) * 0.2
          : Math.PI - Math.sin(phase * Math.PI) * 0.2;
        carTrail.material.opacity = 0.75 * Math.sin(phase * Math.PI);
        carTrail.scale.setScalar(1 + phase * 0.5);

        // rocket launches periodically, climbing and fading out
        const rPeriod = 17;
        const rp = (t % rPeriod) / rPeriod;
        const live = rp < 0.55;
        const k = clamp(rp / 0.55);
        rocket.visible = live;
        if (live) {
          const e = k * k;
          rocket.position.set(
            -halfW * 0.55 + m.mx * 1.6,
            -halfH * 1.25 + e * (halfH * 2.8),
            -6
          );
          rocket.rotation.z = -0.22 - m.mx * 0.12;
          const fade = Math.sin(k * Math.PI);
          rocketTrail.material.opacity = 0.8 * fade;
          rocketTrail.scale.setScalar(0.6 + e * 1.5);
          if (rocket.userData.engine) rocket.userData.engine.material.opacity = 0.9 * fade;
          rocket.children.forEach((c) => {
            if (c.material && c.material !== rocketTrail.material) c.material.opacity = (c.material.opacity || 0.6);
          });
        }

        dust.rotation.z = t * 0.008;
      },
    };
  });
}