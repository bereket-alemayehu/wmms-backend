import { RequestHandler, Request, Response, NextFunction } from "express";
import factory from "../dbOperations/dbFactory";
import Refund from "../models/refund.model";
import Ticket from "../models/ticket.model";
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

// Custom updateRefund controller with ticket status validation
export const updateRefund: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    // Get the refund
    const refund = await Refund.findById(id).populate("ticketId");
    if (!refund) {
      return next(new AppError("Refund not found", 404));
    }

    // If trying to approve, check if ticket is Closed
    if (status === "Approved") {
      const ticket = await Ticket.findById(refund.ticketId);
      if (!ticket) {
        return next(new AppError("Associated ticket not found", 404));
      }

      if (ticket.status !== "Closed") {
        return next(new AppError(
          "Refund can only be approved when the ticket status is 'Closed'",
          400
        ));
      }
    }

    // Update the refund
    const updatedRefund = await Refund.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate([
      { path: "ticketId", select: "category status description createdAt" },
      { path: "customerId", select: "fullName email phoneNumber" },
      { path: "officeId", select: "branchName location" },
    ]);

    if (!updatedRefund) {
      return next(new AppError("Failed to update refund", 500));
    }

    res.status(200).json({
      status: "success",
      data: {
        document: updatedRefund,
      },
    });
  }
);

// Check if refund can be approved
export const checkRefundApprovalEligibility: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const refund = await Refund.findById(id);
    if (!refund) {
      return next(new AppError("Refund not found", 404));
    }

    const ticket = await Ticket.findById(refund.ticketId);
    if (!ticket) {
      return next(new AppError("Associated ticket not found", 404));
    }

    const canApprove = ticket.status === "Closed" && refund.status === "Requested";

    res.status(200).json({
      status: "success",
      data: {
        canApprove,
        ticketStatus: ticket.status,
        refundStatus: refund.status,
        message: canApprove
          ? "Refund can be approved"
          : `Refund cannot be approved. Ticket status: ${ticket.status}, Refund status: ${refund.status}`,
      },
    });
  }
);

export const deleteRefund: RequestHandler = factory.deleteOne(Refund);

