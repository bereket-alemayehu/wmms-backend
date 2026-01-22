/**
 * ISP Database Service
 * Handles verification and lookup of customer service numbers
 *
 * Now uses MongoDB collection 'ispdata'
 */

import IspData from "../models/isp.model";

export interface CustomerInfo {
    serviceNumber: string;
    phoneNumber: string;
    email?: string;
    fullName?: string;
    address?: string;
    status: "active" | "suspended" | "inactive";
    accountType: "prepaid" | "postpaid";
    officeId?: string;
}

/**
 * Verify if a service number exists in the ISP database
 */
export const verifyServiceNumber = async (
    serviceNumber: string
): Promise<boolean> => {
    try {
        const upperServiceNumber = serviceNumber.trim().toUpperCase();

        // First validate format
        if (!validateServiceNumberFormat(upperServiceNumber)) {
            return false;
        }

        // Check if service number exists in MongoDB
        const query = { serviceNumber: upperServiceNumber };

        // Use lean() for better performance
        const customer = await IspData.findOne(query).lean();

        return !!customer;
    } catch (error) {
        console.error(`[ISP Service] Error in verifyServiceNumber:`, error);
        return false;
    }
};

/**
 * Get customer information from ISP database
 */
export const getCustomerInfo = async (
    serviceNumber: string
): Promise<CustomerInfo | null> => {
    try {
        const upperServiceNumber = serviceNumber.trim().toUpperCase();

        // Verify service number format
        if (!validateServiceNumberFormat(upperServiceNumber)) {
            return null;
        }

        // Find customer in MongoDB by service number
        const customer = await IspData.findOne({
            serviceNumber: upperServiceNumber,
        }).lean();

        if (customer) {
            return {
                serviceNumber: customer.serviceNumber,
                phoneNumber: customer.phoneNumber,
                email: customer.email,
                fullName: customer.fullName,
                address: customer.address,
                status: customer.status,
                accountType: customer.accountType,
                officeId: customer.officeId,
            } as CustomerInfo;
        }

        // Service number not found in database
        return null;
    } catch (error) {
        console.error(`[ISP Service] Error in getCustomerInfo:`, error);
        return null;
    }
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

    return customerInfo.status === "active";
};

/**
 * Validate service number format
 */
export const validateServiceNumberFormat = (serviceNumber: string): boolean => {
    const pattern = /^WMMS-CUST-\d+$/i;
    return pattern.test(serviceNumber);
};
