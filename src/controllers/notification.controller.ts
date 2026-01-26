import { RequestHandler, Request, Response, NextFunction } from "express";
import Notification from "../models/notification.model";
import { AppError } from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";

// Get all notifications for the logged-in user
export const getMyNotifications: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    const { read, limit } = req.query;
    // Ensure userId is correctly compared (convert to string for consistency)
    const userId = req.user._id.toString();
    const query: any = { userId: userId };

    if (read !== undefined) {
      query.read = read === "true";
    }

    let notificationsQuery = Notification.find(query)
      .sort({ createdAt: -1 });

    if (limit) {
      const limitNum = parseInt(limit as string, 10);
      notificationsQuery = notificationsQuery.limit(limitNum);
    }

    const notifications = await notificationsQuery;

    res.status(200).json({
      status: "success",
      results: notifications.length,
      data: {
        notifications,
      },
    });
  }
);

// Get unread notification count
export const getUnreadCount: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    // Ensure userId is correctly compared (convert to string for consistency)
    const userId = req.user._id.toString();
    
    const count = await Notification.countDocuments({
      userId: userId,
      read: false,
    });

    res.status(200).json({
      status: "success",
      data: {
        unreadCount: count,
      },
    });
  }
);

// Mark notification as read
export const markAsRead: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return next(new AppError("Notification not found", 404));
    }

    // Check if notification belongs to user
    if (notification.userId.toString() !== req.user._id.toString()) {
      return next(new AppError("You can only mark your own notifications as read", 403));
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      status: "success",
      data: {
        notification,
      },
    });
  }
);

// Mark all notifications as read
export const markAllAsRead: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({
      status: "success",
      message: "All notifications marked as read",
    });
  }
);

// Delete notification
export const deleteNotification: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return next(new AppError("Notification not found", 404));
    }

    // Check if notification belongs to user
    if (notification.userId.toString() !== req.user._id.toString()) {
      return next(new AppError("You can only delete your own notifications", 403));
    }

    await Notification.findByIdAndDelete(id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

