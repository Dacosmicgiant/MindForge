import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/user.model.js";
import Habit from "../src/models/habit.model.js";

dotenv.config();

const sampleUsers = [
  {
    email: "demo@example.com",
    password: "demo123456",
    name: "Demo User"
  },
  {
    email: "john@example.com", 
    password: "john123456",
    name: "John Doe"
  }
];

const sampleHabits = [
  {
    name: "Morning Exercise",
    description: "30 minutes of cardio exercise",
    reminderTime: "07:00",
    category: "fitness",
    difficulty: "medium",
    color: "#EF4444"
  },
  {
    name: "Read Books",
    description: "Read for at least 20 minutes daily",
    reminderTime: "20:00",
    category: "learning",
    difficulty: "easy",
    color: "#3B82F6"
  },
  {
    name: "Drink Water",
    description: "Drink at least 8 glasses of water",
    reminderTime: "09:00",
    category: "health",
    difficulty: "easy",
    color: "#06B6D4"
  },
  {
    name: "Meditation",
    description: "10 minutes of mindfulness meditation",
    reminderTime: "06:30",
    category: "personal",
    difficulty: "medium",
    color: "#8B5CF6"
  },
  {
    name: "Write Journal",
    description: "Write daily thoughts and reflections",
    reminderTime: "21:30",
    category: "personal",
    difficulty: "easy",
    color: "#F59E0B"
  }
];

async function connectDB() {
  try {
    const connectionString = process.env.MONGODB_URI || "mongodb://localhost:27017/habit_tracker";
    await mongoose.connect(connectionString);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
}

async function seedUsers() {
  try {
    console.log("🌱 Seeding users...");
    
    // Clear existing users (optional)
    // await User.deleteMany({});
    
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        createdUsers.push(user);
        console.log(`✅ Created user: ${user.email}`);
      } else {
        createdUsers.push(existingUser);
        console.log(`ℹ️  User already exists: ${userData.email}`);
      }
    }
    
    return createdUsers;
  } catch (error) {
    console.error("❌ Error seeding users:", error.message);
    throw error;
  }
}

async function seedHabits(users) {
  try {
    console.log("🌱 Seeding habits...");
    
    // Create habits for the first user
    const user = users[0];
    
    for (const habitData of sampleHabits) {
      // Check if habit already exists for this user
      const existingHabit = await Habit.findOne({ 
        name: habitData.name, 
        userId: user._id 
      });
      
      if (!existingHabit) {
        const habit = new Habit({
          ...habitData,
          userId: user._id
        });
        
        // Add some sample completion records
        const today = new Date();
        const completionRecords = [];
        
        for (let i = 10; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          
          // Random completion (70% chance of completion)
          const completed = Math.random() > 0.3;
          
          completionRecords.push({
            date,
            completed,
            notes: completed ? "Great job!" : ""
          });
        }
        
        habit.completionRecords = completionRecords;
        await habit.save();
        
        console.log(`✅ Created habit: ${habit.name} for ${user.email}`);
      } else {
        console.log(`ℹ️  Habit already exists: ${habitData.name} for ${user.email}`);
      }
    }
  } catch (error) {
    console.error("❌ Error seeding habits:", error.message);
    throw error;
  }
}

async function seedDatabase() {
  try {
    await connectDB();
    
    console.log("🚀 Starting database seeding...");
    
    const users = await seedUsers();
    await seedHabits(users);
    
    console.log("✅ Database seeding completed successfully!");
    console.log(`📊 Created ${users.length} users`);
    
    const habitCount = await Habit.countDocuments({});
    console.log(`📊 Total habits in database: ${habitCount}`);
    
    console.log("\n🔐 Demo login credentials:");
    console.log("Email: demo@example.com");
    console.log("Password: demo123456");
    
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("📤 Database connection closed");
    process.exit(0);
  }
}

// Run the seeding function
seedDatabase();