export function addOutline(
  source: HTMLCanvasElement,
  thickness = 8
): HTMLCanvasElement {
  if (thickness <= 0) return source;

  const pad = Math.ceil(thickness * 2);
  const out = document.createElement("canvas");
  out.width = source.width + pad * 2;
  out.height = source.height + pad * 2;
  const ctx = out.getContext("2d")!;

  // 1. Create solid white silhouette canvas of the source
  const silhouette = document.createElement("canvas");
  silhouette.width = source.width;
  silhouette.height = source.height;
  const sctx = silhouette.getContext("2d")!;

  sctx.drawImage(source, 0, 0);
  sctx.globalCompositeOperation = "source-in";
  sctx.fillStyle = "#ffffff";
  sctx.fillRect(0, 0, silhouette.width, silhouette.height);

  // 2. Stamp silhouette in a radial pattern around offset radius
  const steps = 64;
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const dx = pad + Math.cos(angle) * thickness;
    const dy = pad + Math.sin(angle) * thickness;
    ctx.drawImage(silhouette, dx, dy);
  }

  // 3. Draw original sticker on top in center
  ctx.drawImage(source, pad, pad);

  return out;
}
