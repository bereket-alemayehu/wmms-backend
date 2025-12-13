
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