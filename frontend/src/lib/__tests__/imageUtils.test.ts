import { describe, it, expect } from "vitest";




import { smoothPath } from "../smoothPath";
import { applyCut } from "../applyCut";
import { fitTo512 } from "../exportSticker";

describe("Image Utility Functions", () => {
  it("smoothPath should convert polyline points to SVG path data", () => {
    const points = [
      { x: 10, y: 10 },
      { x: 100, y: 10 },
      { x: 100, y: 100 },
      { x: 10, y: 100 },
    ];
    const pathStr = smoothPath(points, 3);
    expect(pathStr).toBeTruthy();
    expect(typeof pathStr).toBe("string");
    expect(pathStr.length).toBeGreaterThan(0);
  });

  it("applyCut should produce a valid canvas output", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, 512, 512);

    const pathData = "M 50 50 L 200 50 L 200 200 L 50 200 Z";
    const result = applyCut(canvas, pathData, "keep-inside", 2);

    expect(result).toBeInstanceOf(HTMLCanvasElement);
    expect(result.width).toBe(512);
    expect(result.height).toBe(512);
  });

  it("fitTo512 should resize any canvas to exactly 512x512", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;

    const fitted = fitTo512(canvas);
    expect(fitted.width).toBe(512);
    expect(fitted.height).toBe(512);
  });
});
