import { vi } from "vitest";

class MockPath2D {}
(globalThis as any).Path2D = MockPath2D;

HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((type: string) => {
  if (type === "2d") {
    return {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(512 * 512 * 4) })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => []),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      fillText: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      transform: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      filter: "",
    } as any;
  }
  return null;
});

HTMLCanvasElement.prototype.toBlob = vi.fn().mockImplementation((cb: (blob: Blob) => void, type = "image/png") => {
  cb(new Blob(["mock-image-data"], { type }));
});

HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue("data:image/png;base64,mock");
