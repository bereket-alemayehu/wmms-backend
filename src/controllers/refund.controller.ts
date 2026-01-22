import { NextFunction, Request, RequestHandler, Response } from "express";
import factory from "../dbOperations/dbFactory";
import Refund from "../models/refund.model";
import Ticket from "../models/ticket.model";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/appError";
import APIFeatures from "../utils/apiFeatures";

const refundPopulate = {
  path: "ticketId customerId",
} as any;

export const getAllRefunds: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("You are not logged in", 401));
    }

    const user = req.user;

    if (user.role !== "customer" && user.role !== "manager") {
      return next(
        new AppError("You do not have permission to access refunds", 403),
      );
    }

    let filter: Record<string, any> = {};

    // Customer: only their refunds
    if (user.role === "customer") {
      filter = { customerId: user._id };
    }

    // Manager: refunds for tickets in their office
    if (user.role === "manager") {
      if (!user.officeId) {
        return next(new AppError("Manager is not assigned to an office", 400));
      }
      const ticketIds = await Ticket.distinct("_id", {
        officeId: user.officeId,
      });
      filter = { ticketId: { $in: ticketIds } };
    }

    const features = new APIFeatures(Refund.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    let query = features.query.populate(refundPopulate);
    const documents = await query;

    res.status(200).json({
      status: "success",
      results: documents.length,
      data: {
        documents,
      },
    });
  },
);

export const getRefund: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("You are not logged in", 401));
    }

    const refund = await Refund.findById(req.params.id).populate({
      path: "ticketId customerId",
      populate: { path: "officeId" },
    } as any);

    if (!refund) {
      return next(new AppError("No document found with that ID", 404));
    }

    const user = req.user;

    if (user.role !== "customer" && user.role !== "manager") {
      return next(
        new AppError("You do not have permission to access refunds", 403),
      );
    }

    if (user.role === "customer") {
      const refundCustomerId =
        (refund as any).customerId?._id || (refund as any).customerId;
      if (String(refundCustomerId) !== String(user._id)) {
        return next(
          new AppError("You do not have permission to access this refund", 403),
        );
      }
    }

    if (user.role === "manager") {
      if (!user.officeId) {
        return next(new AppError("Manager is not assigned to an office", 400));
      }
      const ticketOfficeId =
        (refund as any).ticketId?.officeId?._id ||
        (refund as any).ticketId?.officeId;
      if (String(ticketOfficeId) !== String(user.officeId)) {
        return next(
          new AppError("You do not have permission to access this refund", 403),
        );
      }
    }

    res.status(200).json({
      status: "success",
      data: {
        document: refund,
      },
    });
  },
);

export const createRefund: RequestHandler = factory.createOne(Refund);
export const updateRefund: RequestHandler = factory.updateOne(Refund);
export const deleteRefund: RequestHandler = factory.deleteOne(Refund);
