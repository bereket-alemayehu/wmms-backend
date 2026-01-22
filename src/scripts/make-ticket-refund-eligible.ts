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
    
    const daysOld = Math.floor((Date.now() - ticket.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    console.log(`   Days Old: ${daysOld} days`);

    // Update ticket to be refund eligible and backdate creation to 8 days ago
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    
    console.log(`\n🔄 Backdating createdAt from ${ticket.createdAt} to ${eightDaysAgo}`);
    
    // Use native MongoDB collection to bypass all Mongoose protections
    await Ticket.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(ticketId) },
      { 
        $set: { 
          refundEligible: true,
          createdAt: eightDaysAgo
        } 
      }
    );
    
    // Fetch updated ticket
    const updatedTicket = await Ticket.findById(ticketId);
    if (!updatedTicket) {
      console.log("❌ Could not fetch updated ticket");
      process.exit(1);
    }

    console.log("\n✅ Ticket updated successfully!");
    console.log("\n📋 Updated Ticket Status:");
    console.log(`   ID: ${updatedTicket._id}`);
    console.log(`   Category: ${updatedTicket.category}`);
    console.log(`   Status: ${updatedTicket.status}`);
    console.log(`   Refund Eligible: ${updatedTicket.refundEligible} ✅`);
    console.log(`   Refund Requested: ${updatedTicket.refundRequested}`);
    console.log(`   Created At: ${updatedTicket.createdAt} (backdated to 8 days ago)`);
    
    const newDaysOld = Math.floor((Date.now() - updatedTicket.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    console.log(`   Days Old: ${newDaysOld} days ✅`);

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

