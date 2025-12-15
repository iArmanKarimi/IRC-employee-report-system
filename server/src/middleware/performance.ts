// import { Request, Response, NextFunction } from "express";
// import { logger } from "./logger";

// const SLOW_QUERY_THRESHOLD_MS = 1000; // Log queries slower than 1 second

// /**
//  * Middleware to track request/response timing
//  * Logs slow queries and provides performance metrics
//  */
// export const performanceMonitor = (req: Request, res: Response, next: NextFunction): void => {
// 	const startTime = Date.now();
// 	const startHrtime = process.hrtime.bigint();

// 	// Intercept end to capture timing
// 	const originalEnd = res.end;
// 	res.end = function (...args: any[]) {
// 		const duration = Date.now() - startTime;
// 		const hrtime = process.hrtime.bigint() - startHrtime;
// 		const hrtimeMs = Number(hrtime) / 1_000_000;

// 		// Log slow requests/queries
// 		if (duration > SLOW_QUERY_THRESHOLD_MS) {
// 			logger.warn("Slow request detected", {
// 				method: req.method,
// 				path: req.path,
// 				statusCode: res.statusCode,
// 				durationMs: duration,
// 				durationHrMs: hrtimeMs.toFixed(2)
// 			});
// 		}

// 		// Log to debug for all requests (disabled in production unless DEBUG=true)
// 		logger.debug("Request completed", {
// 			method: req.method,
// 			path: req.path,
// 			statusCode: res.statusCode,
// 			durationMs: duration,
// 			durationHrMs: hrtimeMs.toFixed(2)
// 		});

// 		return originalEnd.apply(res, args);
// 	};

// 	next();
// };
