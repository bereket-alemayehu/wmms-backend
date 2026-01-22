import { Document } from "mongoose";

export interface IIspData extends Document {
    serviceNumber: string;
    phoneNumber: string;
    email?: string;
    fullName?: string;
    address?: string;
    status: "active" | "suspended" | "inactive";
    accountType: "prepaid" | "postpaid";
    officeId?: string;
    createdAt: Date;
    updatedAt: Date;
}
