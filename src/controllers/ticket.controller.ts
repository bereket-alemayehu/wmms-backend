import { RequestHandler, Request, Response, NextFunction } from "express";
import factory from "../dbOperations/dbFactory";
import Ticket from "../models/ticket.model";
import {
  getQueuePosition,
  checkRefundEligibility,
  assignTicket,
  updateTicketStatus,
  getTicketsByCustomer,
  getTicketsByOffice,
  getTicketsByTechnician,
  getQueueStatistics,
  submitFeedback,
  requestRefund,
} from "../services/ticket.service";
import { AppError } from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";
import { TicketStatus } from "../interfaces/ticket.interface";

// Basic CRUD operations using factory
export const getAllTickets: RequestHandler = factory.getAll(Ticket, {
  path: "customerId officeId assignedTo",
} as any);

export const getTicket: RequestHandler = factory.getOne(Ticket, {
  path: "customerId officeId assignedTo",
} as any);

// Custom createTicket controller that uses logged-in user's officeId
export const createTicket: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get officeId from logged-in user
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    if (!req.user.officeId) {
      return next(new AppError("User does not have an assigned office", 400));
    }

    // Set customerId and officeId from logged-in user
    req.body.customerId = req.user._id;
    req.body.officeId = req.user.officeId;

    console.log("Creating ticket with officeId:", req.body.officeId);

    const ticket = await Ticket.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        document: ticket,
      },
    });
  }
);

export const updateTicket: RequestHandler = factory.updateOne(Ticket);

export const deleteTicket: RequestHandler = factory.deleteOne(Ticket);

// Custom controller: Get queue position
export const getTicketQueuePosition: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return next(new AppError("Ticket not found", 404));
    }

    const position = await getQueuePosition(ticket._id, ticket.officeId);

    res.status(200).json({
      status: "success",
      data: {
        ticketId: id,
        queuePosition: position,
      },
    });
  }
);

// Custom controller: Check refund eligibility
export const checkTicketRefundEligibility: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return next(new AppError("Ticket not found", 404));
    }

    const isEligible = await checkRefundEligibility(ticket._id);

    res.status(200).json({
      status: "success",
      data: {
        ticketId: id,
        refundEligible: isEligible,
        refundRequested: ticket.refundRequested,
      },
    });
  }
);

// Custom controller: Assign ticket to technician
export const assignTicketToTechnician: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { technicianId } = req.body;

    if (!technicianId) {
      return next(new AppError("Technician ID is required", 400));
    }

    const ticket = await assignTicket(id, technicianId);

    if (!ticket) {
      return next(new AppError("Ticket not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        ticket,
      },
    });
  }
);

// Custom controller: Update ticket status
export const changeTicketStatus: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status, assignedTo } = req.body;

    if (!status) {
      return next(new AppError("Status is required", 400));
    }

    const validStatuses: TicketStatus[] = [
      "Pending",
      "Assigned",
      "In Progress",
      "Resolved",
      "Closed",
    ];

    if (!validStatuses.includes(status)) {
      return next(new AppError("Invalid status", 400));
    }

    const ticket = await updateTicketStatus(id, status, assignedTo);

    if (!ticket) {
      return next(new AppError("Ticket not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        ticket,
      },
    });
  }
);

// Custom controller: Get tickets by customer
export const getCustomerTickets: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?._id || req.params.customerId;

    if (!customerId) {
      return next(new AppError("Customer ID is required", 400));
    }

    const tickets = await getTicketsByCustomer(customerId);

    res.status(200).json({
      status: "success",
      results: tickets.length,
      data: {
        tickets,
      },
    });
  }
);

// Custom controller: Get tickets by office
export const getOfficeTickets: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { officeId } = req.params;
    const { status } = req.query;

    const tickets = await getTicketsByOffice(
      officeId,
      status as TicketStatus | undefined
    );

    res.status(200).json({
      status: "success",
      results: tickets.length,
      data: {
        tickets,
      },
    });
  }
);

// Custom controller: Get tickets assigned to technician
export const getTechnicianTickets: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const technicianId = req.user?._id || req.params.technicianId;
    const { status } = req.query;

    if (!technicianId) {
      return next(new AppError("Technician ID is required", 400));
    }

    const tickets = await getTicketsByTechnician(
      technicianId,
      status as TicketStatus | undefined
    );

    res.status(200).json({
      status: "success",
      results: tickets.length,
      data: {
        tickets,
      },
    });
  }
);

// Custom controller: Get queue statistics
export const getOfficeQueueStatistics: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { officeId } = req.params;

    const statistics = await getQueueStatistics(officeId);

    res.status(200).json({
      status: "success",
      data: {
        statistics,
      },
    });
  }
);

// Custom controller: Submit feedback
export const submitTicketFeedback: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { rating, feedbackComment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return next(
        new AppError("Rating is required and must be between 1 and 5", 400)
      );
    }

    try {
      const ticket = await submitFeedback(id, rating, feedbackComment);

      res.status(200).json({
        status: "success",
        data: {
          ticket,
        },
      });
    } catch (error: any) {
      return next(new AppError(error.message, 400));
    }
  }
);

// Custom controller: Request refund
export const requestTicketRefund: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
      const ticket = await requestRefund(id);

      res.status(200).json({
        status: "success",
        data: {
          ticket,
        },
      });
    } catch (error: any) {
      return next(new AppError(error.message, 400));
    }
  }
);
