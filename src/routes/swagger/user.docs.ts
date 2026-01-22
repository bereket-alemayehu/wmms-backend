/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users in your office
 *     description: Retrieve all users filtered by the logged-in user's officeId. Only returns users from the same office.
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [customer, technician, supervisor, manager]
 *         description: Filter by user role
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: List of users in your office
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
 *                     documents:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       400:
 *         description: User does not have an assigned office
 *       401:
 *         description: Not authenticated
 *   post:
 *     summary: Create a new user
 *     description: Create a new user. Staff (technician/supervisor) are automatically assigned to your office.
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: User does not have an assigned office
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Only managers can create users
 */

/**
 * @swagger
 * /api/v1/users/technicians:
 *   get:
 *     summary: Get technicians in your office
 *     description: Retrieve all technicians filtered by the logged-in user's officeId. Only returns technicians from the same office. Accessible to managers, supervisors, and technicians.
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: List of technicians in your office
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
 *                     technicians:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       400:
 *         description: User does not have an assigned office
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/v1/users/supervisors:
 *   get:
 *     summary: Get supervisors in your office
 *     description: Retrieve all supervisors filtered by the logged-in user's officeId. Only returns supervisors from the same office. Accessible to managers, supervisors, and technicians.
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: List of supervisors in your office
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
 *                   example: 2
 *                 data:
 *                   type: object
 *                   properties:
 *                     supervisors:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       400:
 *         description: User does not have an assigned office
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/v1/users/customers:
 *   get:
 *     summary: Get customers in your office
 *     description: Retrieve all customers who have tickets in your office. Only returns customers associated with your office through tickets. Accessible to managers, supervisors, and technicians.
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: List of customers in your office
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
 *                     customers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       400:
 *         description: User does not have an assigned office
 *       401:
 *         description: Not authenticated
 */
/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get a specific user by ID
 *     description: Retrieve a specific user. Only accessible if the user belongs to your office (for staff) or has tickets in your office (for customers). Accessible to managers, supervisors, and technicians.
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
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
 *         description: User details
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
 *                       $ref: '#/components/schemas/User'
 *       403:
 *         description: You do not have permission to access this user
 *       404:
 *         description: User not found
 *   patch:
 *     summary: Update a user by ID
 *     description: Update a user. Only accessible if the user belongs to your office. Cannot change officeId to a different office.
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
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
 *         description: User updated
 *       403:
 *         description: You do not have permission to update this user or cannot assign to different office
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Delete a user by ID
 *     description: Delete a user. Only accessible if the user belongs to your office. Only managers can delete users.
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         description: ID of the user to delete
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted
 *       403:
 *         description: You do not have permission to delete this user
 *       404:
 *         description: User not found
 */