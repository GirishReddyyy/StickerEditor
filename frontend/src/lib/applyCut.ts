export function applyCut(
  source: HTMLCanvasElement,
  pathData: string,
  mode: "keep-inside" | "remove-inside",
  feather = 1.5
): HTMLCanvasElement {
  const { width, height } = source;
  if (!pathData) return source;

  // 1. Create mask canvas
  const mask = document.createElement("canvas");
  mask.width = width;
  mask.height = height;
  const mctx = mask.getContext("2d")!;

  const path = new Path2D(pathData);

  // Check filter support for canvas feathering (Safari fallback check)
  const supportsCanvasFilter = "filter" in mctx && typeof mctx.filter === "string";

  if (supportsCanvasFilter && feather > 0) {
    mctx.filter = `blur(${feather}px)`;
    mctx.fillStyle = "#000000";
    mctx.fill(path);
  } else {
    // Safari/legacy fallback using shadowBlur
    mctx.shadowColor = "#000000";
    mctx.shadowBlur = feather * 2;
    mctx.fillStyle = "#000000";
    mctx.fill(path);
  }

  // 2. Composite output canvas
  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const octx = out.getContext("2d")!;

  octx.drawImage(source, 0, 0);
  octx.globalCompositeOperation =
    mode === "keep-inside" ? "destination-in" : "destination-out";
  octx.drawImage(mask, 0, 0);
  octx.globalCompositeOperation = "source-over";

  return out;
}
