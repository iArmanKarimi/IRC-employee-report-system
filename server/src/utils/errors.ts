// Custom error class for HTTP errors
export class HttpError extends Error {
		constructor(public statusCode: number, message: string) {
				super(message);
				this.name = 'HttpError';
				// Maintains proper stack trace for where our error was thrown (only available on V8)
				if (Error.captureStackTrace) {
						Error.captureStackTrace(this, HttpError);
				}
		}
}

