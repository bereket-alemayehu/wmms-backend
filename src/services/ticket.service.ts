import { Types } from "mongoose";
import Ticket from "../models/ticket.model";
import { ITicket, TicketStatus } from "../interfaces/ticket.interface";

/**
 * Calculate queue position for a ticket
 * Queue position is based on tickets with same status (Pending/Assigned) created before this ticket
 */
export const getQueuePosition = async (
  ticketId: string | Types.ObjectId,
  officeId: string | Types.ObjectId
): Promise<number> => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new Error("Ticket not found");
  }

  // Count tickets in queue (Pending or Assigned) created before this ticket
  const queueCount = await Ticket.countDocuments({
    officeId: officeId,
    status: { $in: ["Pending", "Assigned"] },
    createdAt: { $lt: ticket.createdAt },
  });

  return queueCount + 1; // Position is 1-indexed
};

/**
 * Check if ticket is eligible for refund (>7 days unresolved)
 */
export const checkRefundEligibility = async (
  ticketId: string | Types.ObjectId
): Promise<boolean> => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    return false;
  }

  // Check if ticket is still unresolved (not Resolved or Closed)
  if (ticket.status === "Resolved" || ticket.status === "Closed") {
    return false;
  }

  // Check if ticket is older than 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  if (ticket.createdAt < sevenDaysAgo) {
    // Update refundEligible flag
    await Ticket.findByIdAndUpdate(ticketId, { refundEligible: true });
    return true;
  }

  return false;
};

/**
 * Assign ticket to a technician
 */
export const assignTicket = async (
  ticketId: string | Types.ObjectId,
  technicianId: string | Types.ObjectId
): Promise<ITicket | null> => {
  const ticket = await Ticket.findByIdAndUpdate(
    ticketId,
    {
      assignedTo: technicianId,
      status: "Assigned",
    },
    { new: true, runValidators: true }
  ).populate("assignedTo", "fullName phoneNumber");

  return ticket;
};

/**
 * Update ticket status
 */
export const updateTicketStatus = async (
  ticketId: string | Types.ObjectId,
  status: TicketStatus,
  assignedTo?: string | Types.ObjectId
): Promise<ITicket | null> => {
  const updateData: any = { status };

  // If status is "Assigned", ensure assignedTo is set
  if (status === "Assigned" && assignedTo) {
    updateData.assignedTo = assignedTo;
  }

  // If status is "Resolved" or "Closed", check refund eligibility
  if (status === "Resolved" || status === "Closed") {
    const ticket = await Ticket.findById(ticketId);
    if (ticket && ticket.createdAt) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      if (ticket.createdAt < sevenDaysAgo) {
        updateData.refundEligible = true;
      }
    }
  }

  const ticket = await Ticket.findByIdAndUpdate(ticketId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("customerId", "fullName phoneNumber serviceNumber")
    .populate("officeId", "name address")
    .populate("assignedTo", "fullName phoneNumber");

  return ticket;
};

/**
 * Get tickets by customer
 */
export const getTicketsByCustomer = async (
  customerId: string | Types.ObjectId
): Promise<ITicket[]> => {
  return await Ticket.find({ customerId })
    .populate("officeId", "name address")
    .populate("assignedTo", "fullName phoneNumber")
    .sort({ createdAt: -1 });
};

/**
 * Get tickets by office
 */
export const getTicketsByOffice = async (
  officeId: string | Types.ObjectId,
  status?: TicketStatus
): Promise<ITicket[]> => {
  const query: any = { officeId };
  if (status) {
    query.status = status;
  }

  return await Ticket.find(query)
    .populate("customerId", "fullName phoneNumber serviceNumber")
    .populate("assignedTo", "fullName phoneNumber")
    .sort({ createdAt: -1 });
};

/**
 * Get tickets assigned to a technician
 */
export const getTicketsByTechnician = async (
  technicianId: string | Types.ObjectId,
  status?: TicketStatus
): Promise<ITicket[]> => {
  const query: any = { assignedTo: technicianId };
  if (status) {
    query.status = status;
  }

  return await Ticket.find(query)
    .populate("customerId", "fullName phoneNumber serviceNumber")
    .populate("officeId", "name address")
    .sort({ createdAt: -1 });
};

/**
 * Get queue statistics for an office
 */
export const getQueueStatistics = async (
  officeId: string | Types.ObjectId
): Promise<{
  pending: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  closed: number;
  total: number;
}> => {
  const [pending, assigned, inProgress, resolved, closed, total] =
    await Promise.all([
      Ticket.countDocuments({ officeId, status: "Pending" }),
      Ticket.countDocuments({ officeId, status: "Assigned" }),
      Ticket.countDocuments({ officeId, status: "In Progress" }),
      Ticket.countDocuments({ officeId, status: "Resolved" }),
      Ticket.countDocuments({ officeId, status: "Closed" }),
      Ticket.countDocuments({ officeId }),
    ]);

  return {
    pending,
    assigned,
    inProgress,
    resolved,
    closed,
    total,
  };
};

/**
 * Submit feedback for a closed ticket
 */
export const submitFeedback = async (
  ticketId: string | Types.ObjectId,
  rating: number,
  feedbackComment?: string
): Promise<ITicket | null> => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  if (ticket.status !== "Closed") {
    throw new Error("Feedback can only be submitted for closed tickets");
  }

  return await Ticket.findByIdAndUpdate(
    ticketId,
    {
      rating,
      feedbackComment,
    },
    { new: true, runValidators: true }
  );
};

/**
 * Request refund for eligible ticket
 */
export const requestRefund = async (
  ticketId: string | Types.ObjectId
): Promise<{ ticket: ITicket; refund: any }> => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  if (!ticket.refundEligible) {
    throw new Error("Ticket is not eligible for refund");
  }

  if (ticket.refundRequested) {
    throw new Error("Refund has already been requested for this ticket");
  }

  // Calculate refund amount (you can adjust this logic based on your business rules)
  // For example: base amount + time-based calculation
  const calculateRefundAmount = (ticket: ITicket): number => {
    // Example: $50 base + $10 per day since ticket creation
    const baseAmount = 50;
    const daysOpen = Math.floor(
      (Date.now() - ticket.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return baseAmount + Math.min(daysOpen * 10, 200); // Cap at $250
  };

  // Update ticket
  const updatedTicket = await Ticket.findByIdAndUpdate(
    ticketId,
    { refundRequested: true },
    { new: true, runValidators: true }
  );

  if (!updatedTicket) {
    throw new Error("Failed to update ticket");
  }

  // Create refund document
  const Refund = require("../models/refund.model").default;
  const refund = await Refund.create({
    ticketId: updatedTicket._id,
    customerId: updatedTicket.customerId,
    amount: calculateRefundAmount(ticket),
    status: "Requested",
  });

  return { ticket: updatedTicket, refund };
};
