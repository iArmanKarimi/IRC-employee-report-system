# Server Enhancements

This document outlines the improvements made to the server infrastructure.

## New Modules

### 1. **Logger Middleware** (`middleware/logger.ts`)

- Structured JSON logging with timestamps
- Request/response logging with timing information
- Debug mode support (enable with `DEBUG=true`)
- Log levels: INFO, WARN, ERROR, DEBUG

### 2. **Config Module** (`config/index.ts`)

- Centralized environment configuration management
- Type-safe configuration with validation
- Caching for efficient repeated access
- Validates production environment requirements

**Configuration Structure:**

```typescript
{
  port: number
  nodeEnv: 'development' | 'production' | 'test'
  cors: { origin: string, credentials: boolean }
  session: { secret: string, maxAge: number }
  mongodb: { uri: string }
  rateLimit: { windowMs: number, maxRequests: number }
}
```

### 3. **Response Helpers** (`utils/response.ts`)

- `sendSuccess()` - Send successful responses with optional message
- `sendError()` - Send error responses with optional details
- `sendPaginated()` - Send paginated list responses
- Consistent response format across all endpoints

**Response Format:**

```typescript
// Success
{ success: true, data: T, message?: string }

// Error
{ success: false, error: string, details?: unknown }

// Paginated
{ success: true, data: T[], pagination: { total, page, limit, pages } }
```

### 4. **API Documentation** (`routes/api-docs.ts` & `config/swagger.ts`)

- OpenAPI 3.0 specification for complete API documentation
- Interactive Swagger UI at `/api-docs/swagger`
- ReDoc UI at `/api-docs`
- JSON specification available at `/api-docs/json`
- Includes all endpoints, schemas, security requirements
- No authentication required for documentation access
- Complete request/response examples
- Proper HTTP status code documentation

## Enhanced Modules

### 1. **Error Handler** (`middleware/errorHandler.ts`)

- Integrated logger for all error scenarios
- Enhanced duplicate key error handling (HTTP 409)
- Better error categorization and logging
- Consistent error response format

### 2. **Data Source** (`data-source.ts`)

- Uses centralized config
- Structured logging with logger middleware
- Better error reporting

### 3. **Rate Limiter** (`middleware/rateLimit.ts`)

- Uses centralized config for rate limiting rules
- Skips rate limiting in development mode
- Configurable via environment variables

### 4. **Auth Routes** (`routes/auth.ts`)

- Uses response helpers for consistent responses
- Integrated logging for security events
- Better error handling

### 5. **Main App** (`app.ts`)

- Uses centralized config
- Request logging middleware integrated
- Added 404 handler for undefined routes
- Added URL-encoded middleware for form data
- Improved health check endpoint
- API documentation routes mounted at `/api-docs`

### 6. **Server Entry Point** (`index.ts`)

- Structured logging for startup/shutdown
- Better error reporting
- Uses config for port and environment detection

## API Documentation

Access the interactive API documentation:

- **Swagger UI**: `http://localhost:3000/api-docs/swagger`
- **ReDoc UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/api-docs/json`

The documentation is automatically generated from the OpenAPI specification and includes:

- All available endpoints with parameters
- Request and response schemas
- Authentication requirements
- HTTP status codes and error responses
- Example requests and responses

## Environment Variables

### Required (Production)

- `SESSION_SECRET` - Must be a secure value (not default)
- `NODE_ENV` - Set to 'production'

### Optional

- `PORT` - Default: 3000
- `NODE_ENV` - Default: 'development' (values: development, production, test)
- `CORS_ORIGIN` - Default: 'http://localhost:5173'
- `MONGODB_URI` - Default: 'mongodb://localhost:27017/ircdb'
- `DEBUG` - Enable debug logging (set to 'true')

## Logging

All logs are output as JSON for easy parsing and aggregation.

**Example Log Entry:**

```json
{
	"timestamp": "2025-12-08T10:30:45.123Z",
	"level": "INFO",
	"message": "User logged in successfully",
	"data": {
		"userId": "507f1f77bcf86cd799439011",
		"username": "admin",
		"role": "globalAdmin"
	}
}
```

## Security Improvements

1. **Rate Limiting** - Configurable per environment
2. **Session Security** - Secure cookies in production
3. **Error Hiding** - Generic errors in production mode
4. **Logging** - Security events logged for auditing

## Usage in Routes

### Using Response Helpers

```typescript
// Success response
sendSuccess(res, employeeData, 200, "Employee created");

// Error response
sendError(res, "Invalid input", 400);

// Paginated response
sendPaginated(res, employees, totalCount, page, limit);
```

### Using Logger

```typescript
logger.info("Event occurred", { data: value });
logger.warn("Warning message", { data: value });
logger.error("Error occurred", error);
logger.debug("Debug info", { data: value });
```

## Migration Guide

If updating existing routes:

1. Replace `console.log/error` with `logger.info/error/warn/debug`
2. Replace custom response objects with `sendSuccess/sendError/sendPaginated`
3. Import `getConfig()` instead of reading environment variables directly
4. Use typed error handling with `HttpError`

## Performance Considerations

- Config is cached after first load
- Logger uses async console output (non-blocking)
- Rate limiting uses in-memory store (can be replaced with Redis)
- Session store uses MongoDB for persistence


## Latest Improvements (December 2025)

See \IMPROVEMENTS.md\ for comprehensive documentation of:
- **Standardized Responses** - All routes use \sendSuccess()\ helper
- **Input Sanitization** - Middleware prevents NoSQL injection attacks
- **Audit Logging** - Track all mutations for compliance
- **Pagination** - Efficient data handling with HATEOAS links
- **Performance Monitoring** - Detect slow queries automatically
- **Centralized Logging** - All logging uses structured logger
