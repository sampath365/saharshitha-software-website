# Saharshitha Software — corporate website

Premium 3D corporate site for **Saharshitha Software** (the company site, not the EGAN or
Callesense product sites). Built as a static site with a single WebGL context shared by every
3D section.

## Commands

```bash
npm install
npm run dev                       # local dev server
npm run build                     # production bundle -> dist/
npm run preview                   # serve dist/ on 0.0.0.0:12000
```

## Architecture

```
index.html            full page markup, all sections
src/main.js           entry: loader, smooth scroll, nav, cursor, reveals, tilt, scene boot
src/styles/base.css   design tokens, nav, buttons, cursor, loader, footer
src/styles/sections.css  per-section layout + responsive rules
src/webgl/engine.js   WebGL engine, shared procedural textures, multi-scene helpers
src/webgl/scenes.js   the nine scenes
```

### One renderer, one canvas, many scenes

`createEngine()` appends a **single** fixed full-viewport WebGL canvas. Each `[data-scene]`
element in the markup is a placeholder whose bounding rect is used to scissor-render that
scene's viewport into the right part of the page. Consequences worth knowing before editing:

- A section that wants a *pinned* 3D viewport styles its placeholder canvas as
  `position: sticky; top: 0; height: 100vh; margin-bottom: -100vh` and gives its content
  `z-index` above it. See `.hero__pin` and the `.gl` rules in `sections.css`.
- The engine sets each scene's `camera.aspect` from the *placeholder element's* box, so a
  scene is framed to its own box rather than the window.
- Scenes are layered above `body` but below page content; `pointer-events` is `none` on the
  canvas, so all interaction is handled in the DOM.
- Placeholder canvases are hidden (`visibility: hidden`) and are never drawn into.

### Tech section: 3D nodes with DOM labels

The technology nodes are real 3D objects (`TECH_POS` in `scenes.js`). Each frame the scene
projects them and publishes screen-space percentages to `techLive.pts`; `initTechNodes()` in
`main.js` writes those into the DOM labels. `techLayout(aspect)` provides the analytic
fallback used before the first projected frame and on resize. Keep `TECH_POS` as the single
source of truth for node positions.

### Reveals

`initReveals()` and `initSplits()` use `IntersectionObserver` **plus** a scroll sweep. The
sweep matters: a fast scroll can carry an element past the viewport between observer
deliveries, which would otherwise leave it invisible at `opacity: 0` forever.

### Accessibility and fallbacks

- `prefers-reduced-motion` disables the loader animation, smooth scroll, tilt, magnetic
  buttons, cursor, and the long pinned scroll distances.
- If WebGL is unavailable the engine returns `null`, `html.no-webgl` hides the placeholder
  canvases, and the page renders as a normal document.

## Deployment

The site is a static bundle, so it can be hosted anywhere that serves `dist/`.
`vite.config.js` sets `base: './'`, so the build works from a domain root or a
sub-path (such as a GitHub Pages project site at `/<repo>/`).

### GitHub Pages

`.github/workflows/deploy-pages.yml` builds on every push to `main` and deploys
`dist/` to Pages. It runs `actions/configure-pages` with `enablement: true`, so
the Pages site is created on the first run.

This requires Pages to be enabled for the repository first. If the workflow
fails at `configure-pages` with "Resource not accessible by integration", turn
Pages on once by hand and re-run the workflow:

> Repository → Settings → Pages → Source: **GitHub Actions**

After that the site is published at
`https://<owner>.github.io/<repo>/` and redeploys on every push.

### Other hosts

Any static host works: build command `npm run build`, output directory `dist`.

## Placeholders to replace before launch

Search for `TODO` in `index.html`:

- EGAN and Callesense `Explore ...` CTAs and footer product links currently point at `#` and
  need the real product site URLs.
- The contact CTA points at `#`; wire it to a `mailto:` or a form endpoint.
- Privacy, Terms, and Cookies links need real pages.
- Careers intentionally lists no openings, and Insights cards are theme descriptions rather
  than dated announcements — both by design.