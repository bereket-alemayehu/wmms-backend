import { IUser } from "../interfaces/user.interface";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// This empty export makes the file a module
export { };