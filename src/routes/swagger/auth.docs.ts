/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT access token for authentication
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: jwt
 *       description: JWT token in HTTP-only cookie
 *     refreshToken:
 *       type: apiKey
 *       in: cookie
 *       name: refreshToken
 *       description: Refresh token in HTTP-only cookie
 *   schemas:
 *     AuthResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Logged in successfully
 *         accessToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         refreshToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/UserResponse'
 *     UserResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         fullName:
 *           type: string
 *           example: John Doe
 *         phoneNumber:
 *           type: string
 *           example: "0912345678"
 *         email:
 *           type: string
 *           example: john@example.com
 *         serviceNumber:
 *           type: string
 *           example: WMMS-CUST-100234
 *         role:
 *           type: string
 *           enum: [customer, technician, supervisor, manager]
 *           example: customer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: fail
 *         message:
 *           type: string
 *           example: Error description
 */

/**
 * @swagger
 * /api/v1/auth/signup/initiate:
 *   post:
 *     summary: Initiate customer signup (Step 1 of 3)
 *     description: Verify customer service number and send OTP via SMS for account activation
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceNumber
 *               - password
 *               - passwordConfirm
 *             properties:
 *               serviceNumber:
 *                 type: string
 *                 description: Customer service number (must start with WMMS-CUST-)
 *                 example: WMMS-CUST-100234
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password (min 8 chars, uppercase, lowercase, number)
 *                 example: StrongPass123
 *               passwordConfirm:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: OTP sent to +251****5678. Valid for 5 minutes.
 *                 data:
 *                   type: object
 *                   properties:
 *                     fullName:
 *                       type: string
 *                       example: John Doe
 *                     phoneNumber:
 *                       type: string
 *                       example: "+251****5678"
 *       400:
 *         description: Invalid service number or already registered
 *       404:
 *         description: Service number not found in ISP database
 */

/**
 * @swagger
 * /api/v1/auth/signup/verify-otp:
 *   post:
 *     summary: Verify OTP & Complete Signup (Step 2 of 2)
 *     description: Verify the OTP received via SMS and complete the account activation
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceNumber
 *               - otp
 *             properties:
 *               serviceNumber:
 *                 type: string
 *                 example: WMMS-CUST-100234
 *               otp:
 *                 type: string
 *                 description: 6-digit OTP code
 *                 example: "123456"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address (optional)
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: OTP verified and account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid or expired OTP
 *       404:
 *         description: No signup request found
 */


/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login
 *     description: Authenticate user with service number and password. Works for all roles (customer, technician, supervisor, manager).
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceNumber
 *               - password
 *             properties:
 *               serviceNumber:
 *                 type: string
 *                 description: Service number (e.g., WMMS-CUST-100234, WMMS-MAN-001)
 *                 example: WMMS-CUST-100234
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User password
 *                 example: StrongPass123
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: jwt=eyJhbGc...; HttpOnly; Secure; SameSite=Strict
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *       423:
 *         description: Account locked (too many failed attempts)
 */

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout
 *     description: Logout the current user and clear authentication tokens
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Generate a new access token using a valid refresh token
 *     tags:
 *       - Authentication
 *     security:
 *       - refreshToken: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Generate a password reset token. In development, token is logged to console. In production, sent via SMS/email.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceNumber
 *             properties:
 *               serviceNumber:
 *                 type: string
 *                 example: WMMS-CUST-100234
 *     responses:
 *       200:
 *         description: Password reset token generated
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v1/auth/reset-password/{token}:
 *   patch:
 *     summary: Reset password
 *     description: Reset user password using the reset token
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - passwordConfirm
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 example: NewStrongPass123
 *               passwordConfirm:
 *                 type: string
 *                 format: password
 *                 example: NewStrongPass123
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */

/**
 * @swagger
 * /api/v1/auth/update-password:
 *   patch:
 *     summary: Update password
 *     description: Change password for authenticated users
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - newPasswordConfirm
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *               newPasswordConfirm:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Current password incorrect or not authenticated
 */

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Retrieve the profile of the currently authenticated user
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *       401:
 *         description: Not authenticated
 *   patch:
 *     summary: Update current user profile
 *     description: Update profile information (cannot update password, role, or serviceNumber)
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Not authenticated
 *   delete:
 *     summary: Deactivate account
 *     description: Soft delete the current user's account
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: Account deactivated
 *       401:
 *         description: Not authenticated
 */
