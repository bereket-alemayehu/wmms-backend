import { RequestHandler, Request, Response, NextFunction } from "express";
import factory from "../dbOperations/dbFactory";
import Refund from "../models/refund.model";
import { AppError } from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";
import APIFeatures from "../utils/apiFeatures";

// Custom getAllRefunds controller with role-based filtering
export const getAllRefunds: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Authentication check
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    let filter: any = {};

    // Role-based filtering (restricted to customer and manager only)
    if (req.user.role === "customer") {
      // Customers see only their own refunds
      filter.customerId = req.user._id;
    } else if (req.user.role === "manager") {
      // Managers see only refunds from their office (highest role for refund access)
      if (!req.user.officeId) {
        return next(new AppError("Manager does not have an assigned office", 400));
      }
      filter.officeId = req.user.officeId;
    }

    // Build query with filters
    const features = new APIFeatures(Refund.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    let query = features.query;
    
    // Populate related documents
    query = query.populate([
      { path: "ticketId", select: "category status description createdAt" },
      { path: "customerId", select: "fullName email phoneNumber" },
      { path: "officeId", select: "branchName location" },
    ]);

    const documents = await query;

    res.status(200).json({
      status: "success",
      results: documents.length,
      data: {
        documents,
      },
    });
  }
);

export const getRefund: RequestHandler = factory.getOne(
  Refund,
  { path: "ticketId customerId officeId" } as any
);
export const createRefund: RequestHandler = factory.createOne(Refund);
export const updateRefund: RequestHandler = factory.updateOne(Refund);
export const deleteRefund: RequestHandler = factory.deleteOne(Refund);

