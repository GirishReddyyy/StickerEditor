import { describe, it, expect, beforeEach } from "vitest";
import { useProjectStore } from "../projectStore";
import type { ImageLayer } from "../../types/project";

describe("projectStore", () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
  });

  it("should add a layer and select it", () => {
    const layer: ImageLayer = {
      id: "l1",
      name: "Cat Face",
      type: "image",
      assetId: "a1",
      width: 100,
      height: 100,
      x: 10,
      y: 10,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      flipX: false,
      flipY: false,
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: "source-over",
      effects: { brightness: 0, contrast: 0, saturation: 0, hue: 0, blur: 0 },
      maskOps: [],
    };

    useProjectStore.getState().addLayer(layer);
    const state = useProjectStore.getState();

    expect(state.project.layers).toHaveLength(1);
    expect(state.selectedIds).toEqual(["l1"]);
    expect(state.past).toHaveLength(1);
  });

  it("should support undo and redo", () => {
    const layer: ImageLayer = {
      id: "l1",
      name: "Cat Face",
      type: "image",
      assetId: "a1",
      width: 100,
      height: 100,
      x: 10,
      y: 10,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      flipX: false,
      flipY: false,
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: "source-over",
      effects: { brightness: 0, contrast: 0, saturation: 0, hue: 0, blur: 0 },
      maskOps: [],
    };

    useProjectStore.getState().addLayer(layer);
    expect(useProjectStore.getState().project.layers).toHaveLength(1);

    useProjectStore.getState().undo();
    expect(useProjectStore.getState().project.layers).toHaveLength(0);

    useProjectStore.getState().redo();
    expect(useProjectStore.getState().project.layers).toHaveLength(1);
  });

  it("should cap history at 50 steps", () => {
    for (let i = 0; i < 60; i++) {
      useProjectStore.getState().addLayer({
        id: `l_${i}`,
        name: `Layer ${i}`,
        type: "image",
        assetId: "a1",
        width: 100,
        height: 100,
        x: i,
        y: i,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        flipX: false,
        flipY: false,
        visible: true,
        locked: false,
        opacity: 1,
        blendMode: "source-over",
        effects: { brightness: 0, contrast: 0, saturation: 0, hue: 0, blur: 0 },
        maskOps: [],
      });
    }

    expect(useProjectStore.getState().past.length).toBe(50);
  });
});
