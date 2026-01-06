import { Document, Types } from "mongoose";

export type TicketCategory = "Speed Issue" | "No Connection" | "Hardware Fault" | "Other";
export type TicketStatus = "Pending" | "Assigned" | "In Progress" | "Resolved" | "Closed";

export interface ITicket extends Document {
  // Requester Info
  customerId: Types.ObjectId;
  officeId: Types.ObjectId;

  // Issue Details
  category: TicketCategory;
  description?: string;

  // Workflow Status
  status: TicketStatus;

  // Assignment (Supervisor assigns to Technician)
  assignedTo?: Types.ObjectId;

  // SLA & Refunds
  refundEligible: boolean;
  refundRequested: boolean;

  // Feedback (Post-Closure)
  rating?: number;
  feedbackComment?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

