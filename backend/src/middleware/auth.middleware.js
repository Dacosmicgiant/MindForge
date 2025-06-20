import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        // Get token from Authorization header or cookies
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            // Extract token from Bearer header
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies?.token) {
            // Extract token from cookies
            token = req.cookies.token;
        }
        
        if (!token) {
            return res.status(401).json({ 
                message: "Access denied. No token provided." 
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
        
        // Get user from database
        const user = await User.findById(decoded.userId).select("-password");
        
        if (!user) {
            return res.status(401).json({ 
                message: "Access denied. User not found." 
            });
        }
        
        // Add user to request object
        req.user = user;
        next();
        
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ 
                message: "Access denied. Invalid token." 
            });
        }
        
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ 
                message: "Access denied. Token expired." 
            });
        }
        
        res.status(500).json({ 
            message: "Internal server error during authentication." 
        });
    }
};

// Optional auth middleware - doesn't require authentication but adds user if token is valid
export const optionalAuth = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies?.token) {
            token = req.cookies.token;
        }
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
                const user = await User.findById(decoded.userId).select("-password");
                
                if (user) {
                    req.user = user;
                }
            } catch (error) {
                // Token is invalid, but we continue without user
                console.log("Optional auth: Invalid token, continuing without user");
            }
        }
        
        next();
    } catch (error) {
        console.error("Optional auth middleware error:", error.message);
        next();
    }
};

// Admin middleware (for future use)
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            message: "Access denied. Authentication required." 
        });
    }
    
    if (!req.user.isAdmin) {
        return res.status(403).json({ 
            message: "Access denied. Admin privileges required." 
        });
    }
    
    next();
};

// Rate limiting middleware helper
export const createRateLimit = (windowMs, max, message) => {
    const requests = new Map();
    
    return (req, res, next) => {
        const identifier = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        const windowStart = now - windowMs;
        
        // Clean old requests
        for (const [key, value] of requests.entries()) {
            if (value.timestamp < windowStart) {
                requests.delete(key);
            }
        }
        
        // Check current requests
        const userRequests = Array.from(requests.values())
            .filter(req => req.identifier === identifier && req.timestamp > windowStart);
        
        if (userRequests.length >= max) {
            return res.status(429).json({ 
                message: message || "Too many requests. Please try again later." 
            });
        }
        
        // Add current request
        requests.set(`${identifier}-${now}`, {
            identifier,
            timestamp: now
        });
        
        next();
    };
};