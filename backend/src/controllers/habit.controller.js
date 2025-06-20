import Habit from "../models/habit.model.js";
import mongoose from "mongoose";

// Helper function to get start of day
const getStartOfDay = (date = new Date()) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay;
};

// Helper function to get end of day
const getEndOfDay = (date = new Date()) => {
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
};

export const createHabit = async (req, res) => {
    try {
        const { name, description, reminderTime, category, difficulty, color } = req.body;
        const userId = req.user._id;
        
        // Validation
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ 
                message: "Habit name is required" 
            });
        }
        
        // Create habit
        const habit = new Habit({
            name: name.trim(),
            description: description?.trim() || "",
            userId,
            reminderTime: reminderTime || null,
            category: category || "other",
            difficulty: difficulty || "medium",
            color: color || "#3B82F6"
        });
        
        await habit.save();
        
        res.status(201).json({
            message: "Habit created successfully",
            habit: {
                ...habit.toObject(),
                completedToday: false
            }
        });
        
    } catch (error) {
        console.error("Create habit error:", error);
        
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: "Validation error",
                errors: messages
            });
        }
        
        res.status(500).json({ 
            message: "Internal server error while creating habit" 
        });
    }
};

export const getHabits = async (req, res) => {
    try {
        const userId = req.user._id;
        const { includeArchived = false, category, limit = 50, page = 1 } = req.query;
        
        // Build query
        const query = { 
            userId,
            isActive: true
        };
        
        if (!includeArchived || includeArchived === "false") {
            query.isArchived = false;
        }
        
        if (category && category !== "all") {
            query.category = category;
        }
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get habits with pagination
        const habits = await Habit.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);
        
        // Get total count for pagination
        const totalCount = await Habit.countDocuments(query);
        
        // Add today's completion status
        const habitsWithStatus = habits.map(habit => ({
            ...habit.toObject(),
            completedToday: habit.isCompletedToday()
        }));
        
        res.status(200).json({
            message: "Habits retrieved successfully",
            habits: habitsWithStatus,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / parseInt(limit)),
                totalHabits: totalCount,
                hasMore: skip + habits.length < totalCount
            }
        });
        
    } catch (error) {
        console.error("Get habits error:", error);
        res.status(500).json({ 
            message: "Internal server error while fetching habits" 
        });
    }
};

export const getHabitById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                message: "Invalid habit ID" 
            });
        }
        
        const habit = await Habit.findOne({ _id: id, userId });
        
        if (!habit) {
            return res.status(404).json({ 
                message: "Habit not found" 
            });
        }
        
        res.status(200).json({
            message: "Habit retrieved successfully",
            habit: {
                ...habit.toObject(),
                completedToday: habit.isCompletedToday()
            }
        });
        
    } catch (error) {
        console.error("Get habit error:", error);
        res.status(500).json({ 
            message: "Internal server error while fetching habit" 
        });
    }
};

export const updateHabit = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { name, description, reminderTime, category, difficulty, color, isActive } = req.body;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                message: "Invalid habit ID" 
            });
        }
        
        // Build update object
        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (reminderTime !== undefined) updateData.reminderTime = reminderTime;
        if (category !== undefined) updateData.category = category;
        if (difficulty !== undefined) updateData.difficulty = difficulty;
        if (color !== undefined) updateData.color = color;
        if (isActive !== undefined) updateData.isActive = isActive;
        
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ 
                message: "No valid fields to update" 
            });
        }
        
        const habit = await Habit.findOneAndUpdate(
            { _id: id, userId },
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!habit) {
            return res.status(404).json({ 
                message: "Habit not found" 
            });
        }
        
        res.status(200).json({
            message: "Habit updated successfully",
            habit: {
                ...habit.toObject(),
                completedToday: habit.isCompletedToday()
            }
        });
        
    } catch (error) {
        console.error("Update habit error:", error);
        
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: "Validation error",
                errors: messages
            });
        }
        
        res.status(500).json({ 
            message: "Internal server error while updating habit" 
        });
    }
};

export const deleteHabit = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                message: "Invalid habit ID" 
            });
        }
        
        const habit = await Habit.findOneAndDelete({ _id: id, userId });
        
        if (!habit) {
            return res.status(404).json({ 
                message: "Habit not found" 
            });
        }
        
        res.status(200).json({ 
            message: "Habit deleted successfully",
            deletedHabit: {
                id: habit._id,
                name: habit.name
            }
        });
        
    } catch (error) {
        console.error("Delete habit error:", error);
        res.status(500).json({ 
            message: "Internal server error while deleting habit" 
        });
    }
};

export const markHabit = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { completed = true, notes = "", date } = req.body;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                message: "Invalid habit ID" 
            });
        }
        
        // Use provided date or today
        const targetDate = date ? new Date(date) : new Date();
        const startOfTargetDay = getStartOfDay(targetDate);
        
        const habit = await Habit.findOne({ _id: id, userId });
        
        if (!habit) {
            return res.status(404).json({ 
                message: "Habit not found" 
            });
        }
        
        // Find existing record for the target date
        const existingRecordIndex = habit.completionRecords.findIndex(record => {
            const recordDate = getStartOfDay(record.date);
            return recordDate.getTime() === startOfTargetDay.getTime();
        });
        
        if (existingRecordIndex >= 0) {
            // Update existing record
            habit.completionRecords[existingRecordIndex].completed = completed;
            habit.completionRecords[existingRecordIndex].notes = notes;
        } else {
            // Add new record
            habit.completionRecords.push({
                date: startOfTargetDay,
                completed,
                notes
            });
        }
        
        await habit.save();
        
        const isCompletedToday = habit.isCompletedToday();
        
        res.status(200).json({
            message: `Habit ${completed ? 'marked as completed' : 'unmarked'} successfully`,
            habit: {
                ...habit.toObject(),
                completedToday: isCompletedToday
            },
            record: {
                date: startOfTargetDay,
                completed,
                notes
            }
        });
        
    } catch (error) {
        console.error("Mark habit error:", error);
        res.status(500).json({ 
            message: "Internal server error while marking habit" 
        });
    }
};

export const getHabitProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { days = 7 } = req.query;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                message: "Invalid habit ID" 
            });
        }
        
        const habit = await Habit.findOne({ _id: id, userId });
        
        if (!habit) {
            return res.status(404).json({ 
                message: "Habit not found" 
            });
        }
        
        const daysCount = Math.min(Math.max(parseInt(days), 1), 365); // Limit between 1-365 days
        const history = habit.getCompletionHistory(daysCount);
        
        // Calculate statistics
        const completedDays = history.filter(day => day.completed).length;
        const completionRate = daysCount > 0 ? (completedDays / daysCount) * 100 : 0;
        
        res.status(200).json({
            message: "Habit progress retrieved successfully",
            progress: {
                habitId: habit._id,
                habitName: habit.name,
                days: daysCount,
                history,
                statistics: {
                    completedDays,
                    totalDays: daysCount,
                    completionRate: Math.round(completionRate * 100) / 100,
                    currentStreak: habit.streak,
                    longestStreak: habit.longestStreak,
                    totalCompletions: habit.totalCompletions
                }
            }
        });
        
    } catch (error) {
        console.error("Get habit progress error:", error);
        res.status(500).json({ 
            message: "Internal server error while fetching habit progress" 
        });
    }
};

export const archiveHabit = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { archive = true } = req.body;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                message: "Invalid habit ID" 
            });
        }
        
        const habit = await Habit.findOneAndUpdate(
            { _id: id, userId },
            { isArchived: archive },
            { new: true }
        );
        
        if (!habit) {
            return res.status(404).json({ 
                message: "Habit not found" 
            });
        }
        
        res.status(200).json({
            message: `Habit ${archive ? 'archived' : 'unarchived'} successfully`,
            habit: {
                ...habit.toObject(),
                completedToday: habit.isCompletedToday()
            }
        });
        
    } catch (error) {
        console.error("Archive habit error:", error);
        res.status(500).json({ 
            message: "Internal server error while archiving habit" 
        });
    }
};

export const getHabitStats = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get all active habits
        const activeHabits = await Habit.find({ 
            userId, 
            isActive: true, 
            isArchived: false 
        });
        
        // Calculate today's completion
        const today = new Date();
        const habitsCompletedToday = activeHabits.filter(habit => habit.isCompletedToday()).length;
        
        // Calculate this week's average
        const weekHistory = activeHabits.map(habit => habit.getCompletionHistory(7));
        const weeklyCompletions = weekHistory.flat().filter(day => day.completed).length;
        const weeklyAverage = activeHabits.length > 0 ? 
            Math.round((weeklyCompletions / (activeHabits.length * 7)) * 100) : 0;
        
        // Get longest streak across all habits
        const longestStreak = activeHabits.reduce((max, habit) => 
            Math.max(max, habit.longestStreak), 0);
        
        // Total habits count
        const totalHabits = await Habit.countDocuments({ userId, isActive: true });
        const archivedHabits = await Habit.countDocuments({ userId, isArchived: true });
        
        res.status(200).json({
            message: "Habit statistics retrieved successfully",
            stats: {
                totalActiveHabits: totalHabits,
                archivedHabits,
                habitsCompletedToday,
                todayCompletionRate: totalHabits > 0 ? 
                    Math.round((habitsCompletedToday / totalHabits) * 100) : 0,
                weeklyCompletionRate: weeklyAverage,
                longestStreakOverall: longestStreak,
                categoriesUsed: [...new Set(activeHabits.map(h => h.category))].length
            }
        });
        
    } catch (error) {
        console.error("Get habit stats error:", error);
        res.status(500).json({ 
            message: "Internal server error while fetching habit statistics" 
        });
    }
};