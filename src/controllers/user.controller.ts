import { RequestHandler } from "express";
import factory from "../dbOperations/dbFactory";
import User from "../models/user.model";

export const getAllUsers: RequestHandler = factory.getAll(User);
export const getUser: RequestHandler = factory.getOne(User);
export const createUser: RequestHandler = factory.createOne(User);
export const updateUser: RequestHandler = factory.updateOne(User);
export const deleteUser: RequestHandler = factory.deleteOne(User);
