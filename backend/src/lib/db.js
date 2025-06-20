import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const connectionString = process.env.MONGODB_URI || "mongodb://localhost:27017/habit_tracker";
        
        console.log("🔄 Attempting to connect to MongoDB...");
        console.log(`📍 Connection string: ${connectionString.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials in logs
        
        // Connect without deprecated options
        const connection = await mongoose.connect(connectionString);
        
        console.log("✅ MongoDB connected successfully");
        console.log(`📊 Database: ${connection.connection.name}`);
        console.log(`🌐 Host: ${connection.connection.host}:${connection.connection.port}`);
        console.log(`📈 Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);
        
        return connection;
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        
        // More specific error messages
        if (error.message.includes('ECONNREFUSED')) {
            console.error("💡 Tip: Make sure MongoDB is running on your system");
            console.error("   - Start MongoDB: mongod");
            console.error("   - Or use MongoDB Atlas cloud database");
        } else if (error.message.includes('authentication failed')) {
            console.error("💡 Tip: Check your MongoDB username and password");
        } else if (error.message.includes('timeout')) {
            console.error("💡 Tip: Check your network connection and MongoDB URI");
        }
        
        throw error; // Re-throw to be caught by server startup
    }
};

// Handle MongoDB connection events with detailed logging
mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('📤 Mongoose disconnected from MongoDB');
});

mongoose.connection.on('reconnected', () => {
    console.log('🔄 Mongoose reconnected to MongoDB');
});

// Graceful close connection when app terminates
process.on('SIGINT', async () => {
    console.log('🛑 Received SIGINT, closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('📤 MongoDB connection closed through app termination');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('🛑 Received SIGTERM, closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('📤 MongoDB connection closed through app termination');
    process.exit(0);
});