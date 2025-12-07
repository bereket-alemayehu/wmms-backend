import mongoose, { Document, Schema, Model } from "mongoose";

export interface IDevice extends Document {
  deviceID: string;
  userID: string;
  status: "active" | "inactive" | "maintenance";
  createdAt: Date;
  updatedAt: Date;
}

const deviceSchema: Schema = new mongoose.Schema({
  deviceID: {
    type: String,
    required: true,
    unique: true,
  },
  userID: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "maintenance"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

deviceSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Device: Model<IDevice> = mongoose.model<IDevice>("Device", deviceSchema);

export default Device;

