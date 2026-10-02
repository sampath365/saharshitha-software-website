import * as THREE from 'three';
import { PAL, rand, lerp, clamp, dotTexture, glowTexture, uiTexture } from './engine.js';

const { cyan, violet, magenta } = PAL;

/**
 * One 3D scene per product, rendered into the product page's stage element.
 * Deliberately lighter than the home-page scenes: a single device or core with
 * a particle field, so it reads as a product view rather than a hero.
 */
export function registerProductScene(engine, productId) {
  engine.register('pd', ({ THREE: T, el }) => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 7);

    const root = new T.Group();
    scene.add(root);

    const dust = () => {
      const n = 520;
      const a = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const r = rand(3.2, 8), th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        a[i * 3] = r * Math.sin(ph) * Math.cos(th);
        a[i * 3 + 1] = r * Math.cos(ph);
        a[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
      }
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(a, 3));
      return new T.Points(g, new T.PointsMaterial({
        color: cyan, size: 0.05, map: dotTexture(), transparent: true,
        opacity: 0.45, depthWrite: false, blending: T.AdditiveBlending,
      }));
    };

    const halo = (scale, color, opacity) => {
      const s = new T.Sprite(new T.SpriteMaterial({
        map: glowTexture(), color, transparent: true, opacity,
        depthWrite: false, blending: T.AdditiveBlending,
      }));
      s.scale.set(scale, scale, 1);
      return s;
    };

    const mesh = (w, h, tex) => new T.Mesh(
      new T.PlaneGeometry(w, h),
      new T.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.95, depthWrite: false, side: T.DoubleSide })
    );

    const rings = (color, count, r0) => {
      const g = new T.Group();
      for (let i = 0; i < count; i++) {
        const r = r0 + i * 0.3;
        const m = new T.Mesh(
          new T.RingGeometry(r, r + 0.007, 128),
          new T.MeshBasicMaterial({
            color, transparent: true, opacity: 0.26 - i * 0.05,
            side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending,
          })
        );
        m.rotation.x = Math.PI / 2 + (i % 2 ? 0.2 : -0.14);
        m.userData.spin = (i % 2 ? 1 : -1) * 0.05;
        g.add(m);
      }
      return g;
    };

    // per-product composition
    const parts = { dust: dust() };
    root.add(parts.dust);

    if (productId === 'egan') {
      parts.desktop = mesh(4.3, 2.7, uiTexture('desk'));
      parts.desktop.position.set(-0.35, 0.15, 0);
      parts.phone = mesh(1.5, 3, uiTexture('phone'));
      parts.phone.position.set(2.25, -0.2, 0.7);
      parts.rings = rings(violet, 3, 2.6);
      parts.rings.rotation.x = 0.5;
      root.add(parts.desktop, parts.phone, parts.rings, halo(9, cyan, 0.24));
    } else if (productId === 'clinic') {
      parts.phone = mesh(1.9, 3.8, uiTexture('phone'));
      parts.phone.position.set(0, 0, 0.5);
      parts.rings = rings(cyan, 4, 2.2);
      root.add(parts.phone, parts.rings, halo(7.5, cyan, 0.26));
    } else if (productId === 'service') {
      parts.desktop = mesh(4.4, 2.8, uiTexture('desk'));
      parts.desktop.position.set(0, 0.1, 0);
      parts.rings = rings(violet, 4, 2.4);
      parts.rings.rotation.x = 0.62;
      root.add(parts.desktop, parts.rings, halo(9, violet, 0.26));
    } else if (productId === 'hospital') {
      parts.desktop = mesh(4.2, 2.65, uiTexture('desk'));
      parts.desktop.position.set(-0.6, 0.1, 0);
      parts.phone = mesh(1.4, 2.8, uiTexture('call'));
      parts.phone.position.set(2.1, -0.1, 0.6);
      parts.rings = rings(violet, 3, 2.7);
      root.add(parts.desktop, parts.phone, parts.rings, halo(9, violet, 0.24));
    } else {
      // school
      parts.desktop = mesh(4.2, 2.65, uiTexture('desk'));
      parts.desktop.position.set(0.5, 0.1, 0);
      parts.phone = mesh(1.4, 2.8, uiTexture('phone'));
      parts.phone.position.set(-2.15, -0.1, 0.6);
      parts.rings = rings(cyan, 3, 2.7);
      root.add(parts.desktop, parts.phone, parts.rings, halo(9, cyan, 0.24));
    }

    const st = { mx: 0, my: 0 };
    return {
      scene, camera,
      update(t, p, dt, m) {
        st.mx = lerp(st.mx, m.mx, 0.06);
        st.my = lerp(st.my, m.my, 0.06);
        root.rotation.y = st.mx * 0.24;
        root.rotation.x = -st.my * 0.14;

        const bob = Math.sin(t * 0.6) * 0.07;
        if (parts.desktop) {
          parts.desktop.position.x = parts.desktop.position.x * 0.98 + st.mx * 0.02;
          parts.desktop.position.y = (productId === 'egan' ? 0.15 : 0.1) + st.my * 0.16 + bob;
          parts.desktop.rotation.y = st.mx * 0.16;
          parts.desktop.rotation.x = -st.my * 0.1;
        }
        if (parts.phone) {
          parts.phone.position.y = (productId === 'clinic' ? 0 : -0.15) + st.my * 0.3 + Math.sin(t * 0.7 + 1) * 0.1;
          parts.phone.rotation.y = -0.2 + st.mx * 0.3;
          parts.phone.rotation.z = -0.02 + st.mx * 0.04;
        }
        if (parts.rings) {
          parts.rings.rotation.z += dt * 0.22;
          parts.rings.children.forEach((r) => { r.rotation.z += r.userData.spin * dt * 5; });
        }
        parts.dust.rotation.y = t * 0.02;
      },
    };
  });
}