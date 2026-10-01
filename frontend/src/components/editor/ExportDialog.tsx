import React, { useState, useEffect } from "react";
import Konva from "konva";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useEditorStore } from "../../store/editorStore";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { addOutline } from "../../lib/addOutline";
import { exportPNG, exportWebP, shareOrDownload, triggerDownload } from "../../lib/exportSticker";
import { saveStickerToCloud } from "../../lib/api/stickers";
import { Download, Share2, CloudUpload, CheckCircle, FileCheck } from "lucide-react";
import confetti from "canvas-confetti";

export const ExportDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  stageRef: React.RefObject<Konva.Stage | null>;
}> = ({ isOpen, onClose, stageRef }) => {
  const { outline, template } = useEditorStore();
  const { user } = useAuthStore();
  const { showToast } = useUIStore();

  const [format, setFormat] = useState<"webp" | "png">("webp");
  const [exportBlob, setExportBlob] = useState<Blob | null>(null);
  const [fileSizeKB, setFileSizeKB] = useState<number>(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>("");

  useEffect(() => {
    if (!isOpen || !stageRef.current) return;

    setIsExporting(true);
    const renderExport = async () => {
      try {
        const stage = stageRef.current!;
        const rawCanvas = stage.toCanvas({ pixelRatio: 1 });

        // Apply white outline if enabled
        const finalCanvas = outline.enabled
          ? addOutline(rawCanvas, outline.thickness)
          : rawCanvas;

        setPreviewDataUrl(finalCanvas.toDataURL("image/png"));

        if (format === "webp") {
          const { blob, sizeKB } = await exportWebP(finalCanvas, 100);
          setExportBlob(blob);
          setFileSizeKB(sizeKB);
        } else {
          const { blob, sizeKB } = await exportPNG(finalCanvas);
          setExportBlob(blob);
          setFileSizeKB(sizeKB);
        }
      } catch (err) {
        console.error("[ExportDialog] render error:", err);
      } finally {
        setIsExporting(false);
      }
    };

    renderExport();
  }, [isOpen, format, outline, stageRef]);

  const handleDownload = () => {
    if (!exportBlob) return;
    triggerDownload(exportBlob, `sticker-${Date.now()}.${format}`);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    showToast("Downloaded sticker!", "success");
  };

  const handleShare = async () => {
    if (!exportBlob) return;
    const shared = await shareOrDownload(exportBlob, `sticker-${Date.now()}.${format}`);
    if (shared) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.8 } });
      showToast("Shared sticker!", "success");
    }
  };

  const handleSaveToCloud = async () => {
    if (!exportBlob) return;
    if (!user) {
      showToast("Please sign in to save stickers to your cloud library.", "info");
      return;
    }

    setIsSavingCloud(true);
    try {
      await saveStickerToCloud({
        blob: exportBlob,
        title: template?.name ? `${template.name} Custom` : "My Sticker",
        templateId: template?.id,
      });
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.7 } });
      showToast("Saved to My Stickers!", "success");
      onClose();
    } catch (err) {
      console.error("[SaveToCloud] error:", err);
      showToast("Failed to save sticker to cloud.", "error");
    } finally {
      setIsSavingCloud(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Transparent Sticker">
      <div className="space-y-6">
        {/* Live 512x512 Preview Window */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-48 h-48 rounded-2xl checkerboard-pattern p-2 border border-slate-700/80 flex items-center justify-center shadow-xl">
            {previewDataUrl ? (
              <img
                src={previewDataUrl}
                alt="Export Sticker Preview"
                className="max-w-full max-h-full object-contain drop-shadow-md"
              />
            ) : (
              <span className="text-xs text-slate-400">Rendering preview...</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono px-3 py-1 rounded-full border ${
                format === "webp" && fileSizeKB <= 100
                  ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              File Size: {fileSizeKB} KB {format === "webp" && fileSizeKB <= 100 && "✓ (WhatsApp Ready)"}
            </span>
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-white block">Export Format</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat("webp")}
              className={`p-3 rounded-xl border text-left flex flex-col transition-all cursor-pointer ${
                format === "webp"
                  ? "bg-purple-600/30 border-purple-500 text-white shadow-lg"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="font-bold text-sm">WebP Standard</span>
              <span className="text-xs text-slate-400">Under 100 KB limit for WhatsApp/Telegram</span>
            </button>
            <button
              onClick={() => setFormat("png")}
              className={`p-3 rounded-xl border text-left flex flex-col transition-all cursor-pointer ${
                format === "png"
                  ? "bg-purple-600/30 border-purple-500 text-white shadow-lg"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="font-bold text-sm">PNG HD</span>
              <span className="text-xs text-slate-400">High definition transparent graphics</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
          <Button onClick={handleDownload} disabled={isExporting} className="gap-2">
            <Download className="w-4 h-4" /> Download
          </Button>

          <Button variant="secondary" onClick={handleShare} disabled={isExporting} className="gap-2">
            <Share2 className="w-4 h-4" /> Share
          </Button>

          <Button
            variant="outline"
            onClick={handleSaveToCloud}
            isLoading={isSavingCloud}
            disabled={isExporting}
            className="gap-2"
          >
            <CloudUpload className="w-4 h-4" /> Save Cloud
          </Button>
        </div>
      </div>
    </Modal>
  );
};
