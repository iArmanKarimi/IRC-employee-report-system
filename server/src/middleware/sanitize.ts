import { Request, Response, NextFunction } from "express";

/**
 * Input sanitization middleware to prevent injection attacks
 * - Removes leading/trailing whitespace from string values
 * - Escapes special characters in string values
 * - Prevents null byte injection
 */

const sanitizeValue = (value: unknown): unknown => {
	if (typeof value === "string") {
		// Remove null bytes
		if (value.includes("\0")) {
			throw new Error("Invalid input: null bytes not allowed");
		}

		// Trim whitespace
		let sanitized = value.trim();

		// Escape dangerous characters for MongoDB and NoSQL injection
		// but preserve intentional special characters in legitimate data
		sanitized = sanitized
			.replace(/[\$\(\)\[\]\{\}]/g, (char) => `\\${char}`);

		return sanitized;
	} else if (value !== null && typeof value === "object") {
		// Recursively sanitize objects and arrays
		if (Array.isArray(value)) {
			return value.map(sanitizeValue);
		}
		const sanitized: Record<string, unknown> = {};
		for (const [key, val] of Object.entries(value)) {
			sanitized[key] = sanitizeValue(val);
		}
		return sanitized;
	}

	// Numbers, booleans, null pass through unchanged
	return value;
};

/**
 * Middleware to sanitize request body, query parameters, and URL parameters
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
	try {
		// Sanitize body
		if (req.body && typeof req.body === "object") {
			const sanitizedBody = sanitizeValue(req.body);
			Object.keys(req.body).forEach(key => { delete req.body[key]; });
			Object.assign(req.body, sanitizedBody);
		}

		// Sanitize query parameters
		if (req.query && typeof req.query === "object") {
			const sanitizedQuery = sanitizeValue(req.query) as Record<string, string | string[]>;
			Object.keys(req.query).forEach(key => { delete req.query[key]; });
			Object.assign(req.query, sanitizedQuery);
		}

		// Sanitize URL parameters
		if (req.params && typeof req.params === "object") {
			const sanitizedParams = sanitizeValue(req.params) as Record<string, string>;
			Object.keys(req.params).forEach(key => { delete req.params[key]; });
			Object.assign(req.params, sanitizedParams);
		}

		next();
	} catch (err) {
		res.status(400).json({
			success: false,
			error: err instanceof Error ? err.message : "Invalid input"
		});
	}
};
