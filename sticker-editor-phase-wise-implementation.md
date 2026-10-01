# Sticker Editor: Phase-wise Implementation Guide

Starter code for each phase. Library APIs change between versions, so verify against current docs and fix small differences. Finish and test each phase before moving on.

---

## Phase 0: Setup

```bash
npm create vite@latest sticker-editor -- --template react-ts
cd sticker-editor
npm install
npm install konva react-konva use-image zustand paper @imgly/background-removal react-router-dom
npm install -D tailwindcss @tailwindcss/vite vitest
```

Set up Tailwind using the current "Install Tailwind with Vite" guide on tailwindcss.com.

Folders: `src/components/editor`, `src/components/ui`, `src/lib/render`, `src/lib/tools`, `src/lib/export`, `src/store`, `src/types`, `public/models`, `public/stickers`.

---

## Phase 1: Layer foundation

### Types: `src/types/project.ts`

```ts
export type Effects = {
  brightness: number; contrast: number; saturation: number; hue: number; blur: number;
  shadow?: { color: string; blur: number; offsetX: number; offsetY: number; opacity: number };
  outline?: { color: string; thickness: number };
  tint?: { color: string; amount: number };
};

export const defaultEffects: Effects = {
  brightness: 0, contrast: 0, saturation: 0, hue: 0, blur: 0,
};

export type MaskOp =
  | { kind: "keep-inside" | "remove-inside"; pathData: string; feather: number }
  | { kind: "erase" | "restore"; points: number[]; size: number; hardness: number };

export type BaseLayer = {
  id: string; name: string; visible: boolean; locked: boolean;
  x: number; y: number; rotation: number; scaleX: number; scaleY: number;
  opacity: number; blendMode: GlobalCompositeOperation;
  effects: Effects; parentId?: string;
};

export type ImageLayer = BaseLayer & {
  type: "image"; assetId: string; width: number; height: number;
  flipX: boolean; flipY: boolean; maskOps: MaskOp[];
};

export type TextLayer = BaseLayer & {
  type: "text"; text: string; fontFamily: string; fontSize: number;
  fill: string; stroke?: string; strokeWidth?: number; curved?: boolean;
};

export type ShapeLayer = BaseLayer & {
  type: "shape"; shape: "rect" | "circle" | "star" | "polygon";
  width: number; height: number; fill: string; stroke?: string; strokeWidth?: number;
};

export type DrawingLayer = BaseLayer & {
  type: "drawing";
  strokes: { points: number[]; color: string; size: number; opacity: number }[];
};

export type Layer = ImageLayer | TextLayer | ShapeLayer | DrawingLayer;

export type Asset = { url: string; width: number; height: number };

export type Project = {
  id: string; name: string;
  canvas: { width: number; height: number; background: "transparent" | string };
  layers: Layer[];                  // bottom to top
  assets: Record<string, Asset>;
};
```

### Store with history: `src/store/projectStore.ts`

```ts
import { create } from "zustand";
import type { Layer, Project, Asset } from "../types/project";

const HISTORY_LIMIT = 50;

type State = {
  project: Project;
  selectedIds: string[];
  past: Project[];
  future: Project[];
  commit: (next: Project) => void;           // push history, apply change
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, patch: Partial<Layer>) => void;
  removeLayers: (ids: string[]) => void;
  moveLayer: (id: string, toIndex: number) => void;
  addAsset: (id: string, asset: Asset) => void;
  select: (ids: string[]) => void;
  undo: () => void;
  redo: () => void;
};

const emptyProject = (): Project => ({
  id: crypto.randomUUID(), name: "Untitled",
  canvas: { width: 512, height: 512, background: "transparent" },
  layers: [], assets: {},
});

export const useProject = create<State>((set, get) => ({
  project: emptyProject(),
  selectedIds: [],
  past: [],
  future: [],

  commit: (next) =>
    set((s) => ({
      past: [...s.past, s.project].slice(-HISTORY_LIMIT),
      future: [],
      project: next,
    })),

  addLayer: (layer) => {
    const p = get().project;
    get().commit({ ...p, layers: [...p.layers, layer] });
    set({ selectedIds: [layer.id] });
  },

  updateLayer: (id, patch) => {
    const p = get().project;
    get().commit({
      ...p,
      layers: p.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)),
    });
  },

  removeLayers: (ids) => {
    const p = get().project;
    get().commit({ ...p, layers: p.layers.filter((l) => !ids.includes(l.id)) });
    set({ selectedIds: [] });
  },

  moveLayer: (id, toIndex) => {
    const p = get().project;
    const from = p.layers.findIndex((l) => l.id === id);
    if (from < 0) return;
    const layers = [...p.layers];
    const [item] = layers.splice(from, 1);
    layers.splice(toIndex, 0, item);
    get().commit({ ...p, layers });
  },

  addAsset: (id, asset) =>
    set((s) => ({ project: { ...s.project, assets: { ...s.project.assets, [id]: asset } } })),

  select: (ids) => set({ selectedIds: ids }),

  undo: () =>
    set((s) => {
      if (!s.past.length) return s;
      const prev = s.past[s.past.length - 1];
      return { project: prev, past: s.past.slice(0, -1), future: [s.project, ...s.future] };
    }),

  redo: () =>
    set((s) => {
      if (!s.future.length) return s;
      const [next, ...rest] = s.future;
      return { project: next, past: [...s.past, s.project], future: rest };
    }),
}));
```

Tip: during a drag, update the node visually and call `updateLayer` only once on drag end, so one drag equals one undo step. Adding an asset isn't part of undo history because assets are only referenced, not edited.

### Adding images

```ts
// src/lib/tools/importImage.ts
import { useProject } from "../../store/projectStore";
import { defaultEffects } from "../../types/project";

const MAX = 2048;

export async function importImageFile(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  const blob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), "image/png"));

  const assetId = crypto.randomUUID();
  const { addAsset, addLayer, project } = useProject.getState();
  addAsset(assetId, { url: URL.createObjectURL(blob), width: w, height: h });

  // fit inside the canvas, centered
  const fit = Math.min(project.canvas.width / w, project.canvas.height / h, 1);
  addLayer({
    id: crypto.randomUUID(), type: "image", name: file.name,
    assetId, width: w, height: h,
    x: (project.canvas.width - w * fit) / 2, y: (project.canvas.height - h * fit) / 2,
    rotation: 0, scaleX: fit, scaleY: fit, flipX: false, flipY: false,
    visible: true, locked: false, opacity: 1, blendMode: "source-over",
    effects: { ...defaultEffects }, maskOps: [],
  });
}
```

Also wire up paste (`paste` event with `clipboardData.files`) and drag-and-drop (`drop` event).

### Test
- Add several images, drag, scale, rotate, reorder, hide, lock, delete
- Undo and redo work, and the history stops at 50 steps (unit-test the store)

---

## Phase 2: Cutting and erasing (non-destructive)

The key idea: an image layer keeps its original pixels plus a list of `maskOps`. To display it, render the original through those operations onto an offscreen canvas, then show that canvas in Konva.

### Path smoothing: `src/lib/tools/smoothPath.ts`

```ts
import paper from "paper";

export type Pt = { x: number; y: number };

// Points should be in the layer's own pixel space. Returns an SVG path string.
export function smoothPath(points: Pt[], tolerance = 3): string {
  paper.setup(new paper.Size(1, 1));
  const path = new paper.Path();
  points.forEach((p) => path.add(new paper.Point(p.x, p.y)));
  path.closed = true;
  path.simplify(tolerance);
  path.smooth({ type: "catmull-rom", factor: 0.5 });
  return path.pathData;
}
```

Convert pointer positions from stage coordinates to layer coordinates before smoothing, using the layer node's inverse transform, so the cut stays attached to the image when it moves or scales.

### Render a layer through its masks: `src/lib/render/renderLayerBitmap.ts`

```ts
import type { ImageLayer, MaskOp } from "../../types/project";

function strokePath(points: number[]): Path2D {
  const p = new Path2D();
  if (points.length < 2) return p;
  p.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) p.lineTo(points[i], points[i + 1]);
  return p;
}

export function renderLayerBitmap(
  img: CanvasImageSource, layer: ImageLayer
): HTMLCanvasElement {
  const { width, height } = layer;
  const out = document.createElement("canvas");
  out.width = width; out.height = height;
  const ctx = out.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);

  for (const op of layer.maskOps) applyOp(ctx, img, width, height, op);
  return out;
}

function applyOp(
  ctx: CanvasRenderingContext2D, img: CanvasImageSource,
  w: number, h: number, op: MaskOp
) {
  if (op.kind === "keep-inside" || op.kind === "remove-inside") {
    const mask = document.createElement("canvas");
    mask.width = w; mask.height = h;
    const m = mask.getContext("2d")!;
    // If blur filter is unsupported (older Safari), the edge stays hard; add a fallback later.
    m.filter = `blur(${op.feather}px)`;
    m.fillStyle = "#000";
    m.fill(new Path2D(op.pathData));

    ctx.globalCompositeOperation =
      op.kind === "keep-inside" ? "destination-in" : "destination-out";
    ctx.drawImage(mask, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    return;
  }

  // Brush strokes
  const stroke = document.createElement("canvas");
  stroke.width = w; stroke.height = h;
  const s = stroke.getContext("2d")!;
  s.lineCap = "round"; s.lineJoin = "round";
  s.lineWidth = op.size;
  s.strokeStyle = "#000";
  if (op.hardness < 1) s.filter = `blur(${(1 - op.hardness) * op.size * 0.25}px)`;
  s.stroke(strokePath(op.points));

  if (op.kind === "erase") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(stroke, 0, 0);
    ctx.globalCompositeOperation = "source-over";
  } else {
    // restore: bring back original pixels where the brush painted
    const restored = document.createElement("canvas");
    restored.width = w; restored.height = h;
    const r = restored.getContext("2d")!;
    r.drawImage(img, 0, 0, w, h);
    r.globalCompositeOperation = "destination-in";
    r.drawImage(stroke, 0, 0);
    ctx.drawImage(restored, 0, 0);
  }
}
```

Cache the output per layer (key it on the asset ID plus a hash of `maskOps`) and re-render only when they change. Show the cached canvas as a Konva image.

### Cut tool flow
1. Pointer down, move, up on an overlay collects points in stage coordinates.
2. Convert the points to the selected layer's local coordinates.
3. `smoothPath(points)` returns the path data.
4. Call `updateLayer(id, { maskOps: [...layer.maskOps, { kind, pathData, feather }] })`.

Brush: collect points while painting, then add one `erase` or `restore` operation on release (one stroke equals one undo step). Show a live preview stroke while the pointer is down.

### Test
- A shaky loop gives a smooth cut; both modes work
- Undo removes the last cut and the full-quality image returns
- Erase and restore brushes work and undo correctly
- Moving or scaling the layer keeps the cut aligned

---

## Phase 3: Text, shapes, and drawing

Render each layer type with the matching Konva node:

```tsx
// src/components/editor/LayerNode.tsx (outline)
switch (layer.type) {
  case "image":   return <ImageLayerNode layer={layer} />;      // uses renderLayerBitmap
  case "text":    return layer.curved
                    ? <TextPath data={arcPath(layer)} text={layer.text} ... />
                    : <Text text={layer.text} fontFamily={layer.fontFamily}
                            fontSize={layer.fontSize} fill={layer.fill}
                            stroke={layer.stroke} strokeWidth={layer.strokeWidth} ... />;
  case "shape":   return <ShapeNode layer={layer} />;           // Rect, Circle, Star, RegularPolygon
  case "drawing": return <Group>{layer.strokes.map(s =>
                    <Line points={s.points} stroke={s.color} strokeWidth={s.size}
                          opacity={s.opacity} lineCap="round" lineJoin="round" tension={0.4} />)}
                  </Group>;
}
```

Every node also receives the shared layer props: `x`, `y`, `rotation`, `scaleX`, `scaleY`, `opacity`, `visible`, `draggable={!locked}`, and `globalCompositeOperation={blendMode}`.

For text fonts, load web fonts (for example from Google Fonts, or self-hosted for privacy) and wait for them to load (`document.fonts.load`) before rendering text on the canvas, otherwise the fallback font is drawn first.

---

## Phase 4: Effects, arrangement, and snapping

### Adjustments with Konva filters

```tsx
import Konva from "konva";

// On the Konva node (cache it first so filters apply):
node.cache();
node.filters([Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSL, Konva.Filters.Blur]);
node.brightness(effects.brightness);   // about -1 to 1
node.contrast(effects.contrast);       // about -100 to 100
node.saturation(effects.saturation);   // HSL saturation
node.hue(effects.hue);                 // 0 to 359
node.blurRadius(effects.blur);
```

Call `node.cache()` again when the image or its size changes. Value ranges depend on the filter, so check the Konva docs.

### Shadow
Use the node's `shadowColor`, `shadowBlur`, `shadowOffsetX/Y`, and `shadowOpacity` properties.

### Outline: `src/lib/render/addOutline.ts`

```ts
// Stamps a colored silhouette in a circle around the artwork, then draws the artwork on top.
export function addOutline(
  source: HTMLCanvasElement, thickness: number, color = "#ffffff"
): HTMLCanvasElement {
  const pad = Math.ceil(thickness) + 2;
  const out = document.createElement("canvas");
  out.width = source.width + pad * 2;
  out.height = source.height + pad * 2;
  const ctx = out.getContext("2d")!;

  const sil = document.createElement("canvas");
  sil.width = source.width; sil.height = source.height;
  const s = sil.getContext("2d")!;
  s.drawImage(source, 0, 0);
  s.globalCompositeOperation = "source-in";
  s.fillStyle = color;
  s.fillRect(0, 0, sil.width, sil.height);

  const steps = Math.max(24, Math.ceil(thickness * 4));
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    ctx.drawImage(sil, pad + Math.cos(a) * thickness, pad + Math.sin(a) * thickness);
  }
  ctx.drawImage(source, pad, pad);
  return out;
}
```

### Snapping
During `dragmove`, compare the dragged layer's edges and center to the canvas and other layers; when within a few pixels, snap and draw a guide line. Konva's documentation has an "Objects Snapping" example to start from.

### Groups
Add a `parentId` to grouped layers. Transform the group as one unit (use a Konva `Group`), and let users enter a group to edit its members.

### Test
- Sliders update the layer live
- Shadow and outline look right and aren't clipped
- Layers snap to the canvas center and to each other

---

## Phase 5: Smart tools

### Background removal

```ts
// src/lib/tools/bgRemove.ts
export async function removeBg(blob: Blob): Promise<Blob> {
  const { removeBackground } = await import("@imgly/background-removal"); // lazy-load
  return removeBackground(blob); // configure the library's asset path to your self-hosted /models copy
}
```

On success, add the result as a **new asset** and either replace the layer's `assetId` (keeping the original asset so the user can revert) or add a new layer above it.

### Magic wand
Run a flood fill on the layer's pixel data starting from the clicked point, using a color distance tolerance. Turn the selected pixels into a mask and store it (a `bitmap` mask operation referencing a small mask image asset). This is more involved than path cuts, so build it after the rest works.

### Optional face crop
Detect faces with MediaPipe's Face Detector, crop around the largest face with padding, then optionally run background removal. This is a convenience tool, not the center of the app. Use the model files from `public/models` instead of a CDN.

### Test
- Photos become clean cut-outs; failures show friendly messages
- First use shows a "setting things up" message while models download

---

## Phase 6: Merge and export

### Flatten the canvas: `src/lib/export/flatten.ts`

```ts
import Konva from "konva";

// Hide editor-only helpers (Transformer, guides) before capturing.
export function flattenStage(stage: Konva.Stage, pixelRatio = 1): HTMLCanvasElement {
  const helpers = stage.find(".editor-only");
  helpers.forEach((n) => n.hide());
  const canvas = stage.toCanvas({ pixelRatio });
  helpers.forEach((n) => n.show());
  return canvas;
}

// Optional: crop to the visible pixels.
export function trimTransparent(src: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = src.getContext("2d")!;
  const { data, width, height } = ctx.getImageData(0, 0, src.width, src.height);
  let top = height, left = width, right = 0, bottom = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (data[(y * width + x) * 4 + 3] > 0) {
        if (x < left) left = x; if (x > right) right = x;
        if (y < top) top = y;   if (y > bottom) bottom = y;
      }
  if (right < left || bottom < top) return src;
  const out = document.createElement("canvas");
  out.width = right - left + 1; out.height = bottom - top + 1;
  out.getContext("2d")!.drawImage(src, left, top, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}
```

### Merge layers
1. Take the selected layers (or all of them).
2. Render only those layers into one canvas, using their transforms, effects, and blend modes (for example by temporarily hiding the others and calling `toCanvas`).
3. Add the result as a new asset and one new image layer at the position of the top merged layer.
4. Replace the merged layers with it in one `commit` so undo restores them all.

### Export: `src/lib/export/exportSticker.ts`

```ts
function fitTo(src: HTMLCanvasElement, size = 512): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = size; out.height = size;
  const scale = Math.min(size / src.width, size / src.height);
  const w = src.width * scale, h = src.height * scale;
  out.getContext("2d")!.drawImage(src, (size - w) / 2, (size - h) / 2, w, h);
  return out;
}

export async function exportWebP(src: HTMLCanvasElement, maxKB = 100): Promise<Blob> {
  const canvas = fitTo(src);
  for (let q = 0.95; q >= 0.3; q -= 0.1) {
    const blob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), "image/webp", q));
    if (blob.size <= maxKB * 1024) return blob;
  }
  return new Promise((r) => canvas.toBlob((b) => r(b!), "image/webp", 0.3));
}

export const exportPNG = (src: HTMLCanvasElement): Promise<Blob> =>
  new Promise((r) => fitTo(src).toBlob((b) => r(b!), "image/png"));

export function download(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function shareSticker(blob: Blob, name = "sticker.webp") {
  const file = new File([blob], name, { type: blob.type });
  if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file] });
  else download(blob, name);
}
```

Confirm each messaging app's current sticker rules before launch; some also need sticker-pack packaging.

### Test
- Merge three layers, then undo restores all three
- Exported files are transparent, 512x512, and under the size limit
- Whole-sticker outline isn't clipped
- Sharing works on a phone

---

## Phase 7: Backend integration

Follow the Backend document. In the editor:

- Save assets to Storage and store only asset IDs in the project JSON
- Autosave the project with a debounce
- "Save sticker" exports the flattened image and uploads it
- "Add from library" adds a saved sticker as a new image layer

---

## Recommended order

1. Phases 0 and 1: a working layer canvas
2. Phase 2: cutting and erasing (your key feature)
3. Phase 3 and 4: content, effects, and arrangement
4. Phase 6: merge and export, so people can actually use it
5. Phase 5: smart tools
6. Share with a few friends, collect feedback, then do Phase 7

## When something breaks

Copy the full error and the file it comes from, include versions from `package.json`, and bring them back here.