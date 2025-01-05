import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import config from "../lib/config";

// Extending the Request type to include the user property
export interface AuthenticatedRequest extends Request {
  user?: any; // Define user as an optional property
}

const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, config.JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }

    req.user = user;
    next();
  });
};

export default authenticateToken;
