import { RequestHandler } from "express";
import factory from "../dbOperations/dbFactory";
import Outage from "../models/outage.model";

export const getAllOutages: RequestHandler = factory.getAll(
  Outage,
  { path: "officeId postedBy" } as any
);
export const getOutage: RequestHandler = factory.getOne(
  Outage,
  { path: "officeId postedBy" } as any
);
export const createOutage: RequestHandler = factory.createOne(Outage);
export const updateOutage: RequestHandler = factory.updateOne(Outage);
export const deleteOutage: RequestHandler = factory.deleteOne(Outage);

