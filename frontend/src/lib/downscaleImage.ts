/**
 * Downscales an HTMLImageElement or File to max ~1500px on the longest edge
 * to save memory and prevent high memory crashes on high-res mobile photos.
 */
export async function downscaleImage(
  imageSource: HTMLImageElement | File,
  maxDimension = 1500
): Promise<HTMLImageElement> {
  let img: HTMLImageElement;
  if (imageSource instanceof File) {
    img = new Image();
    img.src = URL.createObjectURL(imageSource);
    await img.decode();
  } else {
    img = imageSource;
  }

  const { naturalWidth: width, naturalHeight: height } = img;

  if (width <= maxDimension && height <= maxDimension) {
    return img;
  }

  const scale = maxDimension / Math.max(width, height);
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2d context for image downscaling");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const downscaledImg = new Image();
  downscaledImg.src = canvas.toDataURL("image/png");
  await downscaledImg.decode();

  return downscaledImg;
}
