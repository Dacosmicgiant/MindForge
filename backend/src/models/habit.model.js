import mongoose from "mongoose";

const completionRecordSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    completed: {
        type: Boolean,
        required: true,
        default: false
    },
    notes: {
        type: String,
        maxlength: 200,
        default: ""
    }
}, { _id: false });

const habitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Habit name is required"],
        trim: true,
        maxlength: [100, "Habit name cannot exceed 100 characters"]
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, "Description cannot exceed 500 characters"],
        default: ""
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    reminderTime: {
        type: String, // Format: "HH:MM" (24-hour format)
        validate: {
            validator: function(v) {
                return !v || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: "Reminder time must be in HH:MM format (24-hour)"
        },
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    streak: {
        type: Number,
        default: 0,
        min: 0
    },
    longestStreak: {
        type: Number,
        default: 0,
        min: 0
    },
    totalCompletions: {
        type: Number,
        default: 0,
        min: 0
    },
    completionRecords: [completionRecordSchema],
    category: {
        type: String,
        enum: ["health", "productivity", "learning", "fitness", "personal", "other"],
        default: "other"
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium"
    },
    color: {
        type: String,
        default: "#3B82F6", // Default blue color
        validate: {
            validator: function(v) {
                return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
            },
            message: "Color must be a valid hex color code"
        }
    }
}, { 
    timestamps: true 
});

// Index for efficient queries
habitSchema.index({ userId: 1, isActive: 1 });
habitSchema.index({ userId: 1, isArchived: 1 });
habitSchema.index({ "completionRecords.date": 1 });

// Instance method to check if habit is completed today
habitSchema.methods.isCompletedToday = function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRecord = this.completionRecords.find(record => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === today.getTime();
    });
    
    return todayRecord ? todayRecord.completed : false;
};

// Instance method to get completion status for last N days
habitSchema.methods.getCompletionHistory = function(days = 7) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);
    
    const history = [];
    
    for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        currentDate.setHours(0, 0, 0, 0);
        
        const record = this.completionRecords.find(record => {
            const recordDate = new Date(record.date);
            recordDate.setHours(0, 0, 0, 0);
            return recordDate.getTime() === currentDate.getTime();
        });
        
        history.push({
            date: new Date(currentDate),
            completed: record ? record.completed : false,
            notes: record ? record.notes : ""
        });
    }
    
    return history;
};

// Instance method to calculate current streak
habitSchema.methods.calculateStreak = function() {
    if (this.completionRecords.length === 0) return 0;
    
    // Sort records by date in descending order
    const sortedRecords = this.completionRecords
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const record of sortedRecords) {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today - recordDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak && record.completed) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
};

// Instance method to update streaks and total completions
habitSchema.methods.updateStats = function() {
    this.totalCompletions = this.completionRecords.filter(record => record.completed).length;
    this.streak = this.calculateStreak();
    this.longestStreak = Math.max(this.longestStreak, this.streak);
};

// Pre-save middleware to update stats
habitSchema.pre("save", function(next) {
    if (this.isModified("completionRecords")) {
        this.updateStats();
    }
    next();
});

// Static method to get habits for user with today's status
habitSchema.statics.getHabitsWithTodayStatus = async function(userId) {
    const habits = await this.find({ 
        userId, 
        isActive: true, 
        isArchived: false 
    }).sort({ createdAt: -1 });
    
    return habits.map(habit => ({
        ...habit.toObject(),
        completedToday: habit.isCompletedToday()
    }));
};

const Habit = mongoose.model("Habit", habitSchema);

export default Habit;