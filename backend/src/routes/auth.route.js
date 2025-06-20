import express from "express";
import { 
    signup, 
    login, 
    logout, 
    getMe, 
    updateProfile, 
    changePassword 
} from "../controllers/auth.controller.js";
import { protectRoute, createRateLimit } from "../middleware/auth.middleware.js";

const router = express.Router();

// Rate limiting for auth routes
const authRateLimit = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    10, // 10 attempts
    "Too many authentication attempts, please try again later"
);

const passwordChangeRateLimit = createRateLimit(
    60 * 60 * 1000, // 1 hour
    3, // 3 attempts
    "Too many password change attempts, please try again later"
);

// Public routes
router.post("/signup", authRateLimit, signup);
router.post("/login", authRateLimit, login);

// Protected routes
router.post("/logout", protectRoute, logout);
router.get("/me", protectRoute, getMe);
router.put("/profile", protectRoute, updateProfile);
router.put("/change-password", protectRoute, passwordChangeRateLimit, changePassword);

// Health check for auth service
router.get("/health", (req, res) => {
    res.status(200).json({ 
        message: "Auth service is healthy",
        timestamp: new Date().toISOString()
    });
});

export default router;