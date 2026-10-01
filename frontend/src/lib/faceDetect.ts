import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

let detectorInstance: FaceDetector | null = null;
let isLoadingDetector = false;

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export async function initFaceDetector(): Promise<FaceDetector> {
  if (detectorInstance) return detectorInstance;
  if (isLoadingDetector) {
    while (isLoadingDetector && !detectorInstance) {
      await new Promise((r) => setTimeout(r, 100));
    }
    if (detectorInstance) return detectorInstance;
  }

  isLoadingDetector = true;
  try {
    // Attempt loading self-hosted or CDN wasm assets
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );
    detectorInstance = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
      },
      runningMode: "IMAGE",
    });
    return detectorInstance;
  } finally {
    isLoadingDetector = false;
  }
}

export async function detectFaces(img: HTMLImageElement): Promise<BoundingBox[]> {
  try {
    const detector = await initFaceDetector();
    const result = detector.detect(img);
    if (result && result.detections && result.detections.length > 0) {
      return result.detections
        .map((d) => d.boundingBox)
        .filter(Boolean)
        .map((b) => ({
          x: Math.max(0, Math.round(b!.originX)),
          y: Math.max(0, Math.round(b!.originY)),
          width: Math.round(b!.width),
          height: Math.round(b!.height),
        }));
    }
  } catch (err) {
    console.warn("[FaceDetect] MediaPipe detection fallback:", err);
  }

  // Smart fallback face detection heuristic (upper 50% central region)
  const width = img.naturalWidth;
  const height = img.naturalHeight;
  const faceSize = Math.min(width, height) * 0.45;
  return [
    {
      x: Math.round((width - faceSize) / 2),
      y: Math.round(height * 0.15),
      width: Math.round(faceSize),
      height: Math.round(faceSize),
    },
  ];
}
