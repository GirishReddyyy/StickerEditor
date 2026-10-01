import React, { useState, useRef } from "react";
import { useEditorStore } from "../../store/editorStore";
import { useUIStore } from "../../store/uiStore";
import { downscaleImage } from "../../lib/downscaleImage";
import { detectFaces, BoundingBox } from "../../lib/faceDetect";
import { cropFace } from "../../lib/cropFace";
import { cutOutBackground } from "../../lib/removeBg";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Upload, User, AlertCircle, Sparkles, Check } from "lucide-react";

export const PhotoUploadModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { template, addFace, faces } = useEditorStore();
  const { showToast } = useUIStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [detectedFaces, setDetectedFaces] = useState<BoundingBox[]>([]);
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);
    setStatusMessage("Downscaling photo...");

    try {
      // 1. Downscale
      const img = await downscaleImage(file, 1500);
      setSourceImg(img);

      // 2. Detect faces
      setStatusMessage("Finding faces with MediaPipe AI...");
      const boxes = await detectFaces(img);

      if (boxes.length === 0) {
        setErrorMessage("No face found. Try a clearer, front-facing photo or use manual placement.");
        setIsProcessing(false);
        return;
      }

      if (boxes.length > 1) {
        setDetectedFaces(boxes);
        setIsProcessing(false);
        return; // Wait for user face selection
      }

      // Single face detected
      await processSelectedFace(img, boxes[0]);
    } catch (err) {
      console.error("[PhotoUpload] Processing failure:", err);
      setErrorMessage("Something went wrong processing your photo. Try another image.");
      setIsProcessing(false);
    }
  };

  const processSelectedFace = async (img: HTMLImageElement, box: BoundingBox) => {
    setIsProcessing(true);
    setDetectedFaces([]);

    try {
      setStatusMessage("Cropping face with padding...");
      const croppedBlob = await cropFace(img, box, 0.35);

      setStatusMessage("Removing background (first time takes a few seconds)...");
      const cutoutBlob = await cutOutBackground(croppedBlob);

      // Determine face slot placement in template
      const slots = template?.faceSlots || [{ x: 176, y: 110, width: 160, height: 160, rotation: 0 }];
      const slotIndex = faces.length % slots.length;
      const slot = slots[slotIndex];

      const objectUrl = URL.createObjectURL(cutoutBlob);

      addFace({
        id: crypto.randomUUID(),
        src: objectUrl,
        x: slot.x,
        y: slot.y,
        width: slot.width,
        height: slot.height,
        rotation: slot.rotation || 0,
      });

      showToast("Face added to sticker!", "success");
      onClose();
    } catch (err) {
      console.error("[processSelectedFace] error:", err);
      setErrorMessage("Failed to extract face background.");
    } finally {
      setIsProcessing(false);
    }
  };

  const addManualPlainLayer = () => {
    if (!sourceImg) return;
    const slots = template?.faceSlots || [{ x: 176, y: 110, width: 160, height: 160, rotation: 0 }];
    const slotIndex = faces.length % slots.length;
    const slot = slots[slotIndex];

    addFace({
      id: crypto.randomUUID(),
      src: sourceImg.src,
      x: slot.x,
      y: slot.y,
      width: slot.width,
      height: slot.height,
      rotation: slot.rotation || 0,
    });

    showToast("Added photo layer manually!", "info");
    onClose();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Friend's Face">
      <div className="space-y-6">
        {/* Multi-Face Picker Dialog */}
        {detectedFaces.length > 1 && sourceImg && (
          <div className="space-y-4 text-center animate-fadeIn">
            <p className="text-sm text-purple-300 font-medium">
              We found {detectedFaces.length} faces! Tap the face you want to add:
            </p>
            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
              {detectedFaces.map((box, idx) => (
                <button
                  key={idx}
                  onClick={() => processSelectedFace(sourceImg, box)}
                  className="p-2 glass-card rounded-xl border border-purple-500/40 hover:border-purple-400 flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500 flex items-center justify-center bg-slate-800">
                    <User className="w-8 h-8 text-purple-300 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs font-semibold text-white">Face #{idx + 1}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Processing Spinner State */}
        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
              <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-purple-400 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-purple-200">{statusMessage}</p>
          </div>
        )}

        {/* Drag & Drop File Upload Area */}
        {!isProcessing && detectedFaces.length <= 1 && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-purple-500/40 hover:border-purple-400 rounded-2xl p-8 text-center cursor-pointer glass-card hover:bg-slate-800/50 transition-all flex flex-col items-center space-y-3"
          >
            <div className="w-14 h-14 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="font-semibold text-white">Click or drag & drop photo here</p>
              <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, WebP, HEIC</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processFile(file);
              }}
            />
          </div>
        )}

        {/* Error Fallback Options */}
        {errorMessage && (
          <div className="p-4 bg-red-950/60 border border-red-500/40 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-red-300 text-sm font-semibold">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            {sourceImg && (
              <Button size="sm" variant="outline" onClick={addManualPlainLayer} className="w-full">
                Add Photo as Plain Layer
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
