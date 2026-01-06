/**
 * SMS Service Utility
 * Handles OTP sending via SMS
 * 
 * Development: Logs OTP to console
 * Production: Integrate with SMS gateway (Africa's Talking, Twilio, etc.)
 */

interface SMSConfig {
    provider: 'console' | 'africastalking' | 'twilio';
    apiKey?: string;
    username?: string;
    senderId?: string;
}

const smsConfig: SMSConfig = {
    provider: process.env.SMS_PROVIDER as any || 'console',
    apiKey: process.env.SMS_API_KEY,
    username: process.env.SMS_USERNAME,
    senderId: process.env.SMS_SENDER_ID || 'WMMS',
};

/**
 * Send OTP via SMS
 */
export const sendOTP = async (
    phoneNumber: string,
    otp: string
): Promise<boolean> => {
    const message = `Your WMMS verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`;

    try {
        switch (smsConfig.provider) {
            case 'console':
                // Development mode - log to console
                console.log('\n=== SMS OTP SENT ===');
                console.log(`To: ${phoneNumber}`);
                console.log(`Message: ${message}`);
                console.log(`OTP: ${otp}`);
                console.log('====================\n');
                return true;

            case 'africastalking':
                // TODO: Integrate Africa's Talking
                // const AfricasTalking = require('africastalking');
                // const sms = AfricasTalking({
                //   apiKey: smsConfig.apiKey,
                //   username: smsConfig.username,
                // }).SMS;
                // await sms.send({
                //   to: [phoneNumber],
                //   message,
                //   from: smsConfig.senderId,
                // });
                console.log('Africa\'s Talking integration pending');
                return true;

            case 'twilio':
                // TODO: Integrate Twilio
                // const twilio = require('twilio');
                // const client = twilio(accountSid, authToken);
                // await client.messages.create({
                //   body: message,
                //   from: smsConfig.senderId,
                //   to: phoneNumber,
                // });
                console.log('Twilio integration pending');
                return true;

            default:
                console.log('SMS provider not configured, logging to console');
                console.log(`To: ${phoneNumber}, OTP: ${otp}`);
                return true;
        }
    } catch (error) {
        console.error('SMS sending error:', error);
        return false;
    }
};

/**
 * Send password reset OTP via SMS
 */
export const sendPasswordResetOTP = async (
    phoneNumber: string,
    otp: string
): Promise<boolean> => {
    const message = `Your WMMS password reset code is: ${otp}. Valid for 10 minutes. Do not share this code.`;

    // Similar logic to sendOTP but with different message
    console.log('\n=== PASSWORD RESET OTP ===');
    console.log(`To: ${phoneNumber}`);
    console.log(`OTP: ${otp}`);
    console.log('==========================\n');

    return true;
};

/**
 * Format phone number to international format
 * Example: 0912345678 -> +251912345678
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
    // Remove any spaces or dashes
    let cleaned = phoneNumber.replace(/[\s-]/g, '');

    // If starts with 0, replace with country code
    if (cleaned.startsWith('0')) {
        cleaned = '+251' + cleaned.substring(1);
    }

    // If doesn't start with +, add country code
    if (!cleaned.startsWith('+')) {
        cleaned = '+251' + cleaned;
    }

    return cleaned;
};

/**
 * Validate Ethiopian phone number
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
    const patterns = [
        /^\+251[79]\d{8}$/, // +251 format
        /^251[79]\d{8}$/, // 251 format
        /^0[79]\d{8}$/, // 0 format
    ];

    return patterns.some((pattern) => pattern.test(phoneNumber));
};
