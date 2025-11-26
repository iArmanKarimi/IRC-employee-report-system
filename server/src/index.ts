import { app } from "./app";
import { connectDB } from "./data-source";

const PORT = process.env.PORT || 3000;

async function startServer() {
	try {
		await connectDB();

		const server = app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});

		// Handle server errors
		server.on('error', (err: NodeJS.ErrnoException) => {
			if (err.code === 'EADDRINUSE') {
				console.error(`Port ${PORT} is already in use. Please use a different port.`);
			} else {
				console.error('Server error:', err);
			}
			process.exit(1);
		});

		// Handle graceful shutdown
		process.on('SIGTERM', () => {
			console.log('SIGTERM signal received: closing HTTP server');
			server.close(() => {
				console.log('HTTP server closed');
				process.exit(0);
			});
		});

		process.on('SIGINT', () => {
			console.log('SIGINT signal received: closing HTTP server');
			server.close(() => {
				console.log('HTTP server closed');
				process.exit(0);
			});
		});
	} catch (err) {
		console.error("Error during server initialization:", err);
		process.exit(1);
	}
}

startServer();
