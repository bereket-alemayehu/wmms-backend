/**
 * @swagger
 * components:
 *   schemas:
 *     Refund:
 *       type: object
 *       required:
 *         - ticketId
 *         - customerId
 *         - amount
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the refund
 *           example: "507f1f77bcf86cd799439011"
 *         ticketId:
 *           type: string
 *           description: Reference to the ticket
 *           example: "507f1f77bcf86cd799439012"
 *         customerId:
 *           type: string
 *           description: Reference to the customer
 *           example: "507f1f77bcf86cd799439013"
 *         amount:
 *           type: number
 *           description: Refund amount
 *           example: 500.00
 *         status:
 *           type: string
 *           enum: [Requested, Approved, Rejected]
 *           default: Requested
 *           description: Current status of the refund
 *           example: "Requested"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Refund creation timestamp
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Refund last update timestamp
 *           example: "2024-01-15T14:30:00.000Z"
 */

/**
 * @swagger
 * /api/v1/refunds:
 *   get:
 *     description: Retrieve the full list of refunds
 *     tags:
 *       - refunds
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: refunds
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Refund'
 *   post:
 *     description: Create a new refund
 *     tags:
 *       - refunds
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Refund'
 *     responses:
 *       201:
 *         description: refund created
 */

/**
 * @swagger
 * /api/v1/refunds/{id}:
 *   get:
 *     description: Retrieve a specific refund by ID
 *     tags:
 *       - refunds
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: ID of the refund to retrieve
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: refund
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Refund'
 *       404:
 *         description: refund not found
 *   patch:
 *     description: Update a refund by ID
 *     tags:
 *       - refunds
 *     parameters:
 *       - name: id
 *         description: ID of the refund to update
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Refund'
 *     responses:
 *       200:
 *         description: refund updated
 *   delete:
 *     description: Delete a refund by ID
 *     tags:
 *       - refunds
 *     parameters:
 *       - name: id
 *         description: ID of the refund to delete
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: refund deleted
 */