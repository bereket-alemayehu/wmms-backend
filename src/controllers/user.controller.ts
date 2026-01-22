import { RequestHandler, Request, Response, NextFunction } from "express";
import factory from "../dbOperations/dbFactory";
import User from "../models/user.model";
import Ticket from "../models/ticket.model";
import { AppError } from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";

// Custom getAllUsers controller that filters by logged-in user's officeId
export const getAllUsers: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get officeId from logged-in user
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    const { role } = req.query;

    // Build filter query
    const filter: any = {};
    if (role) {
      filter.role = role;
    }

    // Managers can see all users across all offices
    // Supervisors are restricted to their own office
    if (req.user.role !== "manager") {
      filter.officeId = req.user.officeId;
    } else if (req.query.officeId) {
      // Optional: Managers can filter by officeId if provided in query
      filter.officeId = req.query.officeId;
    }

    const users = await User.find(filter)
      .populate("officeId", "name address")
      .select("-password -passwordConfirm -passwordChangedAt -passwordResetToken -passwordResetExpires -refreshToken -active")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        documents: users,
      },
    });
  }
);

// Get technicians by office (filtered by logged-in user's officeId)
export const getTechniciansByOffice: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get officeId from logged-in user
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    const filter: any = { role: "technician" };

    // Managers can see all technicians across all offices
    // Others are restricted to their own office
    if (req.user.role !== "manager") {
      if (!req.user.officeId) {
        return next(new AppError("User does not have an assigned office", 400));
      }
      filter.officeId = req.user.officeId;
    } else if (req.query.officeId) {
      filter.officeId = req.query.officeId;
    }

    const technicians = await User.find(filter)
      .populate("officeId", "name address")
      .select("-password -passwordConfirm -passwordChangedAt -passwordResetToken -passwordResetExpires -refreshToken -active")
      .sort({ fullName: 1 });

    res.status(200).json({
      status: "success",
      results: technicians.length,
      data: {
        technicians,
      },
    });
  }
);

// Get supervisors by office (filtered by logged-in user's officeId)
export const getSupervisorsByOffice: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get officeId from logged-in user
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    const filter: any = { role: "supervisor" };

    // Only managers can access this endpoint (enforced by routes)
    // Managers can see all supervisors across all offices
    if (req.query.officeId) {
      filter.officeId = req.query.officeId;
    }

    const supervisors = await User.find(filter)
      .populate("officeId", "name address")
      .select("-password -passwordConfirm -passwordChangedAt -passwordResetToken -passwordResetExpires -refreshToken -active")
      .sort({ fullName: 1 });

    res.status(200).json({
      status: "success",
      results: supervisors.length,
      data: {
        supervisors,
      },
    });
  }
);

// Get customers by office (customers assigned to the same officeId)
export const getCustomersByOffice: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get officeId from logged-in user
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    const filter: any = { role: "customer" };

    // Managers can see all customers across all offices
    // Others are restricted to their own office
    if (req.user.role !== "manager") {
      if (!req.user.officeId) {
        return next(new AppError("User does not have an assigned office", 400));
      }
      filter.officeId = req.user.officeId;
    } else if (req.query.officeId) {
      filter.officeId = req.query.officeId;
    }

    // Get customers
    const customers = await User.find(filter)
      .populate("officeId", "name address")
      .select("-password -passwordConfirm -passwordChangedAt -passwordResetToken -passwordResetExpires -refreshToken -active")
      .sort({ fullName: 1 });

    res.status(200).json({
      status: "success",
      results: customers.length,
      data: {
        customers,
      },
    });
  }
);

// Custom getUser controller that ensures user belongs to same office
export const getUser: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    const { id } = req.params;
    const user = await User.findById(id)
      .populate("officeId", "name address")
      .select("-password -passwordConfirm -passwordChangedAt -passwordResetToken -passwordResetExpires -refreshToken -active");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // For staff (technician/supervisor), verify they belong to same office
    // Managers can see everyone
    if (req.user.role !== "manager") {
      if (!user.officeId || user.officeId.toString() !== req.user.officeId?.toString()) {
        return next(new AppError("You do not have permission to access this user", 403));
      }
    }

    res.status(200).json({
      status: "success",
      data: {
        document: user,
      },
    });
  }
);

export const createUser: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    if (!req.user.officeId) {
      return next(new AppError("User does not have an assigned office", 400));
    }

    // Automatically assign new staff to the same office as the creator
    if (req.body.role === "technician" || req.body.role === "supervisor") {
      req.body.officeId = req.user.officeId;
    }

    const user = await User.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        document: user,
      },
    });
  }
);

export const updateUser: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    if (!req.user.officeId) {
      return next(new AppError("User does not have an assigned office", 400));
    }

    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Verify user belongs to same office before updating
    if (user.officeId && user.officeId.toString() !== req.user.officeId.toString()) {
      return next(new AppError("You do not have permission to update this user", 403));
    }

    // Prevent changing officeId to a different office
    if (req.body.officeId && req.body.officeId.toString() !== req.user.officeId.toString()) {
      return next(new AppError("Cannot assign user to a different office", 403));
    }

    // Ensure officeId is set to current user's office for staff
    if (req.body.role === "technician" || req.body.role === "supervisor") {
      req.body.officeId = req.user.officeId;
    }

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("officeId", "name address")
      .select("-password -passwordConfirm -passwordChangedAt -passwordResetToken -passwordResetExpires -refreshToken -active");

    res.status(200).json({
      status: "success",
      data: {
        document: updatedUser,
      },
    });
  }
);

export const deleteUser: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    if (!req.user.officeId) {
      return next(new AppError("User does not have an assigned office", 400));
    }

    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Verify user belongs to same office before deleting
    if (user.officeId && user.officeId.toString() !== req.user.officeId.toString()) {
      return next(new AppError("You do not have permission to delete this user", 403));
    }

    await User.findByIdAndDelete(id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);
