
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