import { Router } from "express";
import {
  createSticker,
  getMyStickers,
  deleteSticker,
  shareSticker,
  unshareSticker,
  getSharedSticker,
  reportSticker,
} from "../controllers/stickers.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadStickerFile } from "../middleware/upload.js";
import { reportRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/", requireAuth, uploadStickerFile.single("file"), createSticker);
router.get("/", requireAuth, getMyStickers);
router.delete("/:id", requireAuth, deleteSticker);
router.post("/:id/share", requireAuth, shareSticker);
router.post("/:id/unshare", requireAuth, unshareSticker);
router.get("/shared/:slug", getSharedSticker);
router.post("/:id/report", reportRateLimiter, reportSticker);

export default router;
