import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../utils/jwt.js";
import { db } from "../services/db.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: "user" | "admin";
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required. Token missing." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyToken(token);
    const user = db.findUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: "User session invalid or deleted." });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.email === "admin@stickercraft.app" ? "admin" : "user",
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const payload = verifyToken(token);
      const user = db.findUserById(payload.userId);
      if (user) {
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.email === "admin@stickercraft.app" ? "admin" : "user",
        };
      }
    } catch (err) {
      // Ignore invalid token for optional auth
    }
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden. Admin privileges required." });
  }
  next();
}
