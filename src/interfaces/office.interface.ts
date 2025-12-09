import { Document } from "mongoose";

export interface IOffice extends Document {
  cityName: string;
  branchName: string;
  location: string;
  activeTechniciansCount: number;
  createdAt: Date;
  updatedAt: Date;
}
