import { Response } from "express";
import fs from "fs";
import path from "path";
import { db } from "../services/db.js";
import { generateSlug } from "../utils/slug.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { env } from "../config/env.js";

const MAX_USER_STICKER_QUOTA = 200;

export async function createSticker(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (!req.file) return res.status(400).json({ error: "No sticker image uploaded." });

  const existingStickers = db.getUserStickers(req.user.id);
  if (existingStickers.length >= MAX_USER_STICKER_QUOTA) {
    // Delete temp upload file
    fs.unlinkSync(req.file.path);
    return res.status(403).json({
      error: `Storage quota exceeded. Maximum ${MAX_USER_STICKER_QUOTA} stickers allowed per user.`,
    });
  }

  const title = req.body.title || "My Sticker";
  const templateId = req.body.templateId || null;
  const imagePath = `/uploads/${req.file.filename}`;
  const shareSlug = generateSlug(10);

  const sticker = db.createSticker({
    userId: req.user.id,
    templateId,
    title,
    imagePath,
    isPublic: false,
    shareSlug,
  });

  const fullImageUrl = `${req.protocol}://${req.get("host")}${sticker.imagePath}`;

  res.status(201).json({
    ...sticker,
    imageUrl: fullImageUrl,
  });
}

export async function getMyStickers(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const stickers = db.getUserStickers(req.user.id);
  const result = stickers.map((s) => ({
    ...s,
    imageUrl: `${req.protocol}://${req.get("host")}${s.imagePath}`,
  }));

  res.json(result);
}

export async function deleteSticker(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params;

  const sticker = db.getStickerById(id);
  if (!sticker || sticker.userId !== req.user.id) {
    return res.status(404).json({ error: "Sticker not found or access denied." });
  }

  // Delete actual file from disk
  const fullPath = path.resolve(process.cwd(), env.UPLOAD_DIR, path.basename(sticker.imagePath));
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (err) {
      console.error("[deleteSticker] File unlink warning:", err);
    }
  }

  db.deleteSticker(id, req.user.id);
  res.json({ message: "Sticker deleted successfully." });
}

export async function shareSticker(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params;

  const sticker = db.getStickerById(id);
  if (!sticker || sticker.userId !== req.user.id) {
    return res.status(404).json({ error: "Sticker not found or access denied." });
  }

  const updated = db.updateSticker(id, { isPublic: true });
  const shareUrl = `${req.protocol}://${req.get("host")}/s/${updated!.shareSlug}`;

  res.json({
    shareSlug: updated!.shareSlug,
    shareUrl,
  });
}

export async function unshareSticker(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params;

  const sticker = db.getStickerById(id);
  if (!sticker || sticker.userId !== req.user.id) {
    return res.status(404).json({ error: "Sticker not found or access denied." });
  }

  db.updateSticker(id, { isPublic: false });
  res.json({ message: "Sticker unshared successfully." });
}

export async function getSharedSticker(req: AuthenticatedRequest, res: Response) {
  const { slug } = req.params;
  const sticker = db.getStickerBySlug(slug);

  if (!sticker || sticker.isQuarantined || !sticker.isPublic) {
    return res.status(404).json({ error: "Shared sticker not found or unavailable." });
  }

  res.json({
    id: sticker.id,
    title: sticker.title,
    shareSlug: sticker.shareSlug,
    createdAt: sticker.createdAt,
    imageUrl: `${req.protocol}://${req.get("host")}${sticker.imagePath}`,
  });
}

export async function reportSticker(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({ error: "Reason is required for safety report." });
  }

  const success = db.reportSticker(id, reason);
  if (!success) {
    return res.status(404).json({ error: "Sticker not found." });
  }

  res.json({ message: "Report submitted. Thank you for keeping StickerCraft safe." });
}
