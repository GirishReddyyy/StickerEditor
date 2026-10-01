# Sticker Editor: Frontend Document

Everything the user sees and touches. The editor works with no backend. Items marked **[needs backend]** come later.

---

## 1. Pages and routes

| Route | Page | Needs backend |
|---|---|---|
| `/` | Home: intro, "New sticker" button, recent projects | Partly |
| `/editor` | Editor (new project) | No |
| `/editor/:projectId` | Editor (open saved project) | Yes |
| `/library` | My stickers, projects, and packs | Yes |
| `/s/:slug` | Public shared sticker with report button | Yes |
| `/login` | Sign in | Yes |
| `/privacy`, `/terms`, `/contact` | Legal and takedown contact | No |

---

## 2. Folder structure

```
src/
  main.tsx, App.tsx, routes.tsx
  pages/            Home, Editor, Library, SharedSticker, Login, Privacy, Terms, Contact
  components/
    editor/
      EditorCanvas.tsx      # Konva stage
      LayerNode.tsx         # renders one layer by type
      TransformerBox.tsx
      LayersPanel.tsx       # list, reorder, visibility, lock, group
      Toolbar.tsx           # tool buttons
      PropertiesPanel.tsx   # settings for the selected layer or tool
      CutOverlay.tsx        # freehand / lasso / polygon capture
      BrushOverlay.tsx      # eraser, restore, draw brush
      AddMenu.tsx           # upload, paste, library, text, shape
      ExportDialog.tsx
    ui/                     # Button, Slider, Modal, Toast, Spinner, ColorPicker
  lib/
    render/                 # renderLayerBitmap, flatten, outline, effects
    tools/                  # smoothPath, magicWand, bgRemove, faceCrop
    export/                 # exportSticker, share
    api/                    # [needs backend]
  store/
    projectStore.ts         # project, layers, selection, history
    uiStore.ts              # active tool, panels, toasts
  types/
    project.ts
  hooks/
public/
  models/                   # self-hosted ML files
  stickers/                 # built-in sticker packs (art you own or license)
```

---

## 3. Layout

Desktop:

```
+-----------------------------------------------------+
| Top bar: project name, undo/redo, zoom, export      |
+--------+------------------------------+-------------+
| Tools  |         Canvas               | Layers      |
| (left) |  (checkerboard, zoom, pan)   | Properties  |
+--------+------------------------------+-------------+
```

Mobile: canvas fills the screen; the tool bar sits at the bottom; Layers and Properties open as bottom sheets.

---

## 4. Core data model

```ts
type Project = {
  id: string;
  name: string;
  canvas: { width: number; height: number; background: "transparent" | string };
  layers: Layer[];                 // ordered bottom to top
  assets: Record<string, Asset>;   // imageId -> { url, width, height }
};

type BaseLayer = {
  id: string; name: string; visible: boolean; locked: boolean;
  x: number; y: number; rotation: number; scaleX: number; scaleY: number;
  opacity: number; blendMode: GlobalCompositeOperation;
  effects: Effects; parentId?: string;
};

type ImageLayer = BaseLayer & {
  type: "image"; assetId: string; width: number; height: number;
  crop?: { x: number; y: number; width: number; height: number };
  flipX: boolean; flipY: boolean;
  maskOps: MaskOp[];               // non-destructive cuts and erasing
};
// also: TextLayer, ShapeLayer, DrawingLayer, GroupLayer

type MaskOp =
  | { kind: "keep-inside" | "remove-inside"; pathData: string; feather: number }
  | { kind: "erase" | "restore"; points: number[]; size: number; hardness: number }
  | { kind: "bitmap"; maskAssetId: string };

type Effects = {
  brightness: number; contrast: number; saturation: number; hue: number; blur: number;
  shadow?: { color: string; blur: number; offsetX: number; offsetY: number; opacity: number };
  outline?: { color: string; thickness: number };
  tint?: { color: string; amount: number };
};
```

Why this matters: because cuts and erasing are stored as instructions, users can undo, re-edit, or hide a cut at any time, and undo history stays small.

---

## 5. Tools

| Tool | Behavior |
|---|---|
| Select/Move | Click a layer, drag, transform with handles; multi-select with Shift |
| Crop | Drag a crop rectangle on the selected image |
| Cut: freehand | Draw a line; on release it closes and smooths into a curve |
| Cut: lasso / polygon | Click points for straight edges, or drag for a lasso |
| Eraser / Restore | Paint to hide or bring back parts of a layer |
| Magic wand | Click a region; tolerance slider; makes a mask |
| Background remove | One-click per image layer |
| Draw | Brush with color, size, opacity |
| Text | Add and style text; curved option |
| Shape | Add and style shapes |
| Eyedropper (later) | Pick a color from the canvas |

Each cut tool has two modes: **keep inside** and **remove inside**, plus an edge feather slider.

---

## 6. Layers panel

- Drag to reorder; eye icon for visibility; lock icon; rename by double-click
- Duplicate, delete, group, ungroup
- Merge down, merge selected, merge all (flatten)
- Thumbnail per layer
- Opacity slider and blend mode dropdown for the selected layer

**Merge** renders the chosen layers to one canvas and replaces them with a single image layer. Put the previous project state on the undo stack first.

---

## 7. State and history

- `projectStore`: the project, selection, and an undo/redo history
- History stores project snapshots (JSON only; images are referenced by ID), capped at 50 steps
- Group related changes into one history step (for example, one drag = one step, not one per pixel)
- UI state (active tool, open panels) is NOT part of undo history

Keyboard shortcuts: Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, Delete, Ctrl/Cmd+D duplicate, arrow keys nudge, Ctrl/Cmd+G group, [ and ] for layer order.

---

## 8. User flow

1. Start a new sticker (choose canvas size, default 512x512, transparent).
2. Add layers: upload, paste, drag in, or choose a built-in sticker.
3. Arrange and transform; cut away unwanted parts; add text, shapes, drawings; apply effects.
4. Optionally add an outline around the whole sticker.
5. Export (download or share), or save the project and sticker **[needs backend]**.

Edge cases to handle: huge images (downscale), unsupported or corrupt files, background removal failing, very many layers (performance warning), running low on memory on phones.

---

## 9. Performance

- Downscale imported images to about 2048 px on the longest side (keep the original asset for export quality if needed)
- Cache rendered layer bitmaps; re-render only when that layer's masks or effects change
- Lazy-load the background-removal and MediaPipe libraries
- Code-split routes
- Use Web Workers for heavy pixel work (magic wand, outline) where practical
- Self-host ML model files in `public/models`

---

## 10. Responsive and accessible

- Mobile first; touch-action none on the canvas; 44 px touch targets
- Pinch to zoom and two-finger pan on the canvas
- Labeled buttons, alt text, visible focus states
- Don't rely on color alone to show selection or errors

---

## 11. Backend integration **[needs backend]**

- All calls go through `src/lib/api/`; components never call `fetch` directly
- Guest mode: editing works without an account; sign-in is requested only on Save
- Autosave projects with a short debounce once logged in
- Reuse: any saved sticker can be added to a new project as an image layer

---

## 12. Testing

| Type | What |
|---|---|
| Unit | Store actions (add, group, reorder, undo/redo, cap), `smoothPath`, mask rendering, export size logic |
| Component | Layers panel reordering, tool switching |
| End to end | Add three images, cut one, merge all, export a transparent file |
| Manual | Real Android and iPhone devices, large images, many layers |

---

## 13. Build order

1. Shell, routing, layer data model, store with undo/redo
2. Canvas with add, select, transform, delete
3. Layers panel
4. Cut tools and eraser/restore (non-destructive masks)
5. Effects, text, shapes, drawing
6. Background removal, magic wand, optional face crop
7. Merge, outline, and export
8. Mobile polish and PWA
9. Backend features **[needs backend]**