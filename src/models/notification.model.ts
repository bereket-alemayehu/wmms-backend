import mongoose from "mongoose";

export interface INotification extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: "ticket_assigned" | "ticket_resolved" | "ticket_closed" | "ticket_unresolved" | "outage_created" | "outage_resolved";
  title: string;
  message: string;
  relatedId?: mongoose.Types.ObjectId; // Ticket ID or Outage ID
  relatedType?: "ticket" | "outage";
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new mongoose.Schema<INotification>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    type: {
      type: String,
      enum: ["ticket_assigned", "ticket_resolved", "ticket_closed", "ticket_unresolved", "outage_created", "outage_resolved"],
      required: [true, "Notification type is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "relatedType",
    },
    relatedType: {
      type: String,
      enum: ["ticket", "outage"],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;

