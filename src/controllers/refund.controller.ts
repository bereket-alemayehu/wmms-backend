import { RequestHandler, Response, Request, NextFunction } from "express";
import factory from "../dbOperations/dbFactory";
import Refund from "../models/refund.model";

export const getAllRefunds: RequestHandler = factory.getAll(Refund, {
  path: "ticketId customerId",
} as any);
export const getRefund: RequestHandler = factory.getOne(Refund, {
  path: "ticketId customerId",
} as any);
export const createRefund: RequestHandler = factory.createOne(Refund);
export const updateRefund: RequestHandler = factory.updateOne(Refund);
export const deleteRefund: RequestHandler = factory.deleteOne(Refund);
