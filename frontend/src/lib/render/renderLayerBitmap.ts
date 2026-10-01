import type { ImageLayer, MaskOp } from "../../types/project";

function strokePath(points: number[]): Path2D {
  const p = new Path2D();
  if (points.length < 2) return p;
  p.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) p.lineTo(points[i], points[i + 1]);
  return p;
}

function applyOp(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  w: number,
  h: number,
  op: MaskOp
) {
  if (op.kind === "keep-inside" || op.kind === "remove-inside") {
    const mask = document.createElement("canvas");
    mask.width = w;
    mask.height = h;
    const m = mask.getContext("2d")!;

    const supportsFilter = "filter" in m && typeof m.filter === "string";
    if (supportsFilter && op.feather > 0) {
      m.filter = `blur(${op.feather}px)`;
      m.fillStyle = "#000000";
      m.fill(new Path2D(op.pathData));
    } else {
      m.shadowColor = "#000000";
      m.shadowBlur = op.feather * 2;
      m.fillStyle = "#000000";
      m.fill(new Path2D(op.pathData));
    }

    ctx.globalCompositeOperation =
      op.kind === "keep-inside" ? "destination-in" : "destination-out";
    ctx.drawImage(mask, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    return;
  }

  if (op.kind === "erase" || op.kind === "restore") {
    const stroke = document.createElement("canvas");
    stroke.width = w;
    stroke.height = h;
    const s = stroke.getContext("2d")!;
    s.lineCap = "round";
    s.lineJoin = "round";
    s.lineWidth = op.size;
    s.strokeStyle = "#000000";

    const supportsFilter = "filter" in s && typeof s.filter === "string";
    if (op.hardness < 1 && supportsFilter) {
      s.filter = `blur(${(1 - op.hardness) * op.size * 0.25}px)`;
    }
    s.stroke(strokePath(op.points));

    if (op.kind === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.drawImage(stroke, 0, 0);
      ctx.globalCompositeOperation = "source-over";
    } else {
      // restore original pixels
      const restored = document.createElement("canvas");
      restored.width = w;
      restored.height = h;
      const r = restored.getContext("2d")!;
      r.drawImage(img, 0, 0, w, h);
      r.globalCompositeOperation = "destination-in";
      r.drawImage(stroke, 0, 0);

      ctx.drawImage(restored, 0, 0);
    }
  }
}

export function renderLayerBitmap(
  img: CanvasImageSource,
  layer: ImageLayer
): HTMLCanvasElement {
  const { width, height } = layer;
  const out = document.createElement("canvas");
  out.width = Math.max(1, width);
  out.height = Math.max(1, height);
  const ctx = out.getContext("2d")!;

  ctx.drawImage(img, 0, 0, width, height);

  for (const op of layer.maskOps) {
    applyOp(ctx, img, width, height, op);
  }

  return out;
}
