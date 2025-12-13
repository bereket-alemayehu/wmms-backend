import { Document, Types } from "mongoose";

export type RefundStatus = "Requested" | "Approved" | "Rejected";

export interface IRefund extends Document {
  ticketId: Types.ObjectId;
  customerId: Types.ObjectId;
  amount: number;
  status: RefundStatus;
  // adminComment?: string; // Reason for rejection or approval note
  createdAt: Date;
  updatedAt: Date;
}
