import { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

/**
 * Audit logging middleware to track all mutations (POST, PUT, DELETE)
 * Logs who made the change, what was changed, and when
 */
export const auditLog = (req: Request, res: Response, next: NextFunction): void => {
	// Only audit mutation operations
	if (!["POST", "PUT", "DELETE"].includes(req.method)) {
		return next();
	}

	const userFromSession = req.session?.userId
		? {
			id: req.session.userId,
			role: req.session.role,
			provinceId: req.session.provinceId
		}
		: undefined;

	const auditData = {
		method: req.method,
		path: req.path,
		userId: req.user?.id || userFromSession?.id || "anonymous",
		userRole: req.user?.role || userFromSession?.role || "unauthenticated",
		userProvince: req.user?.provinceId || userFromSession?.provinceId,
		ip: req.ip,
		timestamp: new Date().toISOString()
	};

	// Log the request
	logger.info("Audit: Mutation request", auditData);

	// Intercept response to log the result
	const originalJson = res.json;
	res.json = function (data: any) {
		const statusCode = res.statusCode;
		const success = data?.success ?? (statusCode >= 200 && statusCode < 300);

		logger.info("Audit: Mutation response", {
			...auditData,
			statusCode,
			success,
			dataId: data?.data?._id || data?.data?.id
		});

		return originalJson.call(this, data);
	};

	next();
};
