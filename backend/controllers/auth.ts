import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/token"
import { authenticate } from "../middleware/middleware";

//For Register route
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        //Validation:check email and password is present in our database
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }
        //Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }
        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        //Create user
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });
        //Return response
        return res.status(201).json({
            message: "User registered successfully",
            userId: newUser.id,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};


//for login route
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        //Validation:check email and password is present in our database
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        return res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

//logout token
import { AuthRequest } from "../types/auth";
export const logout = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });
        return res.status(200).json({
            message: "Logged out successfully",
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};


// refresh
export const refresh = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                message: "Refresh token required",
            });
        }
        // Verify token
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET as string
        ) as { userId: number };
        // Find user
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({
                message: "Invalid refresh token",
            });
        }
        // Generate new access token
        const newAccessToken = generateAccessToken(user.id);
        return res.status(200).json({
            accessToken: newAccessToken,
        });
    } catch (error) {
        return res.status(403).json({
            message: "Invalid or expired refresh token",
        });
    }
};