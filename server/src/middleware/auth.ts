import { Request, Response, NextFunction } from "express";
import session from "express-session";
import { USER_ROLE, UserRoleType } from "../types/roles";

export type AuthenticatedUser = {
	id: string;
	role: UserRoleType;
	provinceId?: string;
};

// Extend express-session's SessionData interface to include our custom session properties
// This tells TypeScript what data we store in req.session
declare module "express-session" {
	interface SessionData {
		userId: string;
		role: UserRoleType;
		provinceId?: string;
	}
}

// Extend Express Request interface to include a user property
// This allows us to attach user data to req.user for use in route handlers
declare global {
	namespace Express {
		interface Request {
			user?: AuthenticatedUser;
		}
	}
}

// Middleware function to validate user authentication and role authorization
// requiredRole is mandatory - all protected routes must specify required role
export function auth(requiredRole: UserRoleType) {
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

// Middleware for routes that allow both roles
export function requireAnyRole(req: Request, res: Response, next: NextFunction) {
	if (!req.session.userId || !req.session.role) {
		return res.status(401).json({ error: "Not authenticated" });
	}

	req.user = {
		id: req.session.userId,
		role: req.session.role,
		provinceId: req.session.provinceId
	};

	next();
}

// Helper function to check if user can access a specific province's resources
// Returns true if user is globalAdmin or if provinceAdmin matches the resource's province
const normalizeProvinceId = (province: unknown): string | undefined => {
	if (typeof province === "string") {
		return province;
	}
	if (typeof province === "object" && province !== null) {
		const value = (province as { _id?: { toString?: () => string } })._id;
		if (typeof value === "string") {
			return value;
		}
		return value?.toString?.();
	}
	return undefined;
};

export const canAccessProvince = (
	user: Pick<AuthenticatedUser, "role" | "provinceId">,
	employeeProvinceId: unknown
): boolean => {
	if (user.role === USER_ROLE.GLOBAL_ADMIN) {
		return true;
	}

	// Normalize employeeProvinceId to string for comparison
	const employeeProvinceIdString = normalizeProvinceId(employeeProvinceId);

	return user.provinceId === employeeProvinceIdString;
};
