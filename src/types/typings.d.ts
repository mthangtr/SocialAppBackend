import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      identity?: {
        _id: string;
        [key: string]: any;
      };
    }
  }
}
