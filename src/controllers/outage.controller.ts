import { RequestHandler, Request, Response, NextFunction } from "express";
import factory from "../dbOperations/dbFactory";
import Outage from "../models/outage.model";
import { AppError } from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";
import {
  notifyOutageCreated,
  notifyOutageResolved,
} from "../services/notification.service";

// Custom getAllOutages controller to properly populate office
export const getAllOutages: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let query = Outage.find();

    // Populate office and postedBy fields
    query = query.populate([
      { path: "officeId", select: "cityName branchName location" },
      { path: "postedBy", select: "fullName email" },
    ]);

    const documents = await query.sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: documents.length,
      data: {
        documents,
      },
    });
  }
);

// Custom getOutage controller to properly populate office
export const getOutage: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    let query = Outage.findById(id);
    
    // Populate office and postedBy fields
    query = query.populate([
      { path: "officeId", select: "cityName branchName location" },
      { path: "postedBy", select: "fullName email" },
    ]);
    
    const document = await query;
    
    if (!document) {
      return next(new AppError("No outage found with that ID", 404));
    }
    
    res.status(200).json({
      status: "success",
      data: {
        document,
      },
    });
  }
);

// Custom createOutage controller to automatically set officeId and postedBy
export const createOutage: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get officeId from logged-in user
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    if (!req.user.officeId) {
      return next(new AppError("User does not have an assigned office", 400));
    }

    // Set officeId and postedBy from logged-in user
    req.body.officeId = req.user.officeId;
    req.body.postedBy = req.user._id;

    const createdOutage = await Outage.create(req.body);

    // Fetch the created outage with populated fields
    // Outage.create() with a single object returns a single document
    const outageId = (createdOutage as any)._id || (createdOutage as any)[0]?._id;
    
    const outage = await Outage.findById(outageId)
      .populate([
        { path: "officeId", select: "cityName branchName location" },
        { path: "postedBy", select: "fullName email" },
      ]);

    if (!outage) {
      return next(new AppError("Failed to create outage", 500));
    }

    // Notify all users in the office
    const io = globalThis.io;
    await notifyOutageCreated(
      outage.officeId,
      outage._id,
      outage.title,
      io
    );

    res.status(201).json({
      status: "success",
      data: {
        document: outage,
      },
    });
  }
);

// Custom updateOutage controller to populate office after update
export const updateOutage: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const document = await Outage.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(new AppError("No outage found with that ID", 404));
    }

    // Populate the updated outage
    await document.populate([
      { path: "officeId", select: "cityName branchName location" },
      { path: "postedBy", select: "fullName email" },
    ]);

    // Notify if outage status changed to Resolved
    if (req.body.status === "Resolved" && document.status === "Resolved") {
      const io = globalThis.io;
      await notifyOutageResolved(
        document.officeId,
        document._id,
        document.title,
        io
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        document,
      },
    });
  }
);

export const deleteOutage: RequestHandler = factory.deleteOne(Outage);

