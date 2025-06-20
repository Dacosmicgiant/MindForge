import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId }, 
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};

// Set token as HTTP-only cookie
const setTokenCookie = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};

export const signup = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({ 
                message: "All fields are required",
                fields: ["email", "password", "name"]
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ 
                message: "Password must be at least 6 characters long" 
            });
        }
        
        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ 
                message: "User with this email already exists" 
            });
        }
        
        // Create new user
        const user = new User({
            email: email.toLowerCase().trim(),
            password,
            name: name.trim()
        });
        
        await user.save();
        
        // Generate token
        const token = generateToken(user._id);
        
        // Set cookie
        setTokenCookie(res, token);
        
        res.status(201).json({
            message: "User created successfully",
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                profilePicture: user.profilePicture,
                createdAt: user.createdAt
            },
            token
        });
        
    } catch (error) {
        console.error("Signup error:", error);
        
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: "Validation error",
                errors: messages
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: "Email already exists" 
            });
        }
        
        res.status(500).json({ 
            message: "Internal server error during signup" 
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                message: "Email and password are required" 
            });
        }
        
        // Find user by email
        const user = await User.findByEmail(email).select("+password");
        if (!user) {
            return res.status(401).json({ 
                message: "Invalid email or password" 
            });
        }
        
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: "Invalid email or password" 
            });
        }
        
        // Update last login
        user.lastLoginAt = new Date();
        await user.save();
        
        // Generate token
        const token = generateToken(user._id);
        
        // Set cookie
        setTokenCookie(res, token);
        
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                profilePicture: user.profilePicture,
                lastLoginAt: user.lastLoginAt
            },
            token
        });
        
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ 
            message: "Internal server error during login" 
        });
    }
};

export const logout = async (req, res) => {
    try {
        // Clear the cookie
        res.clearCookie("token");
        
        res.status(200).json({ 
            message: "Logout successful" 
        });
        
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ 
            message: "Internal server error during logout" 
        });
    }
};

export const getMe = async (req, res) => {
    try {
        // User is already attached to req by auth middleware
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ 
                message: "User not found" 
            });
        }
        
        res.status(200).json({
            message: "User profile retrieved successfully",
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                profilePicture: user.profilePicture,
                isEmailVerified: user.isEmailVerified,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
        
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ 
            message: "Internal server error while fetching profile" 
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, profilePicture } = req.body;
        const userId = req.user._id;
        
        // Build update object
        const updateData = {};
        if (name) updateData.name = name.trim();
        if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
        
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ 
                message: "No valid fields to update" 
            });
        }
        
        // Update user
        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!user) {
            return res.status(404).json({ 
                message: "User not found" 
            });
        }
        
        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                profilePicture: user.profilePicture,
                updatedAt: user.updatedAt
            }
        });
        
    } catch (error) {
        console.error("Update profile error:", error);
        
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: "Validation error",
                errors: messages
            });
        }
        
        res.status(500).json({ 
            message: "Internal server error while updating profile" 
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;
        
        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                message: "Current password and new password are required" 
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                message: "New password must be at least 6 characters long" 
            });
        }
        
        // Get user with password
        const user = await User.findById(userId).select("+password");
        if (!user) {
            return res.status(404).json({ 
                message: "User not found" 
            });
        }
        
        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({ 
                message: "Current password is incorrect" 
            });
        }
        
        // Update password
        user.password = newPassword;
        await user.save();
        
        res.status(200).json({ 
            message: "Password changed successfully" 
        });
        
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ 
            message: "Internal server error while changing password" 
        });
    }
};