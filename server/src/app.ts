import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import authRoutes from "./routes/auth";
import provinceRoutes from "./routes/provinces";
import employeeRoutes from './routes/employees';
import apiDocsRoutes from './routes/api-docs';
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/logger";
import { sanitizeInput } from "./middleware/sanitize";
import { auditLog } from "./middleware/audit";
// import { performanceMonitor } from "./middleware/performance";
import { getConfig } from "./config";

const config = getConfig();
export const app = express();

// Middleware setup
app.use(cors({
	origin: config.cors.origin,
	credentials: config.cors.credentials
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Performance monitoring (slow query detection)
// app.use(performanceMonitor);

// Input sanitization (prevent injection attacks)
app.use(sanitizeInput);

// Session middleware
const sessionConfig: session.SessionOptions = {
	name: "irc.sid",
	secret: config.session.secret,
	resave: false,
	saveUninitialized: false,
	store: new MongoStore({
		mongoUrl: config.mongodb.uri
	}),
	cookie: {
		secure: config.nodeEnv === 'production',
		httpOnly: true,
		maxAge: config.session.maxAge
	}
};

app.use(session(sessionConfig));

// Audit logging for mutations (POST, PUT, DELETE)
app.use(auditLog);

// API Documentation routes (no auth required)
app.use('/api-docs', apiDocsRoutes);

// Routes
app.use('/auth', authRoutes);
app.use('/provinces', provinceRoutes);
app.use('/provinces/:provinceId/employees', employeeRoutes);

// Health check endpoint
app.get("/health", (_req, res) => {
	res.json({
		ok: true,
		timestamp: new Date().toISOString(),
		environment: config.nodeEnv
	});
});

// 404 handler
app.use((_req, res) => {
	res.status(404).json({
		success: false,
		error: "Route not found"
	});
});

// Error handler middleware (must be last)
app.use(errorHandler);
