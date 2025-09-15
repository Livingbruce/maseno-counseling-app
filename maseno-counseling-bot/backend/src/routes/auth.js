import express from "express";
import { login, me, changePassword, updateProfile } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authLimiter, detectAISpam, validateInput } from "../middleware/security.js";
import { validateLogin, validatePasswordChange, validateProfileUpdate } from "../middleware/validation.js";

const router = express.Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

router.post("/login", validateLogin, validateInput, detectAISpam, login);
router.get("/me", authMiddleware, me);
router.put("/password", authMiddleware, validatePasswordChange, validateInput, changePassword);
router.put("/profile", authMiddleware, validateProfileUpdate, validateInput, updateProfile);

export default router;