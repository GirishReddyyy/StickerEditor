import { Response } from "express";
import { db } from "../services/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

export async function getReportedStickers(req: AuthenticatedRequest, res: Response) {
  const stickers = db.getUserStickers("all"); // search database
  // Filter stickers that have reports or are quarantined
  const reported = db["data"].stickers
    .filter((s) => s.reportsCount > 0 || s.isQuarantined)
    .map((s) => ({
      ...s,
      imageUrl: `${req.protocol}://${req.get("host")}${s.imagePath}`,
    }));

  res.json(reported);
}

export async function restoreSticker(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const sticker = db.updateSticker(id, {
    reportsCount: 0,
    isQuarantined: false,
    isPublic: true,
  });

  if (!sticker) return res.status(404).json({ error: "Sticker not found" });
  res.json({ message: "Sticker restored to public view.", sticker });
}

export async function removeSticker(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const sticker = db.getStickerById(id);
  if (!sticker) return res.status(404).json({ error: "Sticker not found" });

  db.deleteSticker(id, sticker.userId);
  res.json({ message: "Sticker permanently removed." });
}
