import React, { useEffect, useRef } from "react";
import { Image as KImage, Transformer } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { useEditorStore, FaceLayer } from "../../store/editorStore";

export const FaceNode: React.FC<{ face: FaceLayer }> = ({ face }) => {
  const [img] = useImage(face.src);
  const ref = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  const { selectedId, select, updateFace } = useEditorStore();
  const isSelected = selectedId === face.id;

  useEffect(() => {
    if (isSelected && trRef.current && ref.current) {
      trRef.current.nodes([ref.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, img]);

  return (
    <>
      <KImage
        ref={ref}
        image={img}
        x={face.x}
        y={face.y}
        width={face.width}
        height={face.height}
        rotation={face.rotation}
        draggable
        onClick={() => select(face.id)}
        onTap={() => select(face.id)}
        onDragEnd={(e) => updateFace(face.id, { x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = ref.current;
          if (!node) return;
          const sx = node.scaleX();
          const sy = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          updateFace(face.id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(20, node.width() * sx),
            height: Math.max(20, node.height() * sy),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          keepRatio
          borderStroke="#8b5cf6"
          anchorFill="#c084fc"
          anchorSize={10}
          anchorCornerRadius={3}
        />
      )}
    </>
  );
};
