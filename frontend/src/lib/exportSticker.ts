export function fitTo512(src: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = 512;
  out.height = 512;
  const ctx = out.getContext("2d")!;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const scale = Math.min(512 / src.width, 512 / src.height);
  const w = Math.round(src.width * scale);
  const h = Math.round(src.height * scale);
  const x = Math.round((512 - w) / 2);
  const y = Math.round((512 - h) / 2);

  ctx.drawImage(src, x, y, w, h);
  return out;
}

export async function exportWebP(
  src: HTMLCanvasElement,
  maxKB = 100
): Promise<{ blob: Blob; sizeKB: number }> {
  const canvas = fitTo512(src);

  // Iterative quality step to satisfy max KB limit
  for (let q = 0.95; q >= 0.3; q -= 0.08) {
    const blob: Blob = await new Promise((res) =>
      canvas.toBlob((b) => res(b!), "image/webp", q)
    );
    const sizeKB = Math.round(blob.size / 1024);
    if (sizeKB <= maxKB) {
      return { blob, sizeKB };
    }
  }

  const finalBlob: Blob = await new Promise((res) =>
    canvas.toBlob((b) => res(b!), "image/webp", 0.3)
  );
  return { blob: finalBlob, sizeKB: Math.round(finalBlob.size / 1024) };
}

export async function exportPNG(
  src: HTMLCanvasElement
): Promise<{ blob: Blob; sizeKB: number }> {
  const canvas = fitTo512(src);
  const blob: Blob = await new Promise((res) =>
    canvas.toBlob((b) => res(b!), "image/png")
  );
  return { blob, sizeKB: Math.round(blob.size / 1024) };
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function shareOrDownload(blob: Blob, filename: string): Promise<boolean> {
  const file = new File([blob], filename, { type: blob.type });

  if (
    navigator.canShare &&
    navigator.canShare({ files: [file] }) &&
    navigator.share
  ) {
    try {
      await navigator.share({
        files: [file],
        title: "Sticker Editor Creation",
        text: "Check out this custom sticker I made!",
      });
      return true;
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.warn("Share failed, falling back to download:", err);
      }
    }
  }

  triggerDownload(blob, filename);
  return false;
}
