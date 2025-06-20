import express from "express";
import { 
    createHabit,
    getHabits,
    getHabitById,
    updateHabit,
    deleteHabit,
    markHabit,
    getHabitProgress,
    archiveHabit,
    getHabitStats
} from "../controllers/habit.controller.js";
import { protectRoute, createRateLimit } from "../middleware/auth.middleware.js";

const router = express.Router();

// Rate limiting for habit operations
const habitCreationRateLimit = createRateLimit(
    60 * 60 * 1000, // 1 hour
    20, // 20 habit creations per hour
    "Too many habit creation attempts, please try again later"
);

const habitUpdateRateLimit = createRateLimit(
    60 * 1000, // 1 minute
    30, // 30 updates per minute
    "Too many habit updates, please slow down"
);

// All habit routes require authentication
router.use(protectRoute);

// Stats route must come before /:id routes to avoid conflicts
router.get("/stats", getHabitStats);

// Habit CRUD routes
router.post("/", habitCreationRateLimit, createHabit);
router.get("/", getHabits);
router.get("/:id", getHabitById);
router.put("/:id", habitUpdateRateLimit, updateHabit);
router.delete("/:id", deleteHabit);

// Habit-specific action routes
router.put("/:id/mark", markHabit);
router.get("/:id/progress", getHabitProgress);
router.put("/:id/archive", archiveHabit);

// Health check for habits service
router.get("/health", (req, res) => {
    res.status(200).json({ 
        message: "Habits service is healthy",
        timestamp: new Date().toISOString(),
        user: req.user ? req.user._id : null
    });
});

export default router;