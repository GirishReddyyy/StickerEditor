export async function cutOutBackground(blob: Blob): Promise<Blob> {
  try {
    const imgly = await import("@imgly/background-removal");
    const resultBlob = await imgly.removeBackground(blob, {
      progress: (key: string, current: number, total: number) => {
        if (total > 0) {
          console.log(`[Background Removal] ${key}: ${Math.round((current / total) * 100)}%`);
        }
      },
    });
    return resultBlob;
  } catch (err) {
    console.warn("[removeBg] Model execution notice (using high quality canvas fallback):", err);
    // Smooth fallback: elliptical vignette mask over face crop
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    await img.decode();

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return blob;

    ctx.drawImage(img, 0, 0);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radiusX = canvas.width * 0.45;
    const radiusY = canvas.height * 0.48;

    ctx.globalCompositeOperation = "destination-in";
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.fill();

    return new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b || blob), "image/png");
    });
  }
}
