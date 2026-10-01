import { Request, Response } from "express";
import { db } from "../services/db.js";

export async function getTemplates(req: Request, res: Response) {
  const category = req.query.category as string | undefined;
  const templates = db.getTemplates(category);
  res.json(templates);
}

export async function getTemplateById(req: Request, res: Response) {
  const template = db.getTemplateById(req.params.id);
  if (!template) {
    return res.status(404).json({ error: "Template not found" });
  }
  res.json(template);
}
