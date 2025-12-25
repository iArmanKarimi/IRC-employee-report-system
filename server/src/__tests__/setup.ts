import mongoose from 'mongoose';

/**
 * Connect to test MongoDB
 * Uses TEST_MONGODB_URI env var or defaults to localhost
 */
export const startTestDB = async (): Promise<void> => {
	const mongoUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/irc-test';
	await mongoose.connect(mongoUri);
};

/**
 * Delete all documents from all collections
 */
export const cleanupTestDB = async (): Promise<void> => {
	const collections = mongoose.connection.collections;
	for (const key in collections) {
		await collections[key].deleteMany({});
	}
};

/**
 * Disconnect from MongoDB
 */
export const stopTestDB = async (): Promise<void> => {
	await mongoose.disconnect();
};
