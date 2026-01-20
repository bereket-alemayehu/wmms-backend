/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       required:
 *         - customerId
 *         - officeId
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the ticket
 *           example: "507f1f77bcf86cd799439011"
 *         customerId:
 *           type: string
 *           description: Reference to the customer (User) who created the ticket
 *           example: "507f1f77bcf86cd799439012"
 *         officeId:
 *           type: string
 *           description: Reference to the office handling the ticket
 *           example: "507f1f77bcf86cd799439013"
 *         category:
 *           type: string
 *           enum: [Speed Issue, No Connection, Hardware Fault, Other]
 *           description: Category of the issue
 *           example: "No Connection"
 *         description:
 *           type: string
 *           description: Detailed description of the issue
 *           example: "Internet connection has been down for 2 days"
 *         status:
 *           type: string
 *           enum: [Pending, Assigned, In Progress, Resolved, Closed]
 *           default: Pending
 *           description: Current status of the ticket
 *           example: "Pending"
 *         assignedTo:
 *           type: string
 *           description: Reference to the technician assigned to the ticket
 *           example: "507f1f77bcf86cd799439014"
 *         refundEligible:
 *           type: boolean
 *           default: false
 *           description: Whether the ticket is eligible for refund (>7 days unresolved)
 *           example: false
 *         refundRequested:
 *           type: boolean
 *           default: false
 *           description: Whether a refund has been requested for this ticket
 *           example: false
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Customer rating after ticket closure (1-5)
 *           example: 4
 *         feedbackComment:
 *           type: string
 *           description: Customer feedback comment after ticket closure
 *           example: "Great service, issue resolved quickly"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Ticket creation timestamp
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Ticket last update timestamp
 *           example: "2024-01-15T14:30:00.000Z"
 *     TicketCreate:
 *       type: object
 *       required:
 *         - customerId
 *         - officeId
 *         - category
 *       properties:
 *         customerId:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         officeId:
 *           type: string
 *           example: "507f1f77bcf86cd799439013"
 *         category:
 *           type: string
 *           enum: [Speed Issue, No Connection, Hardware Fault, Other]
 *           example: "No Connection"
 *         description:
 *           type: string
 *           example: "Internet connection has been down for 2 days"
 *     TicketUpdate:
 *       type: object
 *       properties:
 *         category:
 *           type: string
 *           enum: [Speed Issue, No Connection, Hardware Fault, Other]
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Pending, Assigned, In Progress, Resolved, Closed]
 *         assignedTo:
 *           type: string
 *     TicketAssign:
 *       type: object
 *       required:
 *         - technicianId
 *       properties:
 *         technicianId:
 *           type: string
 *           description: ID of the technician to assign the ticket to
 *           example: "507f1f77bcf86cd799439014"
 *     TicketStatusUpdate:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [Pending, Assigned, In Progress, Resolved, Closed]
 *           example: "In Progress"
 *         assignedTo:
 *           type: string
 *           description: Optional technician ID (required if status is Assigned)
 *           example: "507f1f77bcf86cd799439014"
 *     TicketFeedback:
 *       type: object
 *       required:
 *         - rating
 *       properties:
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Rating from 1 to 5
 *           example: 4
 *         feedbackComment:
 *           type: string
 *           description: Optional feedback comment
 *           example: "Great service, issue resolved quickly"
 *     QueuePosition:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             ticketId:
 *               type: string
 *               example: "507f1f77bcf86cd799439011"
 *             queuePosition:
 *               type: number
 *               description: Position in the queue (1-indexed)
 *               example: 3
 *     RefundEligibility:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             ticketId:
 *               type: string
 *               example: "507f1f77bcf86cd799439011"
 *             refundEligible:
 *               type: boolean
 *               example: true
 *             refundRequested:
 *               type: boolean
 *               example: false
 *     QueueStatistics:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             statistics:
 *               type: object
 *               properties:
 *                 pending:
 *                   type: number
 *                   example: 5
 *                 assigned:
 *                   type: number
 *                   example: 3
 *                 inProgress:
 *                   type: number
 *                   example: 2
 *                 resolved:
 *                   type: number
 *                   example: 10
 *                 closed:
 *                   type: number
 *                   example: 25
 *                 total:
 *                   type: number
 *                   example: 45
 */

/**
 * @swagger
 * /api/v1/tickets:
 *   get:
 *     summary: Retrieve all tickets
 *     description: Get a list of all tickets. Requires supervisor, manager, or technician role.
 *     tags:
 *       - tickets
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [Pending, Assigned, In Progress, Resolved, Closed]
 *         description: Filter tickets by status
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *           enum: [Speed Issue, No Connection, Hardware Fault, Other]
 *         description: Filter tickets by category
 *       - name: officeId
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter tickets by office
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: List of tickets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: number
 *                   example: 10
 *                 data:
 *                   type: object
 *                   properties:
 *                     documents:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *   post:
 *     summary: Create a new ticket
 *     description: Create a new support ticket. Available to all authenticated users (customers).
 *     tags:
 *       - tickets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketCreate'
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     document:
 *                       $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 */

/**
 * @swagger
 * /api/v1/tickets/{id}:
 *   get:
 *     summary: Get a specific ticket by ID
 *     description: Retrieve details of a specific ticket. Available to all authenticated users.
 *     tags:
 *       - tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     document:
 *                       $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Ticket not found
 *   patch:
 *     summary: Update a ticket
 *     description: Update ticket details. Requires supervisor, manager, or technician role.
 *     tags:
 *       - tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketUpdate'
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Ticket not found
 *   delete:
 *     summary: Delete a ticket
 *     description: Delete a ticket. Requires manager role.
 *     tags:
 *       - tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       204:
 *         description: Ticket deleted successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions (Manager only)
 *       404:
 *         description: Ticket not found
 */

/**
 * @swagger
 * /api/v1/tickets/{id}/queue-position:
 *   get:
 *     summary: Get queue position for a ticket
 *     description: Calculate and return the position of a ticket in the queue based on creation time and status.
 *     tags:
 *       - tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Queue position retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QueuePosition'
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Ticket not found
 */

/**
 * @swagger
 * /api/v1/tickets/{id}/refund-eligibility:
 *   get:
 *     summary: Check refund eligibility for a ticket
 *     description: Check if a ticket is eligible for refund (unresolved for more than 7 days).
 *     tags:
 *       - tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Refund eligibility checked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefundEligibility'
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Ticket not found
 */

/**
 * @swagger
 * /api/v1/tickets/{id}/assign:
 *   patch:
 *     summary: Assign ticket to a technician
 *     description: Assign a ticket to a specific technician. Requires supervisor or manager role.
 *     tags:
 *       - tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketAssign'
 *     responses:
 *       200:
 *         description: Ticket assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     ticket:
 *                       $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Bad request - Technician ID is required
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions (Supervisor/Manager only)
 *       404:
 *         description: Ticket not found
 */

/**
 * @swagger
 * /api/v1/tickets/{id}/status:
 *   patch:
 *     summary: Update ticket status
 *     description: Update the status of a ticket. Requires supervisor, manager, or technician role.
 *     tags:
 *       - tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketStatusUpdate'
 *     responses:
 *       200:
 *         description: Ticket status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     ticket:
 *                       $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Bad request - Invalid status or missing required fields
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Ticket not found
 */

/**
 * @swagger
 * /api/v1/tickets/customer/my-tickets:
 *   get:
 *     summary: Get tickets for the current customer
 *     description: Retrieve all tickets created by the currently authenticated customer.
 *     tags:
 *       - tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [Pending, Assigned, In Progress, Resolved, Closed]
 *         description: Filter tickets by status
 *     responses:
 *       200:
 *         description: Customer tickets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: number
 *                   example: 5
 *                 data:
 *                   type: object
 *                   properties:
 *                     tickets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized - Authentication required
 */

/**
 * @swagger
 * /api/v1/tickets/office/{officeId}/tickets:
 *   get:
 *     summary: Get tickets for a specific office
 *     description: Retrieve all tickets associated with a specific office.
 *     tags:
 *       - tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: officeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Office ID
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [Pending, Assigned, In Progress, Resolved, Closed]
 *         description: Filter tickets by status
 *     responses:
 *       200:
 *         description: Office tickets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: number
 *                   example: 10
 *                 data:
 *                   type: object
 *                   properties:
 *                     tickets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized - Authentication required
 */

/**
 * @swagger
 * /api/v1/tickets/technician/my-tickets:
 *   get:
 *     summary: Get tickets assigned to the current technician
 *     description: Retrieve all tickets assigned to the currently authenticated technician.
 *     tags:
 *       - tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [Pending, Assigned, In Progress, Resolved, Closed]
 *         description: Filter tickets by status
 *     responses:
 *       200:
 *         description: Technician tickets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: number
 *                   example: 3
 *                 data:
 *                   type: object
 *                   properties:
 *                     tickets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized - Authentication required
 *       400:
 *         description: Bad request - Technician ID is required
 */

/**
 * @swagger
 * /api/v1/tickets/office/{officeId}/statistics:
 *   get:
 *     summary: Get queue statistics for an office
 *     description: Retrieve statistics about ticket queue for a specific office (pending, assigned, in progress, resolved, closed counts).
 *     tags:
 *       - tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: officeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Office ID
 *     responses:
 *       200:
 *         description: Queue statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QueueStatistics'
 *       401:
 *         description: Unauthorized - Authentication required
 */

/**
 * @swagger
 * /api/v1/tickets/{id}/feedback:
 *   post:
 *     summary: Submit feedback for a closed ticket
 *     description: Submit rating and feedback comment for a closed ticket. Only available for closed tickets.
 *     tags:
 *       - tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketFeedback'
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     ticket:
 *                       $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Bad request - Rating required (1-5) or ticket not closed
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Ticket not found
 */

/**
 * @swagger
 * /api/v1/tickets/{id}/request-refund:
 *   post:
 *     summary: Request refund for an eligible ticket
 *     description: Request a refund for a ticket that is eligible (unresolved for more than 7 days). Prevents duplicate requests.
 *     tags:
 *       - tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Refund requested successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     ticket:
 *                       $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Bad request - Ticket not eligible for refund or refund already requested
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Ticket not found
 */



