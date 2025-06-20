import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";

// Load environment variables first
dotenv.config();

console.log("🚀 Starting Habit Tracker API Server...");
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔧 Port: ${process.env.PORT || 5001}`);

const app = express();
const PORT = process.env.PORT || 5001;

// Basic middleware
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.json({ 
        message: "Habit Tracker API Server is running!",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Health check with database status
app.get("/api/health", async (req, res) => {
    const dbStatus = {
        connected: false,
        readyState: 'disconnected'
    };
    
    try {
        const mongoose = await import('mongoose');
        dbStatus.connected = mongoose.default.connection.readyState === 1;
        dbStatus.readyState = mongoose.default.connection.readyState === 1 ? 'connected' : 'disconnected';
    } catch (error) {
        console.error('Error checking database status:', error.message);
    }
    
    res.json({ 
        message: "API is healthy",
        timestamp: new Date().toISOString(),
        server: {
            status: 'running',
            uptime: process.uptime(),
            port: PORT
        },
        database: dbStatus
    });
});

// Database connection test endpoint
app.get("/api/db-status", async (req, res) => {
    try {
        const mongoose = await import('mongoose');
        const connection = mongoose.default.connection;
        
        res.json({
            connected: connection.readyState === 1,
            readyState: connection.readyState,
            host: connection.host,
            port: connection.port,
            name: connection.name,
            states: {
                0: 'disconnected',
                1: 'connected', 
                2: 'connecting',
                3: 'disconnecting'
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to check database status',
            message: error.message
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        message: "Route not found",
        path: req.originalUrl,
        availableRoutes: [
            'GET /',
            'GET /api/health', 
            'GET /api/db-status'
        ]
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err.stack);
    res.status(500).json({ 
        message: "Something went wrong!",
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Start server with database connection
const startServer = async () => {
    try {
        console.log('\n🔄 Initializing server...\n');
        
        // Connect to database first
        console.log('📊 Step 1: Connecting to database...');
        await connectDB();
        console.log('✅ Database connection established\n');
        
        // Then start the server
        console.log('🌐 Step 2: Starting HTTP server...');
        app.listen(PORT, () => {
            console.log(`✅ Server started successfully!`);
            console.log(`\n📍 Server Details:`);
            console.log(`   🌐 URL: http://localhost:${PORT}`);
            console.log(`   🔍 Health: http://localhost:${PORT}/api/health`);
            console.log(`   📊 DB Status: http://localhost:${PORT}/api/db-status`);
            console.log(`   📈 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`\n🎉 Habit Tracker API is ready to use!\n`);
        });
        
    } catch (error) {
        console.error("\n❌ Failed to start server:");
        console.error(`   Error: ${error.message}`);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.error('\n💡 MongoDB Connection Tips:');
            console.error('   1. Make sure MongoDB is installed and running');
            console.error('   2. Start MongoDB with: mongod');
            console.error('   3. Or use MongoDB Atlas (cloud database)');
            console.error('   4. Check your MONGODB_URI in .env file');
        }
        
        console.error('\n🛑 Exiting...\n');
        process.exit(1);
    }
};

startServer();