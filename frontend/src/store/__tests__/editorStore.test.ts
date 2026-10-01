import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "../editorStore";

describe("editorStore", () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditor();
    useEditorStore.getState().setTemplate({
      id: "test-01",
      name: "Test Cat",
      category: "cats",
      image: "/templates/cat-01.png",
      size: 512,
      faceSlots: [{ x: 100, y: 100, width: 100, height: 100, rotation: 0 }],
    });
  });

  it("should add a face layer and select it", () => {
    const face = { id: "f1", src: "blob:test", x: 10, y: 10, width: 100, height: 100, rotation: 0 };
    useEditorStore.getState().addFace(face);

    const state = useEditorStore.getState();
    expect(state.faces).toHaveLength(1);
    expect(state.faces[0].id).toBe("f1");
    expect(state.selectedId).toBe("f1");
    expect(state.past).toHaveLength(1);
  });

  it("should update a face layer", () => {
    const face = { id: "f1", src: "blob:test", x: 10, y: 10, width: 100, height: 100, rotation: 0 };
    useEditorStore.getState().addFace(face);
    useEditorStore.getState().updateFace("f1", { x: 50, rotation: 45 });

    const state = useEditorStore.getState();
    expect(state.faces[0].x).toBe(50);
    expect(state.faces[0].rotation).toBe(45);
  });

  it("should perform undo and redo correctly", () => {
    const f1 = { id: "f1", src: "blob:1", x: 0, y: 0, width: 100, height: 100, rotation: 0 };
    useEditorStore.getState().addFace(f1);

    expect(useEditorStore.getState().faces).toHaveLength(1);

    useEditorStore.getState().undo();
    expect(useEditorStore.getState().faces).toHaveLength(0);

    useEditorStore.getState().redo();
    expect(useEditorStore.getState().faces).toHaveLength(1);
    expect(useEditorStore.getState().faces[0].id).toBe("f1");
  });

  it("should cap history at 30 snapshots", () => {
    for (let i = 0; i < 40; i++) {
      useEditorStore.getState().addFace({
        id: `f_${i}`,
        src: `blob:${i}`,
        x: i,
        y: i,
        width: 100,
        height: 100,
        rotation: 0,
      });
    }

    const state = useEditorStore.getState();
    expect(state.past.length).toBeLessThanOrEqual(30);
    expect(state.past).toHaveLength(30);
  });
});
