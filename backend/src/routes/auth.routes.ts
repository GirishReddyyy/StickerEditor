import { Router } from "express";
import { register, login, me, deleteAccount, registerSchema, loginSchema } from "../controllers/auth.controller.js";
import { validateRequest } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/register", authRateLimiter, validateRequest(registerSchema), register);
router.post("/login", authRateLimiter, validateRequest(loginSchema), login);
router.get("/me", requireAuth, me);
router.delete("/account", requireAuth, deleteAccount);

export default router;
