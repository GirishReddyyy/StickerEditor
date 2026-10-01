export type Effects = {
  brightness: number; // -1 to 1
  contrast: number; // -100 to 100
  saturation: number; // -1 to 1
  hue: number; // 0 to 360
  blur: number; // 0 to 20
  shadow?: { color: string; blur: number; offsetX: number; offsetY: number; opacity: number };
  outline?: { color: string; thickness: number };
  tint?: { color: string; amount: number };
};

export const defaultEffects: Effects = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  blur: 0,
};

export type MaskOp =
  | { kind: "keep-inside" | "remove-inside"; pathData: string; feather: number }
  | { kind: "erase" | "restore"; points: number[]; size: number; hardness: number }
  | { kind: "bitmap"; maskAssetId: string };

export type BaseLayer = {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  blendMode: GlobalCompositeOperation;
  effects: Effects;
  parentId?: string;
};

export type ImageLayer = BaseLayer & {
  type: "image";
  assetId: string;
  width: number;
  height: number;
  flipX: boolean;
  flipY: boolean;
  maskOps: MaskOp[];
};

export type TextLayer = BaseLayer & {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  curved?: boolean;
};

export type ShapeLayer = BaseLayer & {
  type: "shape";
  shape: "rect" | "circle" | "star" | "polygon";
  width: number;
  height: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
};

export type DrawingLayer = BaseLayer & {
  type: "drawing";
  strokes: { points: number[]; color: string; size: number; opacity: number }[];
};

export type Layer = ImageLayer | TextLayer | ShapeLayer | DrawingLayer;

export type Asset = { url: string; width: number; height: number };

export type Project = {
  id: string;
  name: string;
  canvas: { width: number; height: number; background: "transparent" | string };
  layers: Layer[]; // bottom to top
  assets: Record<string, Asset>;
};
