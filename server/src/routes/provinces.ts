import { Router, Request, Response, NextFunction } from "express";
import { Province } from "../models/Province";
import { auth } from "../middleware/auth";
import { USER_ROLE } from "../types/roles";
import { HttpError } from "../utils/errors";
import { sendSuccess } from "../utils/response";
import { logger } from "../middleware/logger";

const router = Router();

// GET /provinces - List all provinces (Global Admin only)
router.get("/", auth(USER_ROLE.GLOBAL_ADMIN), async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const provinces = await Province.find().populate({
			path: 'admin',
			select: '_id username role provinceId'
		});
		logger.debug("Provinces listed", { count: provinces.length });
		sendSuccess(res, provinces, 200, "Provinces retrieved successfully");
	} catch (err: unknown) {
		next(err);
	}
});

// GET /provinces/:provinceId - Get a specific province (Global Admin only)
router.get("/:provinceId", auth(USER_ROLE.GLOBAL_ADMIN), async (req: Request, res: Response, next: NextFunction) => {
	try {
		const province = await Province.findById(req.params.provinceId).populate({
			path: 'admin',
			select: '_id username role provinceId'
		});
		if (!province) {
			throw new HttpError(404, "Province not found");
		}
		logger.debug("Province retrieved", { provinceId: req.params.provinceId });
		sendSuccess(res, province, 200, "Province retrieved successfully");
	} catch (err: unknown) {
		next(err);
	}
});

export default router;
