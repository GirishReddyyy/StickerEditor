import paper from "paper";

export type Pt = { x: number; y: number };

let paperInitialized = false;

function initPaper() {
  if (!paperInitialized) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    paper.setup(canvas);
    paperInitialized = true;
  }
}

export function smoothPath(points: Pt[], tolerance = 3): string {
  if (points.length < 3) return "";

  try {
    initPaper();
    paper.project.clear();

    const path = new paper.Path();
    points.forEach((p) => path.add(new paper.Point(p.x, p.y)));
    path.closed = true;

    path.simplify(tolerance);
    path.smooth({ type: "catmull-rom", factor: 0.5 });

    return path.pathData || "";
  } catch (err) {
    console.warn("[smoothPath] Fallback polyline path calculation:", err);
    return (
      "M " +
      points.map((p) => `${Math.round(p.x)} ${Math.round(p.y)}`).join(" L ") +
      " Z"
    );
  }
}
