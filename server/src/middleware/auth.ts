import { Request, Response, NextFunction } from "express";
import session from "express-session";

// Extend express-session's SessionData interface to include our custom session properties
// This tells TypeScript what data we store in req.session
declare module "express-session" {
	interface SessionData {
		userId: string;
		role: 'globalAdmin' | 'provinceAdmin';
		provinceId?: string;
	}
}

// Extend Express Request interface to include a user property
// This allows us to attach user data to req.user for use in route handlers
declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				role: 'globalAdmin' | 'provinceAdmin';
				provinceId?: string;
			}
		}
	}
}

// Middleware function to validate user authentication and role authorization
// requiredRole is mandatory - all protected routes must specify required role
export function auth(requiredRole: "globalAdmin" | "provinceAdmin") {
	return (req: Request, res: Response, next: NextFunction) => {
		// Check if user is authenticated by verifying session has userId and role
		if (!req.session.userId || !req.session.role) {
			return res.status(401).json({ error: "Not authenticated" });
		}

		// Check role authorization first
		if (req.session.role !== requiredRole) {
			return res.status(403).json({ error: "Forbidden" });
		}

		// Attach user data to request object for use in route handlers
		req.user = {
			id: req.session.userId,
			role: req.session.role,
			provinceId: req.session.provinceId
		};

		// User is authenticated and authorized, proceed to next middleware/route
		next();
	};
}
