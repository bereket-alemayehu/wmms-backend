import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Types } from "mongoose";

/**
 * Generate JWT access token (short-lived)
 */
export const signToken = (id: Types.ObjectId | string): string => {
    const secret = process.env.JWT_SECRET || "default-secret-change-in-production";

    // @ts-ignore - JWT accepts string expiresIn despite type definition
    return jwt.sign({ id: id.toString() }, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });
};

/**
 * Generate JWT refresh token (long-lived)
 */
export const signRefreshToken = (id: Types.ObjectId | string): string => {
    const secret = process.env.JWT_REFRESH_SECRET || "default-refresh-secret-change-in-production";

    // @ts-ignore - JWT accepts string expiresIn despite type definition
    return jwt.sign({ id: id.toString() }, secret, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    });
};

/**
 * Cookie options for secure token storage
 */
const getCookieOptions = (req: Request, maxAge: number) => {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        expires: new Date(Date.now() + maxAge),
        httpOnly: true, // Prevent XSS attacks
        secure: isProduction, // HTTPS only in production
        sameSite: "strict" as const, // CSRF protection
        path: "/",
    };
};

/**
 * Create and send JWT tokens with secure cookies
 */
export const createSendToken = (
    user: any,
    statusCode: number,
    res: Response,
    message: string = "Success"
) => {
    const accessToken = signToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    // Access token cookie (15 minutes)
    const accessTokenMaxAge = 15 * 60 * 1000; // 15 minutes in ms
    res.cookie("jwt", accessToken, getCookieOptions({} as Request, accessTokenMaxAge));

    // Refresh token cookie (7 days)
    const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
    res.cookie(
        "refreshToken",
        refreshToken,
        getCookieOptions({} as Request, refreshTokenMaxAge)
    );

    // Remove password from output
    user.password = undefined;
    user.passwordConfirm = undefined;
    user.passwordChangedAt = undefined;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.active = undefined;

    res.status(statusCode).json({
        status: "success",
        message,
        accessToken,
        refreshToken,
        data: {
            user,
        },
    });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string, isRefreshToken: boolean = false): Promise<any> => {
    const secret = isRefreshToken
        ? (process.env.JWT_REFRESH_SECRET || "default-refresh-secret-change-in-production")
        : (process.env.JWT_SECRET || "default-secret-change-in-production");

    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) reject(err);
            else resolve(decoded);
        });
    });
};

/**
 * Hash token (for password reset tokens, etc.)
 */
export const hashToken = (token: string): string => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Validate service number format
 * Expected format: WMMS-{ROLE}-{NUMBER}
 * Examples: WMMS-CUST-100234, WMMS-TECH-033, WMMS-MAN-001
 */
export const validateServiceNumber = (serviceNumber: string): boolean => {
    const pattern = /^WMMS-(CUST|TECH|SUP|MAN)-\d+$/i;
    return pattern.test(serviceNumber);
};

/**
 * Extract role from service number
 */
export const getRoleFromServiceNumber = (serviceNumber: string): string | null => {
    const match = serviceNumber.match(/^WMMS-(CUST|TECH|SUP|MAN)-\d+$/i);
    if (!match) return null;

    const roleCode = match[1].toUpperCase();
    const roleMap: Record<string, string> = {
        CUST: "customer",
        TECH: "technician",
        SUP: "supervisor",
        MAN: "manager",
    };

    return roleMap[roleCode] || null;
};
