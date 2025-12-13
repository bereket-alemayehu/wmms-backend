
/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     description: Retrieve the full list of users
 *     tags:
 *       - users
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *   post:
 *     description: Create a new user
 *     tags:
 *       - users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: user created
 */
/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     description: Retrieve a specific user by ID
 *     tags:
 *       - users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: ID of the user to retrieve
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: user not found
 *   patch:
 *     description: Update a user by ID
 *     tags:
 *       - users
 *     parameters:
 *       - name: id
 *         description: ID of the user to update
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: user updated
 *   delete:
 *     description: Delete a user by ID
 *     tags:
 *       - users
 *     parameters:
 *       - name: id
 *         description: ID of the user to delete
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: user deleted
 */