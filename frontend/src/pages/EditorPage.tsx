import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Konva from "konva";
import { PageWrapper } from "../components/layout/PageWrapper";
import { useEditorStore } from "../store/editorStore";
import { EditorCanvas } from "../components/editor/EditorCanvas";
import { Toolbar } from "../components/editor/Toolbar";
import { PropertiesPanel } from "../components/editor/PropertiesPanel";
import { LayersPanel } from "../components/editor/LayersPanel";
import { PhotoUploadModal } from "../components/editor/PhotoUpload.tsx";
import { ExportDialog } from "../components/editor/ExportDialog";
import { applyCut } from "../lib/applyCut";
import { useUIStore } from "../store/uiStore";

export const EditorPage: React.FC = () => {
  const { templateId } = useParams<{ templateId?: string }>();
  const stageRef = useRef<Konva.Stage | null>(null);

  const { setTemplate, cutMode, feather, applyCutResult } = useEditorStore();
  const { showToast } = useUIStore();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    const id = templateId || "cat-01";
    // Fetch template JSON
    fetch(`/templates/${id}.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Template not found");
        return res.json();
      })
      .then((data) => {
        setTemplate(data);
      })
      .catch((err) => {
        console.warn("[EditorPage] Loading fallback template:", err);
        setTemplate({
          id: "cat-01",
          name: "Cheeky Cat",
          category: "cats",
          image: "/templates/cat-01.png",
          size: 512,
          faceSlots: [{ x: 176, y: 110, width: 160, height: 160, rotation: 0 }],
        });
      });
  }, [templateId, setTemplate]);

  const handleCutComplete = (pathData: string) => {
    if (!stageRef.current) return;
    try {
      const stage = stageRef.current;
      const flatCanvas = stage.toCanvas({ pixelRatio: 1 });
      const cutResultCanvas = applyCut(flatCanvas, pathData, cutMode, feather);
      const dataUrl = cutResultCanvas.toDataURL("image/png");

      applyCutResult(dataUrl);
      showToast("Edge cut applied smoothly!", "success");
    } catch (err) {
      console.error("[handleCutComplete] Cut failure:", err);
      showToast("Failed to apply cut.", "error");
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-4 py-2">
        {/* Toolbar */}
        <Toolbar
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
        />

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Canvas Section */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center p-4 glass-panel rounded-2xl border border-slate-800">
            <EditorCanvas stageRef={stageRef} onCutComplete={handleCutComplete} />
          </div>

          {/* Side Panels */}
          <div className="lg:col-span-4 space-y-6">
            <PropertiesPanel />
            <LayersPanel />
          </div>
        </div>

        {/* Modals */}
        <PhotoUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
        <ExportDialog
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          stageRef={stageRef}
        />
      </div>
    </PageWrapper>
  );
};
