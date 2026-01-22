import mongoose from "mongoose";
import Ticket from "../models/ticket.model";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Script to make a specific ticket refund eligible for testing
 */
const makeTicketRefundEligible = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.DATABASE || "mongodb://localhost:27017/wmms";
    
    if (!mongoUri) {
      console.error("❌ DATABASE environment variable is not defined");
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Ticket ID to update
    const ticketId = "6971e6df4eb6f7653edd889b";

    // Find and update the ticket
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      console.log(`❌ Ticket with ID ${ticketId} not found`);
      process.exit(1);
    }

    console.log("\n📋 Current Ticket Status:");
    console.log(`   ID: ${ticket._id}`);
    console.log(`   Category: ${ticket.category}`);
    console.log(`   Status: ${ticket.status}`);
    console.log(`   Refund Eligible: ${ticket.refundEligible}`);
    console.log(`   Refund Requested: ${ticket.refundRequested}`);
    console.log(`   Created At: ${ticket.createdAt}`);

    // Update ticket to be refund eligible
    ticket.refundEligible = true;
    await ticket.save();

    console.log("\n✅ Ticket updated successfully!");
    console.log("\n📋 Updated Ticket Status:");
    console.log(`   ID: ${ticket._id}`);
    console.log(`   Category: ${ticket.category}`);
    console.log(`   Status: ${ticket.status}`);
    console.log(`   Refund Eligible: ${ticket.refundEligible} ✅`);
    console.log(`   Refund Requested: ${ticket.refundRequested}`);
    console.log(`   Created At: ${ticket.createdAt}`);

    console.log("\n🎉 You can now test the refund request button on the frontend!");

    // Disconnect
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the script
makeTicketRefundEligible();

