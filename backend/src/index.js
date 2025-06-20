import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";

// Import routes
import authRoutes from "./routes/auth.route.js";
import habitRoutes from "./routes/habit.route.js";

// Load environment variables first
dotenv.config();

console.log("🚀 Starting Habit Tracker API Server...");
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔧 Port: ${process.env.PORT || 5001}`);
console.log(`📊 MongoDB URI: ${(process.env.MONGODB_URI || 'mongodb://localhost:27017/habit_tracker').replace(/\/\/.*@/, '//***:***@')}`);

const app = express();
const PORT = process.env.PORT || 5001;

// Trust proxy if behind reverse proxy (for production)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Middleware Setup
console.log("🔧 Setting up middleware...");

// Body parsing middleware
app.use(express.json({ 
    limit: '10mb',
    type: 'application/json'
}));
app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
}));

// Cookie parser for JWT handling
app.use(cookieParser());

// CORS middleware for frontend communication
app.use((req, res, next) => {
    // Allow requests from frontend
    const allowedOrigins = [
        process.env.CLIENT_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://localhost:19006', // Expo development
        'exp://localhost:19000',  // Expo development
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`📨 ${timestamp} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    next();
});

// Security headers
app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    next();
});

console.log("✅ Middleware setup complete");

// API Routes
console.log("🛣️  Setting up routes...");
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
console.log("✅ Routes setup complete");

// Root endpoint - API documentation
app.get("/", (req, res) => {
    res.status(200).json({
        message: "🎯 Habit Tracker API",
        version: "1.0.0",
        status: "Server is running!",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        documentation: {
            description: "A comprehensive REST API for habit tracking with user authentication",
            baseUrl: `http://localhost:${PORT}`,
            endpoints: {
                authentication: {
                    signup: {
                        method: "POST",
                        path: "/api/auth/signup",
                        description: "Create a new user account",
                        body: {
                            email: "string (required)",
                            password: "string (required, min 6 chars)",
                            name: "string (required)"
                        }
                    },
                    login: {
                        method: "POST", 
                        path: "/api/auth/login",
                        description: "Login with email and password",
                        body: {
                            email: "string (required)",
                            password: "string (required)"
                        }
                    },
                    profile: {
                        method: "GET",
                        path: "/api/auth/me",
                        description: "Get current user profile",
                        headers: {
                            Authorization: "Bearer <token>"
                        }
                    },
                    logout: {
                        method: "POST",
                        path: "/api/auth/logout",
                        description: "Logout current user"
                    }
                },
                habits: {
                    list: {
                        method: "GET",
                        path: "/api/habits",
                        description: "Get all habits for authenticated user"
                    },
                    create: {
                        method: "POST",
                        path: "/api/habits",
                        description: "Create a new habit",
                        body: {
                            name: "string (required)",
                            description: "string (optional)",
                            reminderTime: "string (optional, HH:MM format)",
                            category: "string (optional)",
                            difficulty: "string (optional)",
                            color: "string (optional, hex color)"
                        }
                    },
                    update: {
                        method: "PUT",
                        path: "/api/habits/:id",
                        description: "Update a specific habit"
                    },
                    delete: {
                        method: "DELETE",
                        path: "/api/habits/:id",
                        description: "Delete a specific habit"
                    },
                    mark: {
                        method: "PUT",
                        path: "/api/habits/:id/mark",
                        description: "Mark habit as completed/uncompleted",
                        body: {
                            completed: "boolean (required)",
                            notes: "string (optional)",
                            date: "string (optional, YYYY-MM-DD)"
                        }
                    },
                    progress: {
                        method: "GET",
                        path: "/api/habits/:id/progress",
                        description: "Get habit completion history",
                        query: {
                            days: "number (optional, default 7)"
                        }
                    },
                    stats: {
                        method: "GET",
                        path: "/api/habits/stats",
                        description: "Get overall habit statistics"
                    }
                },
                utility: {
                    health: {
                        method: "GET",
                        path: "/api/health",
                        description: "Server and database health check"
                    },
                    dbStatus: {
                        method: "GET",
                        path: "/api/db-status",
                        description: "Detailed database connection status"
                    }
                }
            }
        },
        examples: {
            signup: {
                url: `http://localhost:${PORT}/api/auth/signup`,
                method: "POST",
                body: {
                    email: "demo@example.com",
                    password: "demo123456", 
                    name: "Demo User"
                }
            },
            createHabit: {
                url: `http://localhost:${PORT}/api/habits`,
                method: "POST",
                headers: {
                    "Authorization": "Bearer <your-jwt-token>",
                    "Content-Type": "application/json"
                },
                body: {
                    name: "Morning Exercise",
                    description: "30 minutes of cardio",
                    reminderTime: "07:00",
                    category: "fitness",
                    difficulty: "medium"
                }
            }
        }
    });
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
    try {
        const mongoose = await import('mongoose');
        const dbStatus = {
            connected: mongoose.default.connection.readyState === 1,
            readyState: mongoose.default.connection.readyState,
            host: mongoose.default.connection.host,
            name: mongoose.default.connection.name
        };
        
        res.status(200).json({
            message: "🟢 API is healthy",
            timestamp: new Date().toISOString(),
            server: {
                status: 'running',
                uptime: Math.floor(process.uptime()),
                port: PORT,
                environment: process.env.NODE_ENV || 'development',
                nodeVersion: process.version,
                platform: process.platform
            },
            database: dbStatus,
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "🔴 Health check failed",
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Database status endpoint
app.get("/api/db-status", async (req, res) => {
    try {
        const mongoose = await import('mongoose');
        const connection = mongoose.default.connection;
        
        const dbInfo = {
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
            },
            currentState: connection.readyState === 1 ? 'connected' : 
                          connection.readyState === 2 ? 'connecting' :
                          connection.readyState === 3 ? 'disconnecting' : 'disconnected'
        };
        
        // Test database operation
        const collections = await mongoose.default.connection.db.listCollections().toArray();
        dbInfo.collections = collections.map(col => col.name);
        dbInfo.collectionsCount = collections.length;
        
        res.status(200).json({
            message: "📊 Database status",
            timestamp: new Date().toISOString(),
            database: dbInfo
        });
        
    } catch (error) {
        res.status(500).json({
            message: "❌ Failed to get database status",
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// API information endpoint
app.get("/api", (req, res) => {
    res.status(200).json({
        message: "Habit Tracker API Information",
        version: "1.0.0",
        documentation: "Visit GET / for full API documentation",
        quickStart: {
            "1": "POST /api/auth/signup to create account",
            "2": "POST /api/auth/login to get token", 
            "3": "Use token in Authorization header for protected routes",
            "4": "POST /api/habits to create habits",
            "5": "PUT /api/habits/:id/mark to track progress"
        }
    });
});

// Handle 404 errors
app.use((req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        message: "🔍 API endpoint not found",
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        suggestion: "Visit GET / for API documentation",
        availableEndpoints: [
            'GET /',
            'GET /api/health',
            'GET /api/db-status', 
            'POST /api/auth/signup',
            'POST /api/auth/login',
            'GET /api/auth/me',
            'POST /api/auth/logout',
            'GET /api/habits',
            'POST /api/habits',
            'PUT /api/habits/:id/mark',
            'GET /api/habits/:id/progress'
        ]
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(`❌ Server error on ${req.method} ${req.originalUrl}:`, err);
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: "❌ Validation Error",
            errors: Object.values(err.errors).map(e => e.message),
            timestamp: new Date().toISOString()
        });
    }
    
    if (err.name === 'CastError') {
        return res.status(400).json({
            message: "❌ Invalid ID format",
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
    
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: "❌ Invalid authentication token",
            timestamp: new Date().toISOString()
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            message: "❌ Authentication token expired",
            timestamp: new Date().toISOString()
        });
    }
    
    if (err.code === 11000) {
        return res.status(400).json({
            message: "❌ Duplicate entry",
            error: "This email is already registered",
            timestamp: new Date().toISOString()
        });
    }
    
    // Default error response
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || "❌ Internal server error",
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        timestamp: new Date().toISOString(),
        statusCode
    });
});

// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}, starting graceful shutdown...`);
    
    // Stop accepting new connections
    server.close(async () => {
        console.log('📤 HTTP server closed');
        
        try {
            // Close database connection
            const mongoose = await import('mongoose');
            await mongoose.default.connection.close();
            console.log('📤 Database connection closed');
            
            console.log('✅ Graceful shutdown completed');
            process.exit(0);
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
            process.exit(1);
        }
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

// Start server with database connection
const startServer = async () => {
    try {
        console.log('\n🔄 Initializing Habit Tracker API...\n');
        
        // Step 1: Connect to database
        console.log('📊 Step 1: Connecting to database...');
        await connectDB();
        console.log('✅ Database connection established\n');
        
        // Step 2: Start HTTP server
        console.log('🌐 Step 2: Starting HTTP server...');
        const server = app.listen(PORT, () => {
            console.log(`✅ Server started successfully!\n`);
            
            console.log('📍 Server Information:');
            console.log(`   🌐 URL: http://localhost:${PORT}`);
            console.log(`   🔍 Health Check: http://localhost:${PORT}/api/health`);
            console.log(`   📊 Database Status: http://localhost:${PORT}/api/db-status`);
            console.log(`   📖 Documentation: http://localhost:${PORT}/`);
            console.log(`   📈 Environment: ${process.env.NODE_ENV || 'development'}\n`);
            
            console.log('🚀 Quick Start API Endpoints:');
            console.log('   📝 POST /api/auth/signup - Create account');
            console.log('   🔐 POST /api/auth/login - Login');
            console.log('   👤 GET /api/auth/me - Get profile');
            console.log('   📋 GET /api/habits - List habits');
            console.log('   ➕ POST /api/habits - Create habit');
            console.log('   ✅ PUT /api/habits/:id/mark - Mark habit complete');
            console.log('   📈 GET /api/habits/:id/progress - Get progress\n');
            
            console.log('🎉 Habit Tracker API is ready to use!\n');
            
            // Demo user info
            console.log('💡 Demo Account:');
            console.log('   Email: demo@example.com');
            console.log('   Password: demo123456');
            console.log('   (Create this account via POST /api/auth/signup)\n');
        });
        
        // Store server reference for graceful shutdown
        global.server = server;
        
        // Setup graceful shutdown
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        
    } catch (error) {
        console.error('\n❌ Failed to start server:');
        console.error(`   Error: ${error.message}`);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.error('\n💡 MongoDB Connection Tips:');
            console.error('   1. Make sure MongoDB is installed and running');
            console.error('   2. Start MongoDB: mongod (in a separate terminal)');
            console.error('   3. Or use MongoDB Atlas cloud database');
            console.error('   4. Check MONGODB_URI in your .env file');
            console.error('   5. Ensure port 27017 is not blocked by firewall');
        }
        
        if (error.message.includes('EADDRINUSE')) {
            console.error('\n💡 Port Already In Use:');
            console.error(`   1. Port ${PORT} is already being used`);
            console.error('   2. Stop other servers running on this port');
            console.error('   3. Or change PORT in your .env file');
        }
        
        console.error('\n🛑 Server startup failed. Exiting...\n');
        process.exit(1);
    }
};

// Initialize server
startServer();