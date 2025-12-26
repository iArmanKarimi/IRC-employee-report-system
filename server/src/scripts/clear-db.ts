import { connectDB } from '../data-source';
import { User } from '../models/User';
import { Province } from '../models/Province';
import { Employee } from '../models/Employee';
import { logger } from '../middleware/logger';

/**
 * Clear Database Script
 * 
 * This script clears all collections from the database:
 * - Users (including all admins)
 * - Provinces
 * - Employees
 * 
 * Usage: npm run clear-db
 * Warning: This will DELETE ALL DATA from the database!
 */

async function clearDatabase() {
	try {
		await connectDB();
		console.log('✅ Connected to database\n');

		// Confirm deletion
		const confirmation = process.argv[2];
		if (confirmation !== '--confirm') {
			console.warn('⚠️  WARNING: This will DELETE ALL data from the database!');
			console.warn('To proceed, run: npm run clear-db -- --confirm\n');
			process.exit(0);
		}

		// Delete collections
		console.log('Clearing database...\n');

		// 1. Delete all employees
		const employeeCount = await Employee.countDocuments();
		if (employeeCount > 0) {
			await Employee.deleteMany({});
			console.log(`🗑️  Deleted ${employeeCount} employee(s)`);
		} else {
			console.log('ℹ️  No employees to delete');
		}

		// 2. Delete all provinces
		const provinceCount = await Province.countDocuments();
		if (provinceCount > 0) {
			await Province.deleteMany({});
			console.log(`🗑️  Deleted ${provinceCount} province(s)`);
		} else {
			console.log('ℹ️  No provinces to delete');
		}

		// 3. Delete all users
		const userCount = await User.countDocuments();
		if (userCount > 0) {
			await User.deleteMany({});
			console.log(`🗑️  Deleted ${userCount} user(s)`);
		} else {
			console.log('ℹ️  No users to delete');
		}

		console.log('\n✅ Database cleared successfully!');
		process.exit(0);
	} catch (error) {
		console.error('❌ Error clearing database:', error);
		logger.error('Database clear operation failed', { error });
		process.exit(1);
	}
}

clearDatabase();
