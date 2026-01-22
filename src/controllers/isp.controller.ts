import { Request, Response, NextFunction, RequestHandler } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/appError";
import * as ispService from "../services/isp.service";

/**
 * Verify service number
 * GET /api/v1/isp/verify/:serviceNumber
 */
export const verifyServiceNumber: RequestHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { serviceNumber } = req.params;

        if (!serviceNumber) {
            return next(new AppError("Please provide a service number", 400));
        }

        const exists = await ispService.verifyServiceNumber(serviceNumber);

        res.status(200).json({
            status: "success",
            data: {
                exists,
            },
        });
    }
);

/**
 * Get customer info by service number
 * GET /api/v1/isp/customer/:serviceNumber
 */
export const getCustomerInfo: RequestHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { serviceNumber } = req.params;

        if (!serviceNumber) {
            return next(new AppError("Please provide a service number", 400));
        }

        const customerInfo = await ispService.getCustomerInfo(serviceNumber);

        if (!customerInfo) {
            return next(new AppError("Customer information not found", 404));
        }

        res.status(200).json({
            status: "success",
            data: {
                customer: customerInfo,
            },
        });
    }
);
