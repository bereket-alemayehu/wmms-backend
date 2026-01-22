import { NextFunction, Request, Response, RequestHandler } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/appError";
import { verifyToken } from "../utils/security.utils";
import User from "../models/user.model";


/**
 * Protect routes - require authentication
 */
export const protectUser: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    // Get token from Authorization header or cookie
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    // Check if token exists
    if (token === "null" || !token) {
      return next(
        new AppError("You are not logged in. Please log in to access this resource", 401)
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        return next(
          new AppError("Your session has expired. Please log in again", 401)
        );
      }
      return next(new AppError("Invalid token. Please log in again", 401));
    }

    // Check if user still exists
    const user = await User.findById(decoded.id).select(
      "+passwordChangedAt"
    );

    if (!user) {
      return next(
        new AppError("The user belonging to this token no longer exists", 401)
      );
    }

    // Check if user changed password after token was issued
    if (user.passwordChangedAfter(decoded.iat)) {
      return next(
        new AppError("Password was recently changed. Please log in again", 401)
      );
    }

    // Grant access to protected route
    req.user = user;
    next();
  }
);

/**
 * Restrict access to specific roles
 */
export const restrictTo = (...roles: string[]): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You do not have permission to perform this action",
          403
        )
      );
    }
    next();
  });

/**
 * Check if user is logged in (non-blocking)
 * Sets req.user if logged in, but doesn't block if not
 */
export const isLoggedIn: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token || token === "null") {
      return next();
    }

    try {
      const decoded = await verifyToken(token);
      const user = await User.findById(decoded.id);

      if (user && !user.passwordChangedAfter(decoded.iat)) {
        req.user = user;
      }
    } catch (err) {
      // Silently fail - this is non-blocking
    }

    next();
  }
);

