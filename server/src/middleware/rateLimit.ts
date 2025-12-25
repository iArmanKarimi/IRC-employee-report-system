import rateLimit from "express-rate-limit";
import { getConfig } from "../config";

const config = getConfig();

// Rate limiter for authentication routes to prevent brute force attacks
export const authRateLimiter = rateLimit({
	windowMs: config.rateLimit.windowMs,
	max: config.rateLimit.maxRequests,
	message: "Too many login attempts, please try again later",
	skip: (req) => {
		// Skip rate limiting in development mode
		return config.nodeEnv === 'development';
	}
});


