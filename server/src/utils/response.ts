import { Response } from "express";

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

/**
 * Send a successful API response
 */
export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200, message?: string): Response {
	return res.status(statusCode).json({
		success: true,
		data,
		message
	});
}

/**
 * Send an error API response
 */
export function sendError(res: Response, error: string, statusCode: number = 400, details?: unknown): Response {
	const response: any = {
		success: false,
		error
	};
	if (details) {
		response.details = details;
	}
	return res.status(statusCode).json(response);
}

/**
 * Send a paginated response
 */
export interface PaginatedResponse<T> {
	success: boolean;
	data: T[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		pages: number;
	};
}

export function sendPaginated<T>(
	res: Response,
	data: T[],
	total: number,
	page: number,
	limit: number
): Response {
	const pages = Math.ceil(total / limit);
	return res.status(200).json({
		success: true,
		data,
		pagination: {
			total,
			page,
			limit,
			pages
		}
	});
}
