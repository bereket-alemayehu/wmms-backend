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

// Custom getAllTickets controller that filters by logged-in user's officeId
export const getAllTickets: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get officeId from logged-in user
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    if (!req.user.officeId) {
      return next(new AppError("User does not have an assigned office", 400));
    }

    const officeId = req.user.officeId;
    const { status } = req.query;

    // Build filter query
    const filter: any = { officeId };
    if (status) {
      filter.status = status;
    }

    const tickets = await Ticket.find(filter)
      .populate("customerId officeId assignedTo")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: tickets.length,
      data: {
        documents: tickets,
      },
    });
  }
);

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
// Only allows "In Progress" and "Resolved" status changes
// "Assigned" is only set via assignment endpoint
// "Closed" is only set via customer confirmation endpoint
export const changeTicketStatus: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return next(new AppError("Status is required", 400));
    }

    // Only allow "In Progress" and "Resolved" for manual status changes
    const allowedStatuses: TicketStatus[] = ["In Progress", "Resolved"];

    if (!allowedStatuses.includes(status)) {
      return next(new AppError(
        "Invalid status. Only 'In Progress' and 'Resolved' can be set manually. " +
        "'Assigned' is set via assignment, and 'Closed' is set via customer confirmation.",
        400
      ));
    }

    // Get the ticket first to check permissions
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return next(new AppError("Ticket not found", 404));
    }

    // Permission check for technicians
    if (req.user?.role === "technician") {
      // Technicians can only update tickets assigned to them
      if (!ticket.assignedTo || ticket.assignedTo.toString() !== req.user._id.toString()) {
        return next(new AppError("You can only update status of tickets assigned to you", 403));
      }
    }

    // Update the ticket status
    const updatedTicket = await updateTicketStatus(id, status);

    if (!updatedTicket) {
      return next(new AppError("Failed to update ticket status", 500));
    }

    res.status(200).json({
      status: "success",
      data: {
        ticket: updatedTicket,
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
    // Get officeId from logged-in user
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    if (!req.user.officeId) {
      return next(new AppError("User does not have an assigned office", 400));
    }

    const officeId = req.user.officeId;
    const { status } = req.query;

    const tickets = await getTicketsByOffice(
      officeId.toString(),
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
    // Get officeId from logged-in user
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    if (!req.user.officeId) {
      return next(new AppError("User does not have an assigned office", 400));
    }

    const officeId = req.user.officeId.toString();

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
      const result = await requestRefund(id);

      res.status(200).json({
        status: "success",
        data: {
          ticket: result.ticket,
          refund: result.refund,
        },
      });
    } catch (error: any) {
      return next(new AppError(error.message, 400));
    }
  }
);

// Custom controller: Customer confirms resolution (changes status to Closed)
export const confirmTicketResolution: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Get the ticket
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return next(new AppError("Ticket not found", 404));
    }

    // Only customers can confirm resolution
    if (req.user?.role !== "customer") {
      return next(new AppError("Only customers can confirm ticket resolution", 403));
    }

    // Check if the ticket belongs to the customer
    if (ticket.customerId.toString() !== req.user._id.toString()) {
      return next(new AppError("You can only confirm your own tickets", 403));
    }

    // Only "Resolved" tickets can be confirmed
    if (ticket.status !== "Resolved") {
      return next(new AppError("Only resolved tickets can be confirmed", 400));
    }

    // Update status to Closed
    const updatedTicket = await updateTicketStatus(id, "Closed");

    if (!updatedTicket) {
      return next(new AppError("Failed to confirm ticket resolution", 500));
    }

    res.status(200).json({
      status: "success",
      message: "Ticket resolution confirmed successfully",
      data: {
        ticket: updatedTicket,
      },
    });
  }
);

// Custom controller: Customer marks ticket as not resolved (changes status back to In Progress)
export const markTicketNotResolved: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Get the ticket
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return next(new AppError("Ticket not found", 404));
    }

    // Only customers can mark as not resolved
    if (req.user?.role !== "customer") {
      return next(new AppError("Only customers can mark tickets as not resolved", 403));
    }

    // Check if the ticket belongs to the customer
    if (ticket.customerId.toString() !== req.user._id.toString()) {
      return next(new AppError("You can only mark your own tickets as not resolved", 403));
    }

    // Only "Resolved" tickets can be marked as not resolved
    if (ticket.status !== "Resolved") {
      return next(new AppError("Only resolved tickets can be marked as not resolved", 400));
    }

    // Update status back to In Progress
    const updatedTicket = await updateTicketStatus(id, "In Progress");

    if (!updatedTicket) {
      return next(new AppError("Failed to mark ticket as not resolved", 500));
    }

    res.status(200).json({
      status: "success",
      message: "Ticket marked as not resolved. Status changed to 'In Progress'",
      data: {
        ticket: updatedTicket,
      },
    });
  }
);
