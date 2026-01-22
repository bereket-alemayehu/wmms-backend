/**
 * Email OTP Template
 * Simple template for OTP verification emails
 */

export interface OTPEmailData {
    otp: string;
    fullName?: string;
}

/**
 * Generate HTML email template for OTP
 */
export const generateOTPEmailHTML = (data: OTPEmailData): string => {
    const { otp, fullName = 'Customer' } = data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WMMS Verification Code</title>
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
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
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
        }
        .otp-box {
            background-color: #f9f9f9;
            border: 2px dashed #4CAF50;
            border-radius: 8px;
            padding: 25px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #4CAF50;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 WMMS Verification Code</h1>
        </div>
        <div class="content">
            <p>Hello ${fullName},</p>
            <p>Your verification code for WMMS account activation is:</p>
            <div class="otp-box">
                <div class="otp-code">${otp}</div>
            </div>
            <p>This code is valid for <strong>5 minutes</strong>.</p>
            <div class="warning">
                <p style="margin: 0; color: #856404;">
                    <strong>⚠️ Security Notice:</strong> Do not share this code with anyone. WMMS will never ask for your verification code.
                </p>
            </div>
            <p>If you didn't request this code, please ignore this email.</p>
        </div>
        <div class="footer">
            <p><strong>© ${new Date().getFullYear()} WMMS</strong> - Waste Management Management System</p>
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
};

/**
 * Generate plain text email template for OTP
 */
export const generateOTPEmailText = (data: OTPEmailData): string => {
    const { otp, fullName = 'Customer' } = data;

    return `
WMMS Verification Code

Hello ${fullName},

Your verification code for WMMS account activation is: ${otp}

This code is valid for 5 minutes.

⚠️ Security Notice: Do not share this code with anyone. WMMS will never ask for your verification code.

If you didn't request this code, please ignore this email.

© ${new Date().getFullYear()} WMMS - Waste Management Management System
This is an automated message, please do not reply.
    `.trim();
};

/**
 * Get email subject for OTP
 */
export const getOTPEmailSubject = (): string => {
    return 'Your WMMS Verification Code';
};

