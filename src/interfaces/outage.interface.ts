import { Document, Types } from "mongoose";

export type OutageStatus = "Active" | "Resolved";

export interface IOutage extends Document {
  officeId: Types.ObjectId;
  postedBy?: Types.ObjectId;
  title: string;
  message: string;
  affectedAreas: string[];
  status: OutageStatus;
  estimatedResolution?: Date;
  createdAt: Date;
  updatedAt: Date;
}
