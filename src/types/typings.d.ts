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

export interface CustomRequest extends Request {
  identity: any;
  files: Express.Multer.File[];
}
