import React, { useRef, useState } from "react";
import { Pt, smoothPath } from "../../lib/smoothPath";

export const CutOverlay: React.FC<{
  onComplete: (pathData: string) => void;
}> = ({ onComplete }) => {
  const [points, setPoints] = useState<Pt[]>([]);
  const isDrawing = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  function getCanvasPos(e: React.PointerEvent): Pt {
    const rect = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 512;
    const y = ((e.clientY - rect.top) / rect.height) * 512;
    return { x: Math.max(0, Math.min(512, x)), y: Math.max(0, Math.min(512, y)) };
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    setPoints([getCanvasPos(e)]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current) return;
    setPoints((prev) => [...prev, getCanvasPos(e)]);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (points.length >= 4) {
      const pathData = smoothPath(points);
      if (pathData) onComplete(pathData);
    }
    setPoints([]);
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 512 512"
      className="absolute inset-0 w-full h-full cursor-crosshair touch-none z-30"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {points.length > 0 && (
        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="rgba(139, 92, 246, 0.2)"
          stroke="#a855f7"
          strokeWidth={3}
          strokeDasharray="6 4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
};
