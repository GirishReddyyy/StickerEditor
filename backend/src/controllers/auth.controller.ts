import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "../services/db.js";
import { generateToken } from "../utils/jwt.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

export async function register(req: Request, res: Response) {
  const { username, email, password } = req.body;

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: "An account with this email already exists." });
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = db.createUser(username, email, passwordHash);
  const token = generateToken({ userId: user.id, username: user.username });

  res.status(201).json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.email === "admin@stickercraft.app" ? "admin" : "user",
    },
    token,
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = generateToken({ userId: user.id, username: user.username });

  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.email === "admin@stickercraft.app" ? "admin" : "user",
    },
    token,
  });
}

export async function me(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  res.json({ user: req.user });
}

export async function deleteAccount(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  // Account deletion removes user's stickers
  const userStickers = db.getUserStickers(req.user.id);
  for (const s of userStickers) {
    db.deleteSticker(s.id, req.user.id);
  }
  res.json({ message: "Account and associated stickers deleted successfully." });
}
