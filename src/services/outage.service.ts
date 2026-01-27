import { Types } from "mongoose";
import Ticket from "../models/ticket.model";
import Outage from "../models/outage.model";
import Office from "../models/office.model";
import User from "../models/user.model";
import { notifyOutageCreated } from "./notification.service";

/**
 * Detects mass connectivity issues and automatically creates an outage record
 * Rules:
 * - 5+ tickets from same office within 1 hour
 * - No active outage already exists for that office
 * - "Resolved" tickets are not counted
 */
export const detectAndCreateOutage = async (officeId: string | Types.ObjectId): Promise<void> => {
    try {
        const id = typeof officeId === "string" ? new Types.ObjectId(officeId) : officeId;

        // 1. Check for existing Active outage
        const existingOutage = await Outage.findOne({
            officeId: id,
            status: "Active",
        });

        if (existingOutage) {
            console.log(`[Outage Detection] Active outage already exists for office ${officeId}. Skipping.`);
            return;
        }

        // 2. Count tickets created within the last 1 hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const ticketCount = await Ticket.countDocuments({
            officeId: id,
            status: { $ne: "Resolved" },
            createdAt: { $gte: oneHourAgo },
        });

        console.log(`[Outage Detection] Found ${ticketCount} recent tickets for office ${officeId}`);

        // 3. Auto-Create Outage if threshold reached (5 tickets)
        if (ticketCount >= 5) {
            console.log(`[Outage Detection] Mass issue detected! Creating auto-outage for office ${officeId}`);

            // Fetch office details for location
            const office = await Office.findById(id);
            if (!office) {
                console.error(`[Outage Detection] Office ${officeId} not found. Cannot create outage.`);
                return;
            }

            // Find a manager to be the "postedBy" (system default)
            const manager = await User.findOne({ role: "manager" });
            if (!manager) {
                console.error(`[Outage Detection] No manager found to post auto-outage.`);
                return;
            }

            // Create new outage
            const newOutage = await Outage.create({
                officeId: id,
                postedBy: manager._id,
                title: "Mass Connectivity Issue Detected",
                message: "Multiple customers reported issues within a short time. Our team is investigating.",
                affectedAreas: [office.location],
                status: "Active",
            });

            // Notify all users in the office
            const io = globalThis.io;
            await notifyOutageCreated(id, newOutage._id, newOutage.title, io);

            console.log(`[Outage Detection] Successfully created Mass Outage for ${office.branchName}`);
        }
    } catch (error) {
        console.error(`[Outage Detection] Error during detection:`, error);
    }
};
