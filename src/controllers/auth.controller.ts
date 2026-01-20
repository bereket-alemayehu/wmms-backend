import { Request, Response, NextFunction, RequestHandler } from "express";
import crypto from "crypto";
import User from "../models/user.model";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/appError";
import {
    createSendToken,
    signToken,
    signRefreshToken,
    verifyToken,
    hashToken,
    validateServiceNumber,
    getRoleFromServiceNumber,
} from "../utils/security.utils";
import {
    isStrongPassword,
    getPasswordFeedback,
    isValidEmail,
} from "../utils/validation.utils";
import { sendOTPEmail } from "../services/OTPEmail";
import {
    verifyServiceNumber as ispVerifyServiceNumber,
    getCustomerInfo,
    isCustomerActive,
} from "../services/isp.service";

/**
 * STEP 1: INITIATE CUSTOMER SIGNUP
 * Customer provides service number
 * Backend verifies in ISP database, finds email, generates OTP, sends via email
 */
export const initiateSignup: RequestHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { serviceNumber, password, passwordConfirm } = req.body;

        // Validate required fields
        if (!serviceNumber || !password || !passwordConfirm) {
            return next(new AppError("Please provide service number, password, and password confirmation", 400));
        }

        // Validate password strength
        if (!isStrongPassword(password)) {
            const feedback = getPasswordFeedback(password);
            return next(new AppError(feedback.join(". "), 400));
        }

        // Validate passwords match
        if (password !== passwordConfirm) {
            return next(new AppError("Passwords do not match", 400));
        }

        // Validate service number format
        if (!validateServiceNumber(serviceNumber)) {
            return next(
                new AppError(
                    "Invalid service number format. Expected format: WMMS-CUST-XXXXXX",
                    400
                )
            );
        }

        // Ensure service number is for customers only
        const upperServiceNumber = serviceNumber.toUpperCase();
        if (!upperServiceNumber.startsWith("WMMS-CUST-")) {
            return next(
                new AppError(
                    "Invalid service number. Only customer accounts can be created through signup",
                    400
                )
            );
        }

        // Verify service number exists in ISP database
        const exists = await ispVerifyServiceNumber(upperServiceNumber);
        if (!exists) {
            return next(
                new AppError(
                    "Service number not found in our records. Please contact support.",
                    404
                )
            );
        }

        // Check if customer account is active
        const isActive = await isCustomerActive(upperServiceNumber);
        if (!isActive) {
            return next(
                new AppError(
                    "Your account is not active. Please contact support.",
                    403
                )
            );
        }

        // Check if user already registered
        let user = await User.findOne({ serviceNumber: upperServiceNumber }).select("+password");
        if (user && user.isRegistrationComplete) {
            return next(
                new AppError(
                    "This service number is already registered. Please login instead.",
                    400
                )
            );
        }

        // Get customer info from ISP database
        const customerInfo = await getCustomerInfo(upperServiceNumber);
        if (!customerInfo) {
            return next(
                new AppError("Could not retrieve customer information", 500)
            );
        }

        // Check if email exists in customer info
        if (!customerInfo.email) {
            return next(
                new AppError("Email address not found for this service number. Please contact support.", 404)
            );
        }

        // Validate email format from customer info
        if (!isValidEmail(customerInfo.email)) {
            return next(
                new AppError("Invalid email address on file. Please contact support.", 400)
            );
        }

        // Create or update user (for OTP tracking)
        if (!user) {
            user = await User.create({
                serviceNumber: upperServiceNumber,
                phoneNumber: customerInfo.phoneNumber,
                fullName: customerInfo.fullName || "Customer",
                email: customerInfo.email.toLowerCase().trim(),
                role: "customer",
                password,
                passwordConfirm,
                isRegistrationComplete: false
            });
        } else {
            // Update password and email for existing but non-completed registration
            user.password = password;
            user.passwordConfirm = passwordConfirm;
            user.email = customerInfo.email.toLowerCase().trim();
            await user.save();
        }

        // Generate OTP
        const otp = user.generateOTP();
        await user.save({ validateBeforeSave: false });

        // Send OTP via Email to the stored email address
        const emailSent = await sendOTPEmail(user.email!, otp, user.fullName);

        if (!emailSent) {
            return next(
                new AppError("Failed to send OTP email. Please try again later.", 500)
            );
        }

        // Mask email for response
        const emailParts = user.email!.split('@');
        const maskedEmail = emailParts[0].substring(0, 2) + '***' + '@' + emailParts[1];

        res.status(200).json({
            status: "success",
            message: `OTP sent to ${maskedEmail}. Valid for 5 minutes.`,
            data: {
                fullName: customerInfo.fullName,
                email: maskedEmail
            }
        });
    }
);

/**
 * STEP 2: VERIFY OTP & COMPLETE SIGNUP
 * Customer enters OTP received via email
 * Backend verifies OTP and completes registration
 */
export const verifyOTP: RequestHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { serviceNumber, otp } = req.body;

        // Validate required fields
        if (!serviceNumber || !otp) {
            return next(
                new AppError("Please provide service number and OTP", 400)
            );
        }

        // Find user
        const user = await User.findOne({
            serviceNumber: serviceNumber.toUpperCase(),
        }).select("+otp");

        if (!user) {
            return next(new AppError("No signup request found for this service number", 404));
        }

        // Verify OTP
        const isValidOTP = user.verifyOTP(otp);

        if (!isValidOTP) {
            return next(
                new AppError("Invalid or expired OTP. Please request a new one.", 401)
            );
        }

        // Mark OTP as verified and complete signup
        user.clearOTP();
        user.otpVerified = false; // Reset for future use
        user.isRegistrationComplete = true; // Mark as fully registered

        await user.save({ validateBeforeSave: false });

        // Generate tokens and send response
        createSendToken(user, 200, res, "Account verified and created successfully");
    }
);


/**
 * LOGIN (All Roles)
 * Shared endpoint for customers, technicians, supervisors, and managers
 */
export const login: RequestHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { serviceNumber, password } = req.body;

        // Check if credentials provided
        if (!serviceNumber || !password) {
            return next(
                new AppError("Please provide service number and password", 400)
            );
        }

        // Find user and include password field
        const user = await User.findOne({
            serviceNumber: serviceNumber.toUpperCase(),
        }).select("+password");

        if (!user) {
            return next(new AppError("Invalid service number or password", 401));
        }

        // Check if registration is complete
        if (!user.isRegistrationComplete) {
            return next(
                new AppError(
                    "Registration not complete. Please finish the signup process.",
                    403
                )
            );
        }

        // Verify password
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return next(new AppError("Invalid service number or password", 401));
        }

        // Update refresh token in database
        const refreshToken = signRefreshToken(user._id);
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // Generate tokens and send response
        createSendToken(user, 200, res, "Logged in successfully");
    }
);

/**
 * LOGOUT
 * Clear authentication cookies
 */
export const logout: RequestHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        // Clear refresh token from database
        if (req.user) {
            req.user.refreshToken = undefined;
            await req.user.save({ validateBeforeSave: false });
        }

        // Clear cookies
        res.cookie("jwt", "loggedout", {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        });
        res.cookie("refreshToken", "loggedout", {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        });

        res.status(200).json({
            status: "success",
            message: "Logged out successfully",
        });
    }
);

/**
 * REFRESH TOKEN
 * Issue new access token using refresh token
 */
export const refreshToken: RequestHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        // Get refresh token from cookie or body
        let refreshToken = req.cookies.refreshToken;
        if (!refreshToken && req.body.refreshToken) {
            refreshToken = req.body.refreshToken;
        }

        if (!refreshToken) {
            return next(new AppError("Refresh token not provided", 401));
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = await verifyToken(refreshToken, true);
        } catch (err) {
            return next(new AppError("Invalid or expired refresh token", 401));
        }

        // Find user and verify refresh token matches
        const user = await User.findById(decoded.id).select("+refreshToken");
        if (!user) {
            return next(new AppError("User no longer exists", 401));
        }

        if (user.refreshToken !== refreshToken) {
            return next(new AppError("Invalid refresh token", 401));
        }

        // Generate new access token
        const newAccessToken = signToken(user._id);

        // Send new access token
        res.status(200).json({
            status: "success",
            message: "Token refreshed successfully",
            accessToken: newAccessToken,
        });
    }
);

/**
 * FORGOT PASSWORD
 * Generate password reset token
 * Note: For now, token is logged to console (email integration can be added later)
 */
export const forgotPassword: RequestHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { serviceNumber } = req.body;

        if (!serviceNumber) {
            return next(new AppError("Please provide your service number", 400));
        }

        // Find user
        const user = await User.findOne({
            serviceNumber: serviceNumber.toUpperCase(),
        });

        if (!user) {
            return next(new AppError("No user found with that service number", 404));
        }

        // Generate reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // TODO: Send email with reset link
        // For now, log to console (development only)
        console.log("\n=== PASSWORD RESET TOKEN ===");
        console.log(`Service Number: ${user.serviceNumber}`);
        console.log(`Reset Token: ${resetToken}`);
        console.log(`Use this URL: /api/v1/auth/reset-password/${resetToken}`);
        console.log("============================\n");

        res.status(200).json({
            status: "success",
            message:
                "Password reset token generated. Check console (development mode) or contact administrator.",
        });
    }
);

/**
 * RESET PASSWORD
 * Reset password using reset token
 */
export const resetPassword: RequestHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { password, passwordConfirm } = req.body;
        const { token } = req.params;

        if (!password || !passwordConfirm) {
            return next(
                new AppError("Please provide password and password confirmation", 400)
            );
        }

        // Validate password strength
        if (!isStrongPassword(password)) {
            const feedback = getPasswordFeedback(password);
            return next(new AppError(feedback.join(". "), 400));
        }

        // Hash token to compare with database
        const hashedToken = hashToken(token);

        // Find user with valid reset token
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        }).select("+passwordResetToken +passwordResetExpires");

        if (!user) {
            return next(new AppError("Token is invalid or has expired", 400));
        }

        // Update password
        user.password = password;
        user.passwordConfirm = passwordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // Log user in with new password
        createSendToken(user, 200, res, "Password reset successfully");
    }
);

/**
 * UPDATE PASSWORD (Authenticated Users)
 * Change password for logged-in users
 */
export const updatePassword: RequestHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { currentPassword, newPassword, newPasswordConfirm } = req.body;

        if (!currentPassword || !newPassword || !newPasswordConfirm) {
            return next(
                new AppError(
                    "Please provide current password, new password, and confirmation",
                    400
                )
            );
        }

        // Get user with password
        const user = await User.findById(req.user?._id).select("+password");
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Verify current password
        const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordCorrect) {
            return next(new AppError("Current password is incorrect", 401));
        }

        // Validate new password strength
        if (!isStrongPassword(newPassword)) {
            const feedback = getPasswordFeedback(newPassword);
            return next(new AppError(feedback.join(". "), 400));
        }

        // Update password
        user.password = newPassword;
        user.passwordConfirm = newPasswordConfirm;
        await user.save();

        // Log user in with new password
        createSendToken(user, 200, res, "Password updated successfully");
    }
);

/**
 * GET CURRENT USER
 * Get profile of currently logged-in user
 */
export const getMe: RequestHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const user = await User.findById(req.user?._id);

        res.status(200).json({
            status: "success",
            data: {
                user,
            },
        });
    }
);

/**
 * UPDATE CURRENT USER
 * Update profile of currently logged-in user
 * Note: Cannot update password (use updatePassword), role, or serviceNumber
 */
export const updateMe: RequestHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        // Don't allow password updates through this endpoint
        if (req.body.password || req.body.passwordConfirm) {
            return next(
                new AppError(
                    "This route is not for password updates. Use /update-password",
                    400
                )
            );
        }

        // Don't allow role or serviceNumber updates
        if (req.body.role || req.body.serviceNumber) {
            return next(
                new AppError(
                    "You cannot update your role or service number",
                    400
                )
            );
        }

        // Allowed fields to update
        const allowedFields = ["fullName", "phoneNumber", "email"];
        const updates: any = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        // Validate email if provided
        if (updates.email && !isValidEmail(updates.email)) {
            return next(new AppError("Invalid email format", 400));
        }

        // Update user
        const user = await User.findByIdAndUpdate(req.user?._id, updates, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            status: "success",
            message: "Profile updated successfully",
            data: {
                user,
            },
        });
    }
);

/**
 * DELETE CURRENT USER (Soft Delete)
 * Deactivate account of currently logged-in user
 */
export const deleteMe: RequestHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        await User.findByIdAndUpdate(req.user?._id, { active: false });

        res.status(204).json({
            status: "success",
            data: null,
        });
    }
);
