# Sticker Editor: Tech Stack

A layer-based sticker editor. Users add any images or stickers as layers, edit each layer (transform, cut, erase, effects), add text, shapes, and drawings, then merge everything into one sticker and export it.

---

## 1. Principles

- **Web first, mobile later.** Build a responsive website (PWA), then wrap it for app stores.
- **Process in the browser.** Editing, background removal, and export all run on the user's device. This keeps costs near zero and keeps photos private.
- **Non-destructive editing.** Cuts, erasing, and effects are stored as instructions on each layer, not baked into pixels, so users can change or undo them later.
- **Backend only when needed.** Accounts, saved projects, and sharing come after the editor works.

---

## 2. Core stack (editor MVP)

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript | Catches bugs early, great with AI coding tools |
| Framework | React + Vite | Fast dev server, huge ecosystem |
| Styling | Tailwind CSS | Quick, consistent UI |
| State | Zustand | Small and simple; works well for layers and undo/redo |
| Canvas | Konva.js (react-konva) | Layers, groups, transforms, blend modes, filters, shadows, text, export |
| Path smoothing | Paper.js | Turns shaky hand-drawn lines into smooth Bezier curves |
| Background removal | @imgly/background-removal | Runs in the browser, no server needed |
| Face detection (optional tool) | MediaPipe Tasks Vision | Smart-crop faces |
| Routing | React Router | Pages |
| Export | Canvas `toBlob` (PNG, WebP) | Transparent output at chat-app sizes |

**Alternative canvas library:** Fabric.js has many editor features built in (groups, filters, free drawing). It is worth a quick comparison before committing. Check each library's current docs.

---

## 3. Editor capabilities and how each is built

| Capability | How |
|---|---|
| Layers (add, reorder, hide, lock, rename, duplicate, group) | Ordered layer list in Zustand, rendered as Konva nodes |
| Move, scale, rotate, flip | Konva Transformer |
| Crop | Crop rectangle stored on the layer |
| Opacity and blend modes | Konva node `opacity` and `globalCompositeOperation` |
| Freehand, lasso, polygon cut | Capture points, smooth with Paper.js, store as a mask operation on the layer |
| Eraser and restore brush | Brush strokes stored as mask operations |
| Magic wand | Flood fill on layer pixels, stored as a bitmap mask |
| Auto background removal | @imgly/background-removal |
| Color adjustments (brightness, contrast, saturation, hue, blur) | Konva filters |
| Drop shadow | Konva shadow properties |
| Outline (per layer and whole sticker) | Silhouette stamping on a canvas |
| Text, curved text | Konva Text and TextPath |
| Shapes | Konva Rect, Circle, Star, Line, Path, and others |
| Drawing brush | Konva Line with stroke settings |
| Snapping guides and alignment | Custom snapping logic during drag |
| Merge down / merge all | Render selected layers to one canvas and replace them with one image layer |
| Undo and redo | Project snapshots (cheap because images are referenced by ID) |
| Save editable project | Project JSON plus image assets |
| Export | Flatten, trim, outline, then PNG or WebP |

---

## 4. Optional backend (Phase 2)

| Need | Choice |
|---|---|
| Auth, database, file storage | Supabase (Postgres, Auth, Storage) |
| Alternative | Node.js + Express, PostgreSQL, and S3 or Cloudflare R2 |
| Image re-encoding (custom server) | sharp |
| Validation (custom server) | Zod |

Features this unlocks: accounts, saved stickers and editable projects, sticker library reuse, sharing links, and sticker packs.

---

## 5. Mobile app (Phase 3)

| Option | When |
|---|---|
| PWA | Fastest; installable from the browser |
| Capacitor | Wrap the web app for Android and iOS with little rewrite |
| React Native or Flutter | Only for deeper native needs; requires rewriting the editor |

---

## 6. Export requirements

Check each platform's current rules before launch.

| Platform | Typical requirement |
|---|---|
| WhatsApp | 512x512 WebP, transparent, small file size |
| Telegram | PNG or WebP, one side 512 px, size limit |
| General | Transparent PNG |

---

## 7. Hosting and tools

- **Frontend hosting:** Vercel, Netlify, or Cloudflare Pages
- **IDE:** Antigravity, Node.js 20+
- **Version control:** Git and GitHub
- **Quality:** ESLint, Prettier, Vitest, Playwright
- **Design (optional):** Figma

---

## 8. Starter install

```bash
npm create vite@latest sticker-editor -- --template react-ts
cd sticker-editor
npm install konva react-konva use-image zustand paper @imgly/background-removal react-router-dom
npm install @mediapipe/tasks-vision
npm install -D tailwindcss vitest
```

---

## 9. Privacy and legal notes

- Photos are processed in the browser and are not uploaded unless the user saves a finished sticker or project.
- Use only artwork you own or have licensed for built-in sticker packs.
- If you add sharing, include a privacy policy, terms (users must have permission to use others' images and faces), a report button, and a takedown contact. Have the legal text reviewed by a person.