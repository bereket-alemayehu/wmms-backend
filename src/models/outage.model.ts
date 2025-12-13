import mongoose, { Document, Schema, Model } from "mongoose";
import { IOutage, OutageStatus } from "../interfaces/outage.interface";

const outageSchema: Schema = new mongoose.Schema(
  {
    officeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Supervisor who posted it
    },
    title: {
      type: String,
      required: true, // e.g., "Fiber Cut in Bole"
    },
    message: {
      type: String,
      required: true,
    },
    affectedAreas: [
      {
        type: String, // Array of strings: ["Bole", "Kazanchis"]
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Resolved"] as OutageStatus[],
      default: "Active",
    },
    estimatedResolution: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Outage: Model<IOutage> = mongoose.model<IOutage>("Outage", outageSchema);

export default Outage;

