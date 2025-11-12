import { Request, Response, NextFunction } from "express";
import "express-session";

declare module "express-session" {
  interface SessionData {
    user?: {
      role: string;
    };
  }
}

export interface AuthRequest extends Request {
  session: Request["session"] & {
    user?: {
      role: string;
    };
  };
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthRequest;
  if (!authReq.session?.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}
