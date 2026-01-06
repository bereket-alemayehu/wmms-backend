import mongoose, { Document, Schema, Model } from "mongoose";
import { ITicket, TicketCategory, TicketStatus } from "../interfaces/ticket.interface";

const ticketSchema: Schema = new mongoose.Schema(
  {
    // Requester Info
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer ID is required"],
    },
    officeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: [true, "Office ID is required"],
    },

    // Issue Details
    category: {
      type: String,
      enum: ["Speed Issue", "No Connection", "Hardware Fault", "Other"] as TicketCategory[],
      required: [true, "Category is required"],
    },
    description: {
      type: String,
      trim: true,
    },

    // Workflow Status
    status: {
      type: String,
      enum: ["Pending", "Assigned", "In Progress", "Resolved", "Closed"] as TicketStatus[],
      default: "Pending",
    },

    // Assignment (Supervisor assigns to Technician)
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Links to a Technician/Driver
    },

    // SLA & Refunds
    refundEligible: {
      type: Boolean,
      default: false,
    },
    refundRequested: {
      type: Boolean,
      default: false,
    },

    // Feedback (Post-Closure)
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
    },
    feedbackComment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
ticketSchema.index({ customerId: 1, createdAt: -1 });
ticketSchema.index({ officeId: 1, status: 1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ status: 1, createdAt: 1 });

const Ticket: Model<ITicket> = mongoose.model<ITicket>("Ticket", ticketSchema);

export default Ticket;

