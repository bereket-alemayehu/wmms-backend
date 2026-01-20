/**
 * @swagger
 * components:
 *   schemas:
 *     Outage:
 *       type: object
 *       required:
 *         - officeId
 *         - title
 *         - message
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the outage
 *           example: "507f1f77bcf86cd799439011"
 *         officeId:
 *           type: string
 *           description: Reference to the office
 *           example: "507f1f77bcf86cd799439012"
 *         postedBy:
 *           type: string
 *           description: Reference to the supervisor who posted the outage
 *           example: "507f1f77bcf86cd799439013"
 *         title:
 *           type: string
 *           description: Title of the outage
 *           example: "Fiber Cut in Bole"
 *         message:
 *           type: string
 *           description: Detailed message about the outage
 *           example: "Major fiber cut affecting multiple areas"
 *         affectedAreas:
 *           type: array
 *           items:
 *             type: string
 *           description: List of affected areas
 *           example: ["Bole", "Kazanchis", "Megenagna"]
 *         status:
 *           type: string
 *           enum: [Active, Resolved]
 *           default: Active
 *           description: Current status of the outage
 *           example: "Active"
 *         estimatedResolution:
 *           type: string
 *           format: date-time
 *           description: Estimated time for resolution
 *           example: "2024-01-15T18:00:00.000Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Outage creation timestamp
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Outage last update timestamp
 *           example: "2024-01-15T14:30:00.000Z"
 */

/**
 * @swagger
 * /api/v1/outages:
 *   get:
 *     description: Retrieve the full list of outages
 *     tags:
 *       - outages
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: outages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Outage'
 *   post:
 *     description: Create a new outage
 *     tags:
 *       - outages
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Outage'
 *     responses:
 *       201:
 *         description: outage created
 */

/**
 * @swagger
 * /api/v1/outages/{id}:
 *   get:
 *     description: Retrieve a specific outage by ID
 *     tags:
 *       - outages
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: ID of the outage to retrieve
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: outage
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Outage'
 *       404:
 *         description: outage not found
 *   patch:
 *     description: Update an outage by ID
 *     tags:
 *       - outages
 *     parameters:
 *       - name: id
 *         description: ID of the outage to update
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Outage'
 *     responses:
 *       200:
 *         description: outage updated
 *   delete:
 *     description: Delete an outage by ID
 *     tags:
 *       - outages
 *     parameters:
 *       - name: id
 *         description: ID of the outage to delete
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: outage deleted
 */
