import { Request, Response, NextFunction } from "express";
import { GlobalSettings } from "../models/GlobalSettings";

/**
 * Middleware to check if performance records are locked
 * Used before performance update/reset operations
 * Returns 423 Locked if performanceLocked is true
 */
export const checkPerformanceLocked = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const settings = await GlobalSettings.findOne({});

		if (settings?.performanceLocked) {
			return res.status(423).json({
				success: false,
				error: "Performance records are locked by global admin",
				code: "PERFORMANCE_LOCKED",
			});
		}

		next();
	} catch (err) {
		// If there's an error checking lock status, allow the operation
		// (fail-open approach for availability)
		next();
	}
};
