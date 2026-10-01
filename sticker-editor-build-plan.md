# Sticker Editor: Build Plan

A step-by-step roadmap for a layer-based sticker editor.

---

## Goal of the MVP

A user can:

1. Start a new sticker (512x512, transparent)
2. Add several images or stickers as layers
3. Move, scale, rotate, and reorder them
4. Cut away parts with a smooth freehand line, and erase or restore with a brush
5. Add text and shapes
6. Merge everything into one sticker
7. Export a transparent PNG or WebP

Everything else is a later phase.

---

## Phase 0: Setup

- [ ] Install Node.js 20+ and Git
- [ ] Create the Vite project (React + TypeScript), add Tailwind
- [ ] Install dependencies (see the Tech Stack file)
- [ ] Create the GitHub repository and first commit

**Done when:** `npm run dev` shows a blank page with no errors.

---

## Phase 1: Layer foundation

- [ ] Define the project and layer types
- [ ] Zustand store with add, update, delete, reorder, select, and undo/redo (50 steps)
- [ ] Konva canvas on a checkerboard; add images by upload, paste, and drag-and-drop
- [ ] Move, scale, rotate with a Transformer
- [ ] Layers panel: reorder, show/hide, lock, rename, duplicate, delete

**Done when:** you can stack several images and rearrange them with working undo and redo.

---

## Phase 2: Cutting and erasing (non-destructive)

- [ ] Freehand cut tool with Paper.js smoothing, keep-inside and remove-inside modes, feather slider
- [ ] Lasso and polygon cut
- [ ] Eraser and restore brush with size and hardness
- [ ] Render each layer through its list of mask operations; cache the result
- [ ] Mask operations undoable and editable

**Done when:** a shaky hand-drawn loop gives a smooth edge, and the cut can be undone later without losing image quality.

---

## Phase 3: Add content

- [ ] Text layers: font, size, color, stroke, alignment, curved text
- [ ] Shapes: rectangle, circle, star, line, polygon with fill and stroke
- [ ] Drawing brush with color, size, opacity
- [ ] Built-in sticker library (art you own or have licensed)

**Done when:** you can compose a sticker from images, text, shapes, and drawings.

---

## Phase 4: Effects and arrangement

- [ ] Per-layer adjustments: brightness, contrast, saturation, hue, blur
- [ ] Opacity and blend modes
- [ ] Drop shadow, color tint, outline per layer
- [ ] Groups and multi-select
- [ ] Snapping guides, alignment, and distribute tools
- [ ] Zoom and pan; pinch on mobile

**Done when:** effects update live and layers snap neatly into place.

---

## Phase 5: Smart tools

- [ ] One-click background removal per image layer
- [ ] Magic wand with tolerance
- [ ] Optional face crop tool (detect a face and crop around it)
- [ ] Self-host the ML model files

**Done when:** a photo becomes a clean cut-out in a few clicks, with friendly messages when something fails.

---

## Phase 6: Merge and export

- [ ] Merge down, merge selected, merge all
- [ ] Whole-sticker outline with thickness and color
- [ ] Trim empty transparent space (optional)
- [ ] Export PNG and WebP at 512x512 with a visible file size; WebP compressed under 100 KB
- [ ] Download and Web Share
- [ ] Canvas size presets
- [ ] Mobile layout polish and PWA install

**Done when:** a friend can make a sticker on a phone and send it in a chat with a transparent background.

---

## Phase 7: Backend features

- [ ] Accounts
- [ ] Save and open editable projects with autosave
- [ ] Save finished stickers; library page; reuse saved stickers as layers
- [ ] Sharing by link, report button, packs
- [ ] Moderation tools, quotas, account deletion, privacy and terms pages

---

## Phase 8: Later ideas

- Templates and quick-start layouts (including a face-slot template)
- Animated stickers
- Color eyedropper and gradient fills
- Sticker pack export formats for messaging apps
- Public gallery (only with moderation in place)

---

## Risks

| Risk | Mitigation |
|---|---|
| Slow with many large layers | Downscale imports, cache layer bitmaps, warn above a layer count |
| Background removal is slow on old phones | Progress indicator, downscale first, lazy-load the model |
| Rough edges after cutting | Feather, smoothing tolerance control, refine brush |
| Memory use on phones | Cap history, release unused bitmaps, limit canvas size |
| Art licensing | Use your own or licensed art only |
| Misuse of shared faces | Report system, terms, link-only sharing first |

---

## Testing checklist

- [ ] Chrome, Safari, and Firefox
- [ ] Android phone and iPhone
- [ ] Exports are transparent and within chat-app size limits
- [ ] Large photos (10+ MB) don't crash the page
- [ ] 20+ layers stay usable
- [ ] Undo and redo work across cuts, effects, merges, and reordering