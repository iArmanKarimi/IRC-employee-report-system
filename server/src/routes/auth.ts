import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { authRateLimiter } from "../middleware/rateLimit";
import { HttpError } from "../utils/errors";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../middleware/logger";

const router = Router();

type LoginBody = {
	username: string;
	password: string;
};

router.post("/login", authRateLimiter, async (req: Request<Record<string, never>, any, LoginBody>, res: Response) => {
	try {
		const { username, password } = req.body;

		// Validate input - check for empty strings
		if (!username?.trim() || !password?.trim()) {
			return sendError(res, "Username and password required", 400);
		}

		const user = await User.findOne({ username: username.trim() }).populate('provinceId');
		if (!user) {
			logger.warn("Failed login attempt", { username, reason: "User not found" });
			return sendError(res, "Invalid credentials", 401);
		}

		const valid = await bcrypt.compare(password, user.passwordHash);
		if (!valid) {
			logger.warn("Failed login attempt", { username, reason: "Invalid password" });
			return sendError(res, "Invalid credentials", 401);
		}

		// Set session data
		req.session.userId = user._id.toString();
		req.session.role = user.role;
		req.session.provinceId = user.provinceId?._id.toString();

		logger.info("User logged in successfully", {
			userId: user._id,
			username: user.username,
			role: user.role
		});

		return sendSuccess(res, {
			role: user.role,
			provinceId: user.provinceId?._id
		}, 200, "Logged in successfully");
	} catch (err: unknown) {
		logger.error("Error during login", err);
		if (err instanceof HttpError) {
			return sendError(res, err.message, err.statusCode);
		}
		return sendError(res, "Login failed", 500);
	}
});

router.post("/logout", (req: Request, res: Response) => {
	req.session.destroy((err: Error | null) => {
		if (err) {
			logger.error("Error during logout", err);
			return sendError(res, "Logout failed", 500);
		}
		res.clearCookie("irc.sid");
		return sendSuccess(res, null, 200, "Logged out successfully");
	});
});

export default router;

