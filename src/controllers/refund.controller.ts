import { RequestHandler, Request, Response, NextFunction } from "express";
import factory from "../dbOperations/dbFactory";
import Refund from "../models/refund.model";
import Ticket from "../models/ticket.model";
import { AppError } from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";

/**
 * Middleware: customers can only list their own refunds.
 * Supervisors/managers can query all.
 */
export const scopeRefundListToUser: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.user?.role === "customer") {
    // Force customerId to current user; prevent overriding via query string
    req.query.customerId = String(req.user._id);
  }
  next();
};

export const getAllRefunds: RequestHandler = factory.getAll(Refund, {
  path: "ticketId customerId",
} as any);

/**
 * Customers can only read their own refund document.
 */
export const getRefund: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refund = await Refund.findById(req.params.id).populate(
      "ticketId customerId",
    );

    if (!refund) {
      return next(new AppError("No document found with that ID", 404));
    }

    if (
      req.user?.role === "customer" &&
      String(refund.customerId) !== String(req.user._id)
    ) {
      return next(
        new AppError("You do not have permission to access this refund", 403),
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        document: refund,
      },
    });
  },
);

/**
 * Create refund request
 * - Customers: can only create refunds for their own ticket.
 * - Supervisors/managers: can create for any customer.
 */
export const createRefund: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("You are not logged in", 401));
    }

    const { ticketId, customerId, amount } = req.body;
    if (!ticketId) return next(new AppError("ticketId is required", 400));
    if (amount === undefined)
      return next(new AppError("amount is required", 400));

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return next(new AppError("Ticket not found", 404));

    // Enforce customer ownership + prevent forging customerId
    let resolvedCustomerId: string;
    if (req.user.role === "customer") {
      if (String(ticket.customerId) !== String(req.user._id)) {
        return next(
          new AppError(
            "You can only request a refund for your own ticket",
            403,
          ),
        );
      }
      resolvedCustomerId = String(req.user._id);
    } else {
      if (!customerId) {
        return next(new AppError("customerId is required", 400));
      }
      resolvedCustomerId = String(customerId);
    }

    const refund = await Refund.create({
      ticketId,
      customerId: resolvedCustomerId,
      amount,
      status: "Requested",
    });

    res.status(201).json({
      status: "success",
      data: {
        document: refund,
      },
    });
  },
);

// Prevent tampering with ownership/ticket/amount via update route
export const updateRefund: RequestHandler = factory.updateOne(Refund, [
  "ticketId",
  "customerId",
  "amount",
]);

export const deleteRefund: RequestHandler = factory.deleteOne(Refund);
