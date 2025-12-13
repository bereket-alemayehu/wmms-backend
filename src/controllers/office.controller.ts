import { RequestHandler } from "express";
import factory from "../dbOperations/dbFactory";
import Office from "../models/office.model";

export const getAllOffices: RequestHandler = factory.getAll(Office);
export const getOffice: RequestHandler = factory.getOne(Office);
export const createOffice: RequestHandler = factory.createOne(Office);
export const updateOffice: RequestHandler = factory.updateOne(Office);
export const deleteOffice: RequestHandler = factory.deleteOne(Office);

