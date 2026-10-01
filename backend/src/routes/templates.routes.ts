import { Router } from "express";
import { getTemplates, getTemplateById } from "../controllers/templates.controller.js";

const router = Router();

router.get("/", getTemplates);
router.get("/:id", getTemplateById);

export default router;
