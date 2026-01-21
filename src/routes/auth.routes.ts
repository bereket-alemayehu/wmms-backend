import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
    initiateSignup,
    verifyOTP,
    login,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
    updatePassword,
    getMe,
    updateMe,
    deleteMe,
} from "../controllers/auth.controller";
import { protectUser } from "../middlewares/auth.middleware";

const router: Router = Router();

// Rate limiters for security
// const loginLimiter = rateLimit({
//     max: 5,
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     message: "Too many login attempts. Please try again after 15 minutes",
//     standardHeaders: true,
//     legacyHeaders: false,
// });

// const signupLimiter = rateLimit({
//     max: 10,
//     windowMs: 60 * 60 * 1000, // 1 hour
//     message: "Too many signup attempts. Please try again after an hour",
//     standardHeaders: true,
//     legacyHeaders: false,
// });

// const otpLimiter = rateLimit({
//     max: 10,
//     windowMs: 60 * 60 * 1000, // 1 hour
//     message: "Too many OTP requests. Please try again after an hour",
//     standardHeaders: true,
//     legacyHeaders: false,
// });

// const passwordResetLimiter = rateLimit({
//     max: 3,
//     windowMs: 60 * 60 * 1000, // 1 hour
//     message: "Too many password reset attempts. Please try again after an hour",
//     standardHeaders: true,
//     legacyHeaders: false,
// });

// Public routes - Customer signup (2-step OTP flow)
router.post("/signup/initiate", initiateSignup);
router.post("/signup/verify-otp", verifyOTP);

// Public routes - Authentication
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);

// Token management
router.post("/refresh", refreshToken);

// Protected routes (require authentication)
router.use(protectUser); // All routes after this require authentication

router.post("/logout", logout);
router.patch("/update-password", updatePassword);
router.get("/me", getMe);
router.patch("/me", updateMe);
router.delete("/me", deleteMe);

export default router;
