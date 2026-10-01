import React from "react";
import { useEditorStore } from "../../store/editorStore";
import { Slider } from "../ui/Slider";
import { Sparkles, Trash2, Eye, Info, Layers } from "lucide-react";
import { Button } from "../ui/Button";

export const PropertiesPanel: React.FC = () => {
  const {
    outline,
    setOutline,
    cutMode,
    setCutMode,
    feather,
    setFeather,
    selectedId,
    deleteFace,
    faces,
  } = useEditorStore();

  const selectedFace = faces.find((f) => f.id === selectedId);

  return (
    <div className="space-y-6 glass-panel p-5 rounded-2xl border border-slate-800 text-slate-200">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="font-bold text-white text-lg">Sticker Controls</h3>
      </div>

      {/* White Outline Border Settings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" /> White Sticker Outline
          </label>
          <input
            type="checkbox"
            checked={outline.enabled}
            onChange={(e) => setOutline({ enabled: e.target.checked })}
            className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
          />
        </div>

        {outline.enabled && (
          <Slider
            label="Border Thickness"
            value={outline.thickness}
            min={2}
            max={24}
            unit="px"
            onChange={(val) => setOutline({ thickness: val })}
          />
        )}
      </div>

      {/* Cut Tool Settings */}
      <div className="space-y-3 pt-3 border-t border-slate-800">
        <label className="text-sm font-semibold text-white block">Cut Mode</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setCutMode("keep-inside")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
              cutMode === "keep-inside"
                ? "bg-purple-600/30 text-purple-300 border-purple-500 shadow-md"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
            }`}
          >
            Keep Inside
          </button>
          <button
            onClick={() => setCutMode("remove-inside")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
              cutMode === "remove-inside"
                ? "bg-purple-600/30 text-purple-300 border-purple-500 shadow-md"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
            }`}
          >
            Remove Inside
          </button>
        </div>

        <Slider
          label="Edge Feathering"
          value={feather}
          min={0}
          max={6}
          step={0.5}
          unit="px"
          onChange={(val) => setFeather(val)}
        />
      </div>

      {/* Selected Face Layer Control */}
      {selectedFace && (
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <label className="text-sm font-semibold text-white block">Selected Face Layer</label>
          <Button
            variant="danger"
            size="sm"
            onClick={() => deleteFace(selectedFace.id)}
            className="w-full gap-2"
          >
            <Trash2 className="w-4 h-4" /> Remove Selected Layer
          </Button>
        </div>
      )}

      {/* Keyboard Shortcuts Tips */}
      <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-1">
          <Info className="w-4 h-4 text-purple-400" /> Keyboard Shortcuts
        </div>
        <div className="flex justify-between font-mono bg-slate-900/60 p-2 rounded-lg">
          <span>Undo / Redo</span>
          <span className="text-purple-300">Ctrl+Z / Ctrl+Shift+Z</span>
        </div>
        <div className="flex justify-between font-mono bg-slate-900/60 p-2 rounded-lg">
          <span>Delete Layer</span>
          <span className="text-purple-300">Del / Backspace</span>
        </div>
      </div>
    </div>
  );
};
