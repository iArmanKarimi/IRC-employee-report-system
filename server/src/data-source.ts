import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ircdb';

export const connectDB = async () => {
	try {
		await mongoose.connect(MONGODB_URI);
		console.log('MongoDB connected successfully');

		// Handle MongoDB connection events
		mongoose.connection.on('error', (err) => {
			console.error('MongoDB connection error:', err);
		});

		mongoose.connection.on('disconnected', () => {
			console.warn('MongoDB disconnected');
		});

		mongoose.connection.on('reconnected', () => {
			console.log('MongoDB reconnected');
		});
	} catch (err) {
		console.error('Failed to connect to MongoDB:', err);
		if (err instanceof Error) {
			console.error('Error details:', err.message);
		}
		throw err; // Re-throw to let caller handle
	}
};
