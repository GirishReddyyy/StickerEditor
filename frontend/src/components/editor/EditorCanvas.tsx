import React, { useRef, useEffect } from "react";
import { Stage, Layer, Image as KImage } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { useEditorStore } from "../../store/editorStore";
import { FaceNode } from "./FaceNode";
import { CutOverlay } from "./CutOverlay";
import { addOutline } from "../../lib/addOutline";

export const EditorCanvas: React.FC<{
  stageRef: React.RefObject<Konva.Stage | null>;
  onCutComplete: (pathData: string) => void;
}> = ({ stageRef, onCutComplete }) => {
  const { templateUrl, faces, tool, select, outline } = useEditorStore();
  const [templateImg] = useImage(templateUrl || "");

  // Keyboard shortcuts listener for Delete & Ctrl/Cmd+Z / Ctrl/Cmd+Shift+Z
  const { selectedId, deleteFace, undo, redo } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when user is typing in inputs
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          e.preventDefault();
          deleteFace(selectedId);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, deleteFace, undo, redo]);

  return (
    <div className="relative flex items-center justify-center w-full max-w-[512px] aspect-square mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 checkerboard-pattern touch-none select-none">
      <Stage
        ref={stageRef}
        width={512}
        height={512}
        className="w-full h-full"
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) select(null);
        }}
        onTouchStart={(e) => {
          if (e.target === e.target.getStage()) select(null);
        }}
      >
        <Layer>
          {templateImg && (
            <KImage image={templateImg} width={512} height={512} listening={false} />
          )}
          {faces.map((face) => (
            <FaceNode key={face.id} face={face} />
          ))}
        </Layer>
      </Stage>

      {/* Render CutOverlay SVG layer only when Cut tool is active */}
      {tool === "cut" && <CutOverlay onComplete={onCutComplete} />}
    </div>
  );
};
