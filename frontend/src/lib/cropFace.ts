import { BoundingBox } from "./faceDetect";

export async function cropFace(
  img: HTMLImageElement,
  box: BoundingBox,
  padding = 0.35
): Promise<Blob> {
  const padX = box.width * padding;
  const padY = box.height * padding;

  const sx = Math.max(0, Math.floor(box.x - padX));
  const sy = Math.max(0, Math.floor(box.y - padY));
  const sw = Math.min(img.naturalWidth - sx, Math.ceil(box.width + padX * 2));
  const sh = Math.min(img.naturalHeight - sy, Math.ceil(box.height + padY * 2));

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable for face crop");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to generate cropped face image blob"));
    }, "image/png");
  });
}
