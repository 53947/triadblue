import { Request, Response, NextFunction } from "express";
import "express-session";
import type { IStorage } from "./storage";

declare module "express-session" {
  interface SessionData {
    user?: {
      id: string;
      username: string;
      role: string;
    };
    platform?: "linkblue" | "consoleblue";
    adminSessionToken?: string;
  }
}

export interface AuthRequest extends Request {
  session: Request["session"] & {
    user?: {
      id: string;
      username: string;
      role: string;
    };
    platform?: "linkblue" | "consoleblue";
    adminSessionToken?: string;
  };
}

let storageInstance: IStorage | null = null;

export function setStorageForAuth(storage: IStorage) {
  storageInstance = storage;
}

export async function authRequired(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthRequest;
  if (!authReq.session?.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  // Migrate old session format to new format
  if (!authReq.session.user.id && authReq.session.user.role) {
    console.log("Migrating old session format to new format");
    try {
      if (!storageInstance) {
        throw new Error("Storage not initialized for auth migration");
      }
      const systemUser = await storageInstance.ensureSystemAdminUser();
      authReq.session.user = {
        id: systemUser.id,
        username: systemUser.username,
        role: systemUser.role,
      };
      // Save the updated session
      await new Promise<void>((resolve, reject) => {
        authReq.session.save((err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log("Session migration complete");
    } catch (error) {
      console.error("Session migration failed:", error);
      return res.status(500).json({ error: "Session migration failed" });
    }
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
