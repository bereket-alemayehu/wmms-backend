/**
 * @swagger
 * /api/v1/offices:
 *   get:
 *     description: Retrieve the full list of offices
 *     tags:
 *       - offices
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: offices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Office'
 *   post:
 *     description: Create a new office
 *     tags:
 *       - offices
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Office'
 *     responses:
 *       201:
 *         description: office created
 */

/**
 * @swagger
 * /api/v1/offices/{id}:
 *   get:
 *     description: Retrieve a specific office by ID
 *     tags:
 *       - offices
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: ID of the office to retrieve
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: office
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Office'
 *       404:
 *         description: office not found
 *   patch:
 *     description: Update an office by ID
 *     tags:
 *       - offices
 *     parameters:
 *       - name: id
 *         description: ID of the office to update
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Office'
 *     responses:
 *       200:
 *         description: office updated
 *   delete:
 *     description: Delete an office by ID
 *     tags:
 *       - offices
 *     parameters:
 *       - name: id
 *         description: ID of the office to delete
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: office deleted
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Office:
 *       type: object
 *       required:
 *         - cityName
 *         - branchName
 *         - location
 *       properties:
 *         id:
 *           type: string
 *         cityName:
 *           type: string
 *         branchName:
 *           type: string
 *         location:
 *           type: string
 *         activeTechniciansCount:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */