import React from "react";
import { useProjectStore } from "../../store/projectStore";
import { Layers, Eye, EyeOff, Lock, Unlock, Trash2, ArrowUp, ArrowDown, Copy } from "lucide-react";
import { Button } from "../ui/Button";

export const LayersPanel: React.FC = () => {
  const { project, selectedIds, select, updateLayer, removeLayers, moveLayer, addLayer } =
    useProjectStore();

  const layers = project.layers; // bottom to top
  const reversedLayers = [...layers].reverse(); // display top layer first

  const handleDuplicate = (id: string) => {
    const layer = layers.find((l) => l.id === id);
    if (!layer) return;
    const dup = {
      ...JSON.parse(JSON.stringify(layer)),
      id: crypto.randomUUID(),
      name: `${layer.name} Copy`,
      x: layer.x + 20,
      y: layer.y + 20,
    };
    addLayer(dup);
  };

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-white text-base">Layers</h3>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
          {layers.length} Layers
        </span>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {layers.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No layers yet. Add a face or image.</p>
        ) : (
          reversedLayers.map((layer, reverseIdx) => {
            const actualIdx = layers.length - 1 - reverseIdx;
            const isSelected = selectedIds.includes(layer.id);

            return (
              <div
                key={layer.id}
                onClick={() => select([layer.id])}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-purple-600/25 border-purple-500 text-white shadow-md"
                    : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    #{actualIdx + 1}
                  </span>
                  <span className="text-xs font-semibold truncate">{layer.name}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateLayer(layer.id, { visible: !layer.visible });
                    }}
                    className="p-1 text-slate-400 hover:text-white rounded"
                    title="Toggle Visibility"
                  >
                    {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateLayer(layer.id, { locked: !layer.locked });
                    }}
                    className="p-1 text-slate-400 hover:text-white rounded"
                    title="Toggle Lock"
                  >
                    {layer.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate(layer.id);
                    }}
                    className="p-1 text-slate-400 hover:text-white rounded"
                    title="Duplicate Layer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {actualIdx < layers.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayer(layer.id, actualIdx + 1);
                      }}
                      className="p-1 text-slate-400 hover:text-white rounded"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {actualIdx > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayer(layer.id, actualIdx - 1);
                      }}
                      className="p-1 text-slate-400 hover:text-white rounded"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLayers([layer.id]);
                    }}
                    className="p-1 text-slate-400 hover:text-red-400 rounded"
                    title="Delete Layer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
