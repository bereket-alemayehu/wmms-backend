/**
 * Validation utilities for input sanitization and format checking
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export const isStrongPassword = (password: string): boolean => {
    if (password.length < 8) return false;

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    return hasUppercase && hasLowercase && hasNumber;
};

/**
 * Get password strength feedback
 */
export const getPasswordFeedback = (password: string): string[] => {
    const feedback: string[] = [];

    if (password.length < 8) {
        feedback.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
        feedback.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
        feedback.push("Password must contain at least one lowercase letter");
    }
    if (!/\d/.test(password)) {
        feedback.push("Password must contain at least one number");
    }

    return feedback;
};

/**
 * Validate phone number format (Ethiopian format)
 * Accepts: +251XXXXXXXXX, 251XXXXXXXXX, 09XXXXXXXX, 07XXXXXXXX
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
    const patterns = [
        /^\+251[79]\d{8}$/, // +251 format
        /^251[79]\d{8}$/, // 251 format
        /^0[79]\d{8}$/, // 0 format
    ];

    return patterns.some((pattern) => pattern.test(phoneNumber));
};

/**
 * Sanitize string input (remove dangerous characters)
 */
export const sanitizeString = (input: string): string => {
    return input.trim().replace(/[<>]/g, "");
};

/**
 * Validate service number format
 */
export const isValidServiceNumber = (serviceNumber: string): boolean => {
    const pattern = /^WMMS-(CUST|TECH|SUP|MAN)-\d+$/i;
    return pattern.test(serviceNumber);
};
