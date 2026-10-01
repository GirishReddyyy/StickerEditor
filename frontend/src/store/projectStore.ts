import { create } from "zustand";
import type { Layer, Project, Asset } from "../types/project";

const HISTORY_LIMIT = 50;

type ProjectStoreState = {
  project: Project;
  selectedIds: string[];
  past: Project[];
  future: Project[];

  // Actions
  setProject: (project: Project) => void;
  commit: (next: Project) => void;
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, patch: Partial<Layer>) => void;
  removeLayers: (ids: string[]) => void;
  moveLayer: (id: string, toIndex: number) => void;
  addAsset: (id: string, asset: Asset) => void;
  select: (ids: string[]) => void;
  undo: () => void;
  redo: () => void;
  resetProject: () => void;
};

const emptyProject = (): Project => ({
  id: crypto.randomUUID(),
  name: "Untitled Sticker",
  canvas: { width: 512, height: 512, background: "transparent" },
  layers: [],
  assets: {},
});

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  project: emptyProject(),
  selectedIds: [],
  past: [],
  future: [],

  setProject: (project) => {
    set({
      project,
      selectedIds: [],
      past: [],
      future: [],
    });
  },

  commit: (next) => {
    set((s) => ({
      past: [...s.past, JSON.parse(JSON.stringify(s.project))].slice(-HISTORY_LIMIT),
      future: [],
      project: next,
    }));
  },

  addLayer: (layer) => {
    const p = get().project;
    get().commit({ ...p, layers: [...p.layers, layer] });
    set({ selectedIds: [layer.id] });
  },

  updateLayer: (id, patch) => {
    const p = get().project;
    get().commit({
      ...p,
      layers: p.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)),
    });
  },

  removeLayers: (ids) => {
    const p = get().project;
    get().commit({ ...p, layers: p.layers.filter((l) => !ids.includes(l.id)) });
    set({ selectedIds: [] });
  },

  moveLayer: (id, toIndex) => {
    const p = get().project;
    const from = p.layers.findIndex((l) => l.id === id);
    if (from < 0) return;
    const layers = [...p.layers];
    const [item] = layers.splice(from, 1);
    layers.splice(toIndex, 0, item);
    get().commit({ ...p, layers });
  },

  addAsset: (id, asset) => {
    set((s) => ({
      project: {
        ...s.project,
        assets: { ...s.project.assets, [id]: asset },
      },
    }));
  },

  select: (ids) => set({ selectedIds: ids }),

  undo: () => {
    set((s) => {
      if (!s.past.length) return s;
      const prev = s.past[s.past.length - 1];
      const newPast = s.past.slice(0, -1);
      return {
        project: prev,
        past: newPast,
        future: [JSON.parse(JSON.stringify(s.project)), ...s.future].slice(0, HISTORY_LIMIT),
        selectedIds: [],
      };
    });
  },

  redo: () => {
    set((s) => {
      if (!s.future.length) return s;
      const [next, ...rest] = s.future;
      return {
        project: next,
        past: [...s.past, JSON.parse(JSON.stringify(s.project))].slice(-HISTORY_LIMIT),
        future: rest,
        selectedIds: [],
      };
    });
  },

  resetProject: () =>
    set({
      project: emptyProject(),
      selectedIds: [],
      past: [],
      future: [],
    }),
}));
