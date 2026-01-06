/**
 * ISP Database Service
 * Handles verification and lookup of customer service numbers
 * 
 * Development: Returns mock data for valid service number formats
 * Production: Integrate with actual ISP database
 */

export interface CustomerInfo {
    serviceNumber: string;
    phoneNumber: string;
    fullName?: string;
    address?: string;
    status: 'active' | 'suspended' | 'inactive';
    accountType: 'prepaid' | 'postpaid';
}

/**
 * Verify if a service number exists in the ISP database
 */
export const verifyServiceNumber = async (
    serviceNumber: string
): Promise<boolean> => {
    // Development mode - validate format
    const pattern = /^WMMS-CUST-\d+$/i;

    if (!pattern.test(serviceNumber)) {
        return false;
    }

    // In production, this would query the actual ISP database
    // const result = await ispDatabase.query(
    //   'SELECT * FROM customers WHERE service_number = ?',
    //   [serviceNumber]
    // );
    // return result.length > 0;

    // Mock: Accept any valid format
    return true;
};

/**
 * Get customer information from ISP database
 */
export const getCustomerInfo = async (
    serviceNumber: string
): Promise<CustomerInfo | null> => {
    // Verify service number exists
    const exists = await verifyServiceNumber(serviceNumber);

    if (!exists) {
        return null;
    }

    // In production, query actual ISP database
    // const customer = await ispDatabase.query(
    //   'SELECT * FROM customers WHERE service_number = ?',
    //   [serviceNumber]
    // );

    // Mock data for development
    const mockData: CustomerInfo = {
        serviceNumber: serviceNumber.toUpperCase(),
        phoneNumber: generateMockPhoneNumber(serviceNumber),
        fullName: generateMockName(serviceNumber),
        address: 'Addis Ababa, Ethiopia',
        status: 'active',
        accountType: 'postpaid',
    };

    return mockData;
};

/**
 * Check if customer account is active
 */
export const isCustomerActive = async (
    serviceNumber: string
): Promise<boolean> => {
    const customerInfo = await getCustomerInfo(serviceNumber);

    if (!customerInfo) {
        return false;
    }

    return customerInfo.status === 'active';
};

/**
 * Generate mock phone number based on service number (for development)
 */
const generateMockPhoneNumber = (serviceNumber: string): string => {
    // Extract number from service number
    const match = serviceNumber.match(/\d+$/);
    const number = match ? match[0] : '12345678';

    // Pad to 8 digits
    const padded = number.padStart(8, '0').substring(0, 8);

    return `+2519${padded}`;
};

/**
 * Generate mock customer name (for development)
 */
const generateMockName = (serviceNumber: string): string => {
    const names = [
        'Abebe Kebede',
        'Tigist Haile',
        'Dawit Gebru',
        'Meron Tadesse',
        'Solomon Alemu',
    ];

    // Use service number to pick a consistent name
    const match = serviceNumber.match(/\d+$/);
    const number = match ? parseInt(match[0]) : 0;
    const index = number % names.length;

    return names[index];
};

/**
 * Validate service number format
 */
export const validateServiceNumberFormat = (serviceNumber: string): boolean => {
    const pattern = /^WMMS-CUST-\d+$/i;
    return pattern.test(serviceNumber);
};
