import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/errors";

/**
 * Centralized error handler middleware
 * Handles HttpError instances and other errors consistently
 */
export function errorHandler(
	err: unknown,
	req: Request,
	res: Response,
	next: NextFunction
): void {
	if (err instanceof HttpError) {
		res.status(err.statusCode).json({ error: err.message });
		return;
	}

	// Handle Mongoose validation errors
	if (err && typeof err === "object" && "name" in err && err.name === "ValidationError") {
		res.status(400).json({ error: "Validation error", details: err });
		return;
	}

	// Handle Mongoose cast errors (invalid ObjectId, etc.)
	if (err && typeof err === "object" && "name" in err && err.name === "CastError") {
		res.status(400).json({ error: "Invalid ID format" });
		return;
	}

	// Log unexpected errors
	console.error("Unexpected error:", err);

	// Generic error response
	res.status(500).json({ error: "Internal server error" });
}

