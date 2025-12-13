import mongoose, { Document, Schema, Model } from "mongoose";
import { IRefund, RefundStatus } from "../interfaces/refund.interface";

const refundSchema: Schema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true, // Simulated amount based on downtime
    },
    status: {
      type: String,
      enum: ["Requested", "Approved", "Rejected"] as RefundStatus[],
      default: "Requested",
    },
    // adminComment: {
    //   type: String, // Reason for rejection or approval note
    // }
  },
  { timestamps: true }
);

const Refund: Model<IRefund> = mongoose.model<IRefund>("Refund", refundSchema);

export default Refund;

