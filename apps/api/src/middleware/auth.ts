
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import User, { type UserRole } from "../models/User.js";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET is missing or too short.");
  }

  return secret;
}

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication token is required.",
    });
    return;
  }

  let payload: JwtPayload;

  try {
    const decoded = jwt.verify(
      authorization.slice(7).trim(),
      getJwtSecret(),
      {
        issuer: "agentflow-erp",
        audience: "agentflow-erp-api",
      }
    );

    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string" ||
      typeof decoded.email !== "string" ||
      ![
  "admin",
  "manager",
  "hr",
  "sales_manager",
  "employee",
].includes(String(decoded.role))
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
      return;
    }

    payload = decoded;
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
    return;
  }

  try {
    const user = await User.findById(payload.sub)
      .select("_id email role isActive")
      .lean();

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: "Account is unavailable.",
      });
      return;
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Authentication lookup failed:", error);
    res.status(500).json({
      success: false,
      message: "Unable to verify account.",
    });
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication is required.",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action.",
      });
      return;
    }

    next();
  };
}
