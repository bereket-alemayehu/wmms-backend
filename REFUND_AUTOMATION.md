# Automatic Refund Processing System

## Overview
This document explains the automatic refund processing system that has been implemented in the WMMS backend.

## Key Changes

### 1. **Enhanced Refund Request Flow**
Previously, requesting a refund only set `refundRequested: true` on the ticket. Now it:
- ✅ Updates the ticket's `refundRequested` field to `true`
- ✅ Creates a new `Refund` document with status "Requested"
- ✅ Automatically calculates the refund amount based on business logic

**Location:** `src/services/ticket.service.ts` - `requestRefund()` function

**Refund Amount Calculation:**
```typescript
Base Amount: $50
+ Time-based: $10 per day since ticket creation
Max Cap: $250
```

### 2. **Automated Daily Cron Job**
A cron job runs **daily at 2:00 AM** to automatically process refunds for eligible tickets.

**Location:** `src/services/cron.service.ts`

**What it does:**
- Finds all tickets where `refundEligible = true` AND `refundRequested = false`
- Calls `requestRefund()` for each eligible ticket
- Creates refund documents automatically
- Logs success/failure for each ticket

**Schedule:** `0 2 * * *` (2:00 AM every day)

### 3. **Manual Refund Creation Removed**
The manual `POST /refunds` endpoint has been **disabled** because refunds should only be created through ticket refund requests.

**Location:** `src/routes/refund.routes.ts`
```typescript
// .post(restrictTo("customer", "supervisor", "manager"), createRefund); // Removed
```

### 4. **Cron Job Initialization**
The cron job is automatically started when the Express app initializes.

**Location:** `src/app.ts`
```typescript
startRefundCronJob();
```

## How It Works

### Manual Refund Request (By Customer/User)
1. User clicks "Request Refund" on a ticket
2. Frontend calls `POST /tickets/:id/request-refund`
3. Backend:
   - Validates ticket eligibility
   - Sets `refundRequested: true`
   - Creates a `Refund` document
   - Returns both ticket and refund data

### Automatic Refund Processing (Daily Cron Job)
1. Cron job runs at 2:00 AM daily
2. Queries for eligible tickets:
   ```javascript
   {
     refundEligible: true,
     refundRequested: false
   }
   ```
3. For each ticket:
   - Calls `requestRefund(ticketId)`
   - Creates refund document
   - Logs result
4. Reports summary (success/failed counts)

## Testing

### Test Automatic Processing Manually
You can test the cron job logic without waiting for 2:00 AM:

```typescript
import { manuallyProcessRefunds } from './services/cron.service';

const result = await manuallyProcessRefunds();
console.log(result);
// Output: { total: 5, success: 5, failed: 0 }
```

### Monitor Cron Job
Look for these console logs:
- `✅ Automatic refund processing cron job scheduled (runs daily at 2:00 AM)` - On startup
- `🕐 [Cron Job] Starting automatic refund processing...` - When cron runs
- `✨ [Cron Job] Automatic refund processing completed. Success: X, Failed: Y` - Summary

## API Changes

### `POST /tickets/:id/request-refund`
**Before:**
```json
{
  "status": "success",
  "data": {
    "ticket": { ... }
  }
}
```

**After:**
```json
{
  "status": "success",
  "data": {
    "ticket": { ... },
    "refund": {
      "_id": "...",
      "ticketId": "...",
      "customerId": "...",
      "amount": 120,
      "status": "Requested"
    }
  }
}
```

### `POST /refunds` (Removed)
This endpoint has been **disabled**. Refunds are now created automatically through ticket refund requests.

## Dependencies Added
```json
{
  "node-cron": "^4.2.1",
  "@types/node-cron": "^3.0.11"
}
```

## Files Modified
1. `src/services/ticket.service.ts` - Enhanced `requestRefund()` to create refund documents
2. `src/controllers/ticket.controller.ts` - Updated response to include refund data
3. `src/services/cron.service.ts` - **NEW** - Cron job logic
4. `src/app.ts` - Initialize cron job on startup
5. `src/routes/refund.routes.ts` - Disabled manual refund creation

## Business Rules

### Ticket Eligibility
A ticket is eligible for refund when:
- `refundEligible = true` (set by backend based on SLA/time)
- `refundRequested = false` (hasn't been processed yet)

### Refund Status Flow
1. **Requested** - Initial status (created by system)
2. **Approved** - Manager/Supervisor approves (manual action)
3. **Rejected** - Manager/Supervisor rejects (manual action)

### Duplicate Prevention
- A ticket can only have one refund request
- If `refundRequested = true`, attempting to request again throws an error
- Cron job automatically skips tickets with existing refund requests

## Environment Variables
No new environment variables are required. The cron schedule is hardcoded as `0 2 * * *`.

To change the schedule, modify `src/services/cron.service.ts`:
```typescript
cron.schedule("0 2 * * *", async () => { ... }); // Current: 2:00 AM daily
```

## Monitoring & Maintenance

### Logs to Watch
- **Success:** `✅ [Cron Job] Successfully processed refund for ticket X`
- **Failure:** `❌ [Cron Job] Failed to process refund for ticket X: <reason>`
- **Summary:** `✨ [Cron Job] ... Success: X, Failed: Y`

### Common Failure Reasons
- Ticket already has refund requested
- Ticket not found
- Ticket not eligible for refund
- Database connection issues

## Future Enhancements
- [ ] Add admin dashboard to view cron job history
- [ ] Send email notifications when refunds are auto-processed
- [ ] Add configurable refund amount calculation rules
- [ ] Store cron job execution logs in database
- [ ] Add webhook/event system for refund processing




