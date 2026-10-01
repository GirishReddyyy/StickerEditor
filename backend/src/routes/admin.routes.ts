import { Router } from "express";
import { getReportedStickers, restoreSticker, removeSticker } from "../controllers/admin.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/reports", getReportedStickers);
router.post("/reports/:id/restore", restoreSticker);
router.post("/reports/:id/remove", removeSticker);

export default router;
