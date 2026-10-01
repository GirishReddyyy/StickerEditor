import React from "react";
import { useEditorStore } from "../../store/editorStore";
import { MousePointer, Scissors, Undo2, Redo2, Download, UserPlus } from "lucide-react";
import { Button } from "../ui/Button";

export const Toolbar: React.FC<{
  onOpenUpload: () => void;
  onOpenExport: () => void;
}> = ({ onOpenUpload, onOpenExport }) => {
  const { tool, setTool, undo, redo, past, future } = useEditorStore();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 glass-panel rounded-2xl border border-slate-800">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={tool === "select" ? "primary" : "secondary"}
          onClick={() => setTool("select")}
          className="gap-2 min-h-[44px]"
        >
          <MousePointer className="w-4 h-4" />
          <span>Select</span>
        </Button>

        <Button
          size="sm"
          variant={tool === "cut" ? "primary" : "secondary"}
          onClick={() => setTool("cut")}
          className="gap-2 min-h-[44px]"
        >
          <Scissors className="w-4 h-4" />
          <span>Cut Tool</span>
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={past.length === 0}
          className="p-2.5 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 rounded-xl hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Undo (Ctrl+Z)"
          aria-label="Undo action"
        >
          <Undo2 className="w-5 h-5" />
        </button>

        <button
          onClick={redo}
          disabled={future.length === 0}
          className="p-2.5 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 rounded-xl hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo action"
        >
          <Redo2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onOpenUpload} className="gap-2">
          <UserPlus className="w-4 h-4" />
          <span>Add Face</span>
        </Button>

        <Button size="sm" onClick={onOpenExport} className="gap-2">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </Button>
      </div>
    </div>
  );
};
