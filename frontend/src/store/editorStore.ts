import { create } from "zustand";

export type FaceSlot = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  mask?: string;
};

export type TemplateData = {
  id: string;
  name: string;
  category: string;
  image: string;
  size: number;
  faceSlots: FaceSlot[];
};

export type FaceLayer = {
  id: string;
  src: string; // Object URL or data URL
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

export type EditorSnapshot = {
  templateUrl: string;
  faces: FaceLayer[];
  outline: { enabled: boolean; thickness: number };
};

const MAX_HISTORY = 30;

type EditorStoreState = {
  template: TemplateData | null;
  templateUrl: string | null;
  faces: FaceLayer[];
  selectedId: string | null;
  tool: "select" | "cut";
  cutMode: "keep-inside" | "remove-inside";
  feather: number;
  outline: { enabled: boolean; thickness: number };
  past: EditorSnapshot[];
  future: EditorSnapshot[];

  // Actions
  setTemplate: (template: TemplateData) => void;
  addFace: (face: FaceLayer) => void;
  updateFace: (id: string, patch: Partial<FaceLayer>) => void;
  deleteFace: (id: string) => void;
  select: (id: string | null) => void;
  setTool: (tool: "select" | "cut") => void;
  setCutMode: (mode: "keep-inside" | "remove-inside") => void;
  setFeather: (feather: number) => void;
  setOutline: (patch: Partial<{ enabled: boolean; thickness: number }>) => void;
  applyCutResult: (newImageUrl: string) => void;
  undo: () => void;
  redo: () => void;
  resetEditor: () => void;
};

function createSnapshot(state: {
  templateUrl: string | null;
  faces: FaceLayer[];
  outline: { enabled: boolean; thickness: number };
}): EditorSnapshot | null {
  if (!state.templateUrl) return null;
  return {
    templateUrl: state.templateUrl,
    faces: state.faces.map((f) => ({ ...f })),
    outline: { ...state.outline },
  };
}

export const useEditorStore = create<EditorStoreState>((set, get) => ({
  template: null,
  templateUrl: null,
  faces: [],
  selectedId: null,
  tool: "select",
  cutMode: "keep-inside",
  feather: 1.5,
  outline: { enabled: false, thickness: 8 },
  past: [],
  future: [],

  setTemplate: (template) => {
    set({
      template,
      templateUrl: template.image,
      faces: [],
      selectedId: null,
      tool: "select",
      past: [],
      future: [],
    });
  },

  addFace: (face) => {
    const snap = createSnapshot(get());
    set((state) => {
      const newPast = snap ? [...state.past, snap].slice(-MAX_HISTORY) : state.past;
      return {
        faces: [...state.faces, face],
        selectedId: face.id,
        past: newPast,
        future: [],
      };
    });
  },

  updateFace: (id, patch) => {
    set((state) => ({
      faces: state.faces.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }));
  },

  deleteFace: (id) => {
    const snap = createSnapshot(get());
    set((state) => {
      const newPast = snap ? [...state.past, snap].slice(-MAX_HISTORY) : state.past;
      return {
        faces: state.faces.filter((f) => f.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId,
        past: newPast,
        future: [],
      };
    });
  },

  select: (id) => set({ selectedId: id }),

  setTool: (tool) => set({ tool, selectedId: tool === "cut" ? null : get().selectedId }),

  setCutMode: (mode) => set({ cutMode: mode }),

  setFeather: (feather) => set({ feather }),

  setOutline: (patch) => {
    set((state) => ({
      outline: { ...state.outline, ...patch },
    }));
  },

  applyCutResult: (newImageUrl) => {
    const snap = createSnapshot(get());
    set((state) => {
      const newPast = snap ? [...state.past, snap].slice(-MAX_HISTORY) : state.past;
      return {
        templateUrl: newImageUrl,
        faces: [],
        selectedId: null,
        tool: "select",
        past: newPast,
        future: [],
      };
    });
  },

  undo: () => {
    const { past, future, templateUrl, faces, outline } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const currentSnap: EditorSnapshot = {
      templateUrl: templateUrl || "",
      faces: faces.map((f) => ({ ...f })),
      outline: { ...outline },
    };

    set({
      templateUrl: previous.templateUrl,
      faces: previous.faces,
      outline: previous.outline,
      past: newPast,
      future: [currentSnap, ...future].slice(0, MAX_HISTORY),
      selectedId: null,
    });
  },

  redo: () => {
    const { past, future, templateUrl, faces, outline } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);
    const currentSnap: EditorSnapshot = {
      templateUrl: templateUrl || "",
      faces: faces.map((f) => ({ ...f })),
      outline: { ...outline },
    };

    set({
      templateUrl: next.templateUrl,
      faces: next.faces,
      outline: next.outline,
      past: [...past, currentSnap].slice(-MAX_HISTORY),
      future: newFuture,
      selectedId: null,
    });
  },

  resetEditor: () =>
    set({
      template: null,
      templateUrl: null,
      faces: [],
      selectedId: null,
      tool: "select",
      past: [],
      future: [],
    }),
}));
