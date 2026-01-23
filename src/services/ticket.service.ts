import { Types } from "mongoose";
import Ticket from "../models/ticket.model";
import User from "../models/user.model";
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
 * Get technician statistics
 * Returns counts of assigned, in progress, and completed today tickets
 */
export const getTechnicianStatistics = async (
  technicianId: string | Types.ObjectId
): Promise<{
  assigned: number;
  inProgress: number;
  completedToday: number;
  total: number;
}> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [assigned, inProgress, completedToday, total] = await Promise.all([
    Ticket.countDocuments({ assignedTo: technicianId, status: "Assigned" }),
    Ticket.countDocuments({ assignedTo: technicianId, status: "In Progress" }),
    Ticket.countDocuments({
      assignedTo: technicianId,
      status: { $in: ["Resolved", "Closed"] },
      updatedAt: { $gte: today, $lt: tomorrow },
    }),
    Ticket.countDocuments({ assignedTo: technicianId }),
  ]);

  return {
    assigned,
    inProgress,
    completedToday,
    total,
  };
};

/**
 * Get system-wide analytics
 * Returns comprehensive analytics for managers
 */
export const getSystemAnalytics = async (): Promise<{
  totalTickets: number;
  resolvedTickets: number;
  pendingTickets: number;
  inProgressTickets: number;
  assignedTickets: number;
  closedTickets: number;
  resolutionRate: number;
  ticketsByCategory: {
    category: string;
    count: number;
    percentage: number;
  }[];
  ticketsByStatus: {
    status: string;
    count: number;
  }[];
  technicianPerformance: {
    technicianId: string;
    fullName: string;
    activeCount: number;
    resolvedThisMonth: number;
  }[];
}> => {
  // Get all tickets
  const allTickets = await Ticket.find({});
  const totalTickets = allTickets.length;

  // Calculate status counts
  const pendingTickets = allTickets.filter((t) => t.status === "Pending").length;
  const assignedTickets = allTickets.filter((t) => t.status === "Assigned").length;
  const inProgressTickets = allTickets.filter((t) => t.status === "In Progress").length;
  const resolvedTickets = allTickets.filter((t) => t.status === "Resolved").length;
  const closedTickets = allTickets.filter((t) => t.status === "Closed").length;
  const resolvedCount = resolvedTickets + closedTickets;

  // Calculate resolution rate
  const resolutionRate = totalTickets > 0 ? Math.round((resolvedCount / totalTickets) * 100) : 0;

  // Tickets by category
  const categories = ["No Connection", "Speed Issue", "Hardware Fault", "Other"];
  const ticketsByCategory = categories.map((category) => {
    const count = allTickets.filter((t) => t.category === category).length;
    const percentage = totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0;
    return { category, count, percentage };
  });

  // Tickets by status
  const ticketsByStatus = [
    { status: "Pending", count: pendingTickets },
    { status: "Assigned", count: assignedTickets },
    { status: "In Progress", count: inProgressTickets },
    { status: "Resolved", count: resolvedTickets },
    { status: "Closed", count: closedTickets },
  ];

  // Technician performance
  const User = (await import("../models/user.model")).default;
  const technicians = await User.find({ role: "technician" }).select("_id fullName");
  
  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0, 0, 0, 0);

  const technicianPerformance = await Promise.all(
    technicians.map(async (tech) => {
      const techId = tech._id.toString();
      
      const activeTickets = await Ticket.countDocuments({
        assignedTo: techId,
        status: { $in: ["Assigned", "In Progress"] },
      });

      const resolvedThisMonth = await Ticket.countDocuments({
        assignedTo: techId,
        status: { $in: ["Resolved", "Closed"] },
        updatedAt: { $gte: thisMonthStart },
      });

      return {
        technicianId: techId,
        fullName: tech.fullName,
        activeCount: activeTickets,
        resolvedThisMonth,
      };
    })
  );

  return {
    totalTickets,
    resolvedTickets: resolvedCount,
    pendingTickets,
    inProgressTickets,
    assignedTickets,
    closedTickets,
    resolutionRate,
    ticketsByCategory,
    ticketsByStatus,
    technicianPerformance,
  };
};

/**
 * Get top-rated technicians
 * Returns technicians sorted by average rating, with at least one rating
 * Gets ratings from tickets that are assigned to technicians
 */
export const getTopRatedTechnicians = async (limit: number = 3): Promise<{
  technicianId: string;
  fullName: string;
  averageRating: number;
  ratingCount: number;
}[]> => {
  const User = (await import("../models/user.model")).default;
  
  // Get all tickets that have ratings and are assigned to technicians
  const ratedTickets = await Ticket.find({
    rating: { $exists: true, $ne: null },
    assignedTo: { $exists: true, $ne: null },
  }).select("assignedTo rating");
  
  if (ratedTickets.length === 0) {
    return [];
  }
  
  // Group tickets by technician ID and calculate averages
  const technicianRatingsMap = new Map<string, { ratings: number[]; technicianId: string }>();
  
  for (const ticket of ratedTickets) {
    if (!ticket.assignedTo || !ticket.rating || typeof ticket.rating !== 'number') continue;
    
    const techId = typeof ticket.assignedTo === 'string' 
      ? ticket.assignedTo 
      : ticket.assignedTo.toString();
    
    if (!technicianRatingsMap.has(techId)) {
      technicianRatingsMap.set(techId, { ratings: [], technicianId: techId });
    }
    
    technicianRatingsMap.get(techId)!.ratings.push(ticket.rating);
  }
  
  // Get technician details and calculate averages
  const technicianRatings = await Promise.all(
    Array.from(technicianRatingsMap.entries()).map(async ([techId, data]) => {
      const technician = await User.findById(techId).select("fullName");
      
      if (!technician) {
        return null;
      }
      
      const ratings = data.ratings;
      const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
      const averageRating = totalRating / ratings.length;
      
      return {
        technicianId: techId,
        fullName: technician.fullName,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        ratingCount: ratings.length,
      };
    })
  );
  
  // Filter out nulls, sort by average rating (descending), then by count (descending), and limit
  return technicianRatings
    .filter((rating): rating is NonNullable<typeof rating> => rating !== null)
    .sort((a, b) => {
      // Sort by average rating first (descending)
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }
      // Then by rating count (descending)
      return b.ratingCount - a.ratingCount;
    })
    .slice(0, limit);
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
    officeId: updatedTicket.officeId,
    amount: calculateRefundAmount(ticket),
    status: "Requested",
  });

  return { ticket: updatedTicket, refund };
};

/**
 * Find the best technician to assign a ticket based on workload
 * Returns the technician with the least number of "In Progress" and "Assigned" tickets
 */
export const findBestTechnicianForAssignment = async (
  officeId: string | Types.ObjectId
): Promise<Types.ObjectId | null> => {
  // Find all active technicians in the same office
  const technicians = await User.find({
    role: "technician",
    officeId: officeId,
    active: true,
  }).select("_id");

  if (technicians.length === 0) {
    return null; // No technicians available in this office
  }

  const technicianIds = technicians.map((tech) => tech._id);

  // Count active tickets (In Progress + Assigned) for each technician
  const workloadPromises = technicianIds.map(async (technicianId) => {
    const activeTicketCount = await Ticket.countDocuments({
      assignedTo: technicianId,
      status: { $in: ["Assigned", "In Progress"] },
    });

    return {
      technicianId,
      workload: activeTicketCount,
    };
  });

  const workloads = await Promise.all(workloadPromises);

  // Sort by workload (ascending) and return the technician with least workload
  workloads.sort((a, b) => a.workload - b.workload);

  // Return the technician with the least workload
  // If multiple have the same workload, return the first one
  return workloads[0]?.technicianId || null;
};
