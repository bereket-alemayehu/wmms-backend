import mongoose from "mongoose";
import { IIspData } from "../interfaces/isp.interface";

const ispDataSchema = new mongoose.Schema(
    {
        serviceNumber: {
            type: String,
            required: [true, "Service number is required"],
            unique: true,
            uppercase: true,
            trim: true,
        },
        phoneNumber: {
            type: String,
            required: [true, "Phone number is required"],
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
        },
        status: {
            type: String,
            enum: ["active", "suspended", "inactive"],
            default: "active",
        },
        accountType: {
            type: String,
            enum: ["prepaid", "postpaid"],
            default: "postpaid",
        },
        officeId: {
            type: String, // String to match the mock data's hex IDs for now
        },
    },
    { timestamps: true }
);

const IspData = mongoose.model<IIspData>("IspData", ispDataSchema, "ispdata");

export default IspData;
