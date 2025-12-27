import { Router, Request, Response, NextFunction } from "express";
import { GlobalSettings } from "../models/GlobalSettings";
import { auth } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../middleware/logger";
import { USER_ROLE } from "../types/roles";

const router = Router();

/**
 * GET /global-settings
 * Retrieve current global settings (performance lock status)
 * Public endpoint - anyone can check lock status
 */
router.get("/", async (req: Request, res: Response) => {
	try {
		let settings = await GlobalSettings.findOne({}).populate("lastLockedBy", "username");

		if (!settings) {
			settings = await GlobalSettings.create({ performanceLocked: false });
		}

		sendSuccess(res, settings);
	} catch (err) {
		logger.error("Error fetching global settings:", err);
		sendError(res, "Failed to fetch global settings", 500);
	}
});

/**
 * POST /global-settings/toggle-performance-lock
 * Toggle the performance lock status
 * Global Admin only
 */
router.post(
	"/toggle-performance-lock",
	auth(USER_ROLE.GLOBAL_ADMIN),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			let settings = await GlobalSettings.findOne({});

			if (!settings) {
				settings = await GlobalSettings.create({
					performanceLocked: true,
					lastLockedBy: req.user?.id,
					lockedAt: new Date(),
				});
			} else {
				settings.performanceLocked = !settings.performanceLocked;
				settings.lastLockedBy = req.user?.id;
				settings.lockedAt = new Date();
				await settings.save();
			}

			const action = settings.performanceLocked ? "locked" : "unlocked";
			logger.info(
				`Global admin ${req.user?.id} ${action} performance records`
			);

			sendSuccess(res, settings);
		} catch (err) {
			logger.error("Error toggling performance lock:", err);
			sendError(res, "Failed to toggle performance lock", 500);
		}
	}
);

export default router;
