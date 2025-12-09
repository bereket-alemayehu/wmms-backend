import mongoose, { Document, Schema, Model } from "mongoose";
import { IOffice } from "../interfaces/office.interface";

const officeSchema: Schema = new mongoose.Schema(
  {
    cityName: {
      type: String,
      required: true,
    },
    branchName: {
      type: String,
      required: true,
    },
    location: {
      type: String, // e.g., "Bole, near Friendship Mall"
      required: true,
    },
    // Used for Queue Estimation Logic
    activeTechniciansCount: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true }
);

const Office: Model<IOffice> = mongoose.model<IOffice>("Office", officeSchema);

export default Office;
