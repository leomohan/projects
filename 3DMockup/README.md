# 3D Book Mockup Generator

A lightweight browser-based tool for turning flat book cover art into exportable 3D mockups for social media.

## Features

- Drag-and-drop PNG/JPG cover upload
- Editable `Book Title` and `Author's Name` fields for live spine text
- Live Three.js preview with orbit controls
- Four built-in mockup templates
- Transparent, white, and neutral gradient backgrounds
- Export presets for Instagram posts, reels/shorts, and Facebook posts
- High-resolution PNG export directly in the browser

## Run locally

Because the app uses ES modules, serve the folder over a simple local web server.

### Option 1: Python

```bash
cd /Users/user/Documents/Playground
python3 -m http.server 8000
```

Open `http://localhost:8000`.

### Option 2: Any static server

You can use any static file server that serves the repository root.

## Project structure

```text
/assets
  default-cover.svg
/src
  constants.js
  main.js
  mockups.js
  renderer.js
/templates
  README.md
index.html
styles.css
README.md
```

## How to add a new mockup template

Templates live in `src/mockups.js` and follow a small config pattern.

1. Add a new object to `MOCKUP_TEMPLATES`.
2. Give it a unique `id`, `label`, and `description`.
3. Implement `create(materials, pageMaterial)` and return a `THREE.Group`.
4. Implement `setupCamera(camera)` to frame the new composition.
5. The UI picks it up automatically because the select menu is populated from `MOCKUP_TEMPLATES`.

Example shape:

```js
{
  id: "hero-shot",
  label: "Hero Shot",
  description: "Custom composition.",
  create(materials, pageMaterial) {
    const group = new THREE.Group();
    // Create meshes here.
    return group;
  },
  setupCamera(camera) {
    camera.position.set(0, 0.2, 4.6);
  }
}
```

## Notes

- The first version is fully client-side. No backend is required.
- Three.js is loaded from a CDN import map in `index.html`.
- PNG export uses the live WebGL canvas, so final output matches the preview style and background choice.

## Future extension points

- Animated book rotation
- Batch mockup generation
- Social media preview simulation
