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
    email?: string;
    fullName?: string;
    address?: string;
    status: 'active' | 'suspended' | 'inactive';
    accountType: 'prepaid' | 'postpaid';
}

// Mock customer database
const mockCustomers: CustomerInfo[] = [
    {
        serviceNumber: 'WMMS-CUST-100001',
        phoneNumber: '+251912345678',
        email: 'estifk2@gmail.com',
        fullName: 'Abebe Kebede',
        address: 'Addis Ababa, Ethiopia',
        status: 'active',
        accountType: 'postpaid',
    },
    {
        serviceNumber: 'WMMS-CUST-100002',
        phoneNumber: '+251923456789',
        email: 'estifanosk3@gmail.com',
        fullName: 'Tigist Haile',
        address: 'Addis Ababa, Ethiopia',
        status: 'active',
        accountType: 'postpaid',
    },
    {
        serviceNumber: 'WMMS-CUST-100003',
        phoneNumber: '+251934567890',
        email: 'bereketalemayehuf@gmail.com',
        fullName: 'Dawit Gebru',
        address: 'Addis Ababa, Ethiopia',
        status: 'active',
        accountType: 'prepaid',
    },
    {
        serviceNumber: 'WMMS-CUST-100004',
        phoneNumber: '+251955678901',
        email: 'bereketalemayehuf@gmail.com',
        fullName: 'Meron Tadesse',
        address: 'Addis Ababa, Ethiopia',
        status: 'active',
        accountType: 'postpaid',
    },
    {
        serviceNumber: 'WMMS-CUST-100014',
        phoneNumber: '+251955678901',
        email: 'estifk3@gmail.com',
        fullName: 'Meron Tadesse',
        address: 'Addis Ababa, Ethiopia',
        status: 'active',
        accountType: 'postpaid',
    },
    {
        serviceNumber: 'WMMS-CUST-100088',
        phoneNumber: '+2519567895412',
        email: 'estifk2@gmail.com',
        fullName: 'Solomon Alemu',
        address: 'Addis Ababa, Ethiopia',
        status: 'active',
        accountType: 'postpaid',
    },
];

/**
 * Verify if a service number exists in the ISP database
 */
export const verifyServiceNumber = async (
    serviceNumber: string
): Promise<boolean> => {
    // First validate format
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

    // Check if service number exists in mock database
    const upperServiceNumber = serviceNumber.toUpperCase();
    const exists = mockCustomers.some(
        (c) => c.serviceNumber.toUpperCase() === upperServiceNumber
    );

    return exists;
};

/**
 * Get customer information from ISP database
 */
export const getCustomerInfo = async (
    serviceNumber: string
): Promise<CustomerInfo | null> => {
    // Verify service number format
    const isValidFormat = await verifyServiceNumber(serviceNumber);

    if (!isValidFormat) {
        return null;
    }

    // In production, query actual ISP database
    // const customer = await ispDatabase.query(
    //   'SELECT * FROM customers WHERE service_number = ?',
    //   [serviceNumber]
    // );

    // Find customer in mock database by service number
    const upperServiceNumber = serviceNumber.toUpperCase();
    const customer = mockCustomers.find(
        (c) => c.serviceNumber.toUpperCase() === upperServiceNumber
    );

    if (customer) {
        return { ...customer }; // Return a copy
    }

    // Service number not found in database
    return null;
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
 * Generate mock phone number based on service number (for development fallback)
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
 * Generate mock customer name (for development fallback)
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
 * Generate mock email based on service number (for development fallback)
 */
const generateMockEmail = (serviceNumber: string): string => {
    // Extract number from service number
    const match = serviceNumber.match(/\d+$/);
    const number = match ? match[0] : '123456';
    
    // Generate email based on service number
    const emailPrefix = `customer${number}`;
    
    return `${emailPrefix}@wmms.example.com`;
};

/**
 * Validate service number format
 */
export const validateServiceNumberFormat = (serviceNumber: string): boolean => {
    const pattern = /^WMMS-CUST-\d+$/i;
    return pattern.test(serviceNumber);
};
