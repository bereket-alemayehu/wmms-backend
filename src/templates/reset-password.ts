/**
 * Password Reset Email Template
 * Returns HTML and plain text email templates for password reset
 */

export interface ResetPasswordEmailData {
    resetUrl: string;
    fullName?: string;
    validityMinutes?: number;
}

/**
 * Generate HTML email template for password reset
 */
export const generateResetPasswordEmailHTML = (data: ResetPasswordEmailData): string => {
    const { resetUrl, fullName = 'Customer', validityMinutes = 10 } = data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WMMS Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background-color: #4CAF50;
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px 20px;
            background-color: #ffffff;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .reset-button {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
        }
        .reset-button:hover {
            background-color: #45a049;
        }
        .info-text {
            font-size: 14px;
            color: #555;
            margin: 20px 0;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .warning-text {
            color: #856404;
            font-weight: bold;
            margin: 0;
        }
        .url-fallback {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
            word-break: break-all;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #666;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e0e0e0;
        }
        .footer p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 WMMS Password Reset</h1>
        </div>
        <div class="content">
            <p class="greeting">Hello ${fullName},</p>
            <p class="info-text">
                You requested to reset your password for your WMMS account. Click the button below to reset your password:
            </p>
            <div class="button-container">
                <a href="${resetUrl}" class="reset-button">Reset Password</a>
            </div>
            <p class="info-text">
                Or copy and paste this URL into your browser:
            </p>
            <div class="url-fallback">
                ${resetUrl}
            </div>
            <p class="info-text">
                This link is valid for <strong>${validityMinutes} minutes</strong>.
            </p>
            <div class="warning">
                <p class="warning-text">⚠️ Security Notice</p>
                <p style="margin: 10px 0 0 0; color: #856404;">
                    If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                </p>
            </div>
            <p class="info-text">
                For security reasons, this link will expire after ${validityMinutes} minutes. If you need to reset your password again, please request a new reset link.
            </p>
        </div>
        <div class="footer">
            <p><strong>© ${new Date().getFullYear()} WMMS</strong></p>
            <p>Waste Management Management System</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
};

/**
 * Generate plain text email template for password reset
 */
export const generateResetPasswordEmailText = (data: ResetPasswordEmailData): string => {
    const { resetUrl, fullName = 'Customer', validityMinutes = 10 } = data;

    return `
WMMS Password Reset

Hello ${fullName},

You requested to reset your password for your WMMS account. Use the link below to reset your password:

${resetUrl}

This link is valid for ${validityMinutes} minutes.

⚠️ SECURITY NOTICE:
If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

For security reasons, this link will expire after ${validityMinutes} minutes. If you need to reset your password again, please request a new reset link.

© ${new Date().getFullYear()} WMMS - Waste Management Management System
This is an automated message, please do not reply to this email.
    `.trim();
};

/**
 * Get email subject for password reset
 */
export const getResetPasswordEmailSubject = (): string => {
    return 'WMMS Password Reset Request';
};

