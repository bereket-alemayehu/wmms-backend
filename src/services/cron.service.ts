import cron from "node-cron";
import Ticket from "../models/ticket.model";
import { requestRefund } from "./ticket.service";

/**
 * Cron job to automatically process refund requests for eligible tickets
 * Runs daily at 2:00 AM
 */
export const startRefundCronJob = () => {
  // Schedule: Run every day at 2:00 AM
  // Format: minute hour day month weekday
  cron.schedule("0 2 * * *", async () => {
    console.log("🕐 [Cron Job] Starting automatic refund processing...");

    try {
      // Find all tickets that are:
      // 1. Eligible for refund (refundEligible = true)
      // 2. Haven't requested refund yet (refundRequested = false)
      const eligibleTickets = await Ticket.find({
        refundEligible: true,
        refundRequested: false,
      });

      console.log(
        `📋 [Cron Job] Found ${eligibleTickets.length} eligible tickets for automatic refund`
      );

      let successCount = 0;
      let failCount = 0;

      // Process each eligible ticket
      for (const ticket of eligibleTickets) {
        try {
          await requestRefund(ticket._id.toString());
          successCount++;
          console.log(
            `✅ [Cron Job] Successfully processed refund for ticket ${ticket._id}`
          );
        } catch (error: any) {
          failCount++;
          console.error(
            `❌ [Cron Job] Failed to process refund for ticket ${ticket._id}: ${error.message}`
          );
        }
      }

      console.log(
        `✨ [Cron Job] Automatic refund processing completed. Success: ${successCount}, Failed: ${failCount}`
      );
    } catch (error: any) {
      console.error(
        `💥 [Cron Job] Error during automatic refund processing: ${error.message}`
      );
    }
  });

  console.log("✅ Automatic refund processing cron job scheduled (runs daily at 2:00 AM)");
};

/**
 * Optional: Manual trigger for testing purposes
 * You can call this function to test the cron job logic without waiting
 */
export const manuallyProcessRefunds = async (): Promise<{
  total: number;
  success: number;
  failed: number;
}> => {
  console.log("🔧 [Manual] Starting manual refund processing...");

  try {
    const eligibleTickets = await Ticket.find({
      refundEligible: true,
      refundRequested: false,
    });

    console.log(
      `📋 [Manual] Found ${eligibleTickets.length} eligible tickets for refund`
    );

    let successCount = 0;
    let failCount = 0;

    for (const ticket of eligibleTickets) {
      try {
        await requestRefund(ticket._id.toString());
        successCount++;
      } catch (error: any) {
        failCount++;
        console.error(
          `❌ [Manual] Failed to process refund for ticket ${ticket._id}: ${error.message}`
        );
      }
    }

    console.log(
      `✨ [Manual] Manual refund processing completed. Success: ${successCount}, Failed: ${failCount}`
    );

    return {
      total: eligibleTickets.length,
      success: successCount,
      failed: failCount,
    };
  } catch (error: any) {
    console.error(
      `💥 [Manual] Error during manual refund processing: ${error.message}`
    );
    throw error;
  }
};

