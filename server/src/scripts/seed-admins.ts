import { connectDB } from '../data-source';
import { User } from '../models/User';
import { Province } from '../models/Province';
import { USER_ROLE } from '../types/roles';
import bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

interface AdminConfig {
	globalAdmin?: {
		username: string;
		password: string;
	};
	provinceAdmins?: Array<{
		username: string;
		password: string;
		provinceName?: string;
	}>;
}

interface AdminCredentials {
	username: string;
	password: string;
}

/**
 * Validates that a string is not empty or whitespace-only
 */
function isValidString(value: string | undefined | null): boolean {
	return value !== undefined && value !== null && value.trim() !== '';
}

/**
 * Validates admin credentials
 */
function validateCredentials(credentials: AdminCredentials, context: string): string | null {
	if (!isValidString(credentials.username)) {
		return `${context}: username is required`;
	}
	if (!isValidString(credentials.password)) {
		return `${context}: password is required`;
	}
	return null;
}

/**
 * Reads and parses the admin configuration file
 */
function loadConfig(): AdminConfig {
	const configPath = path.join(__dirname, '../../admins.json');

	if (!fs.existsSync(configPath)) {
		console.error(`Error: admins.json not found at ${configPath}`);
		console.error('Please create admins.json based on admins.example.json');
		process.exit(1);
	}

	const configContent = fs.readFileSync(configPath, 'utf-8');
	try {
		return JSON.parse(configContent);
	} catch (parseError) {
		console.error('❌ Error parsing admins.json: Invalid JSON format');
		if (parseError instanceof Error) {
			console.error('Error details:', parseError.message);
		}
		process.exit(1);
	}
}

/**
 * Creates a password hash using bcrypt
 */
async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 10);
}

/**
 * Creates a global admin user
 */
async function createGlobalAdmin(credentials: AdminCredentials): Promise<void> {
	const validationError = validateCredentials(credentials, 'Global admin');
	if (validationError) {
		console.error(`  ❌ ${validationError}, skipping...`);
		return;
	}

	const { username, password } = credentials;
	const existingUser = await User.findOne({ username });
	if (existingUser) {
		// Sync password from config if it changed
		const samePassword = await bcrypt.compare(password, existingUser.passwordHash);
		if (!samePassword) {
			existingUser.passwordHash = await hashPassword(password);
			await existingUser.save();
			console.log(`  ✅ Updated password for global admin: ${username} from config`);
		} else {
			console.log(`  ℹ️  Password for global admin "${username}" already matches config`);
		}
		return;
	}

	const passwordHash = await hashPassword(password);
	const user = new User({
		username,
		passwordHash,
		role: USER_ROLE.GLOBAL_ADMIN,
	});

	await user.save();
	console.log(`  ✅ Created global admin: ${username}`);
}

/**
 * Links a province admin user to a province
 */
async function linkProvinceToAdmin(user: InstanceType<typeof User>, provinceName: string): Promise<boolean> {
	const province = await Province.findOne({ name: provinceName });
	if (!province) {
		return false;
	}

	// Check if province already has an admin
	if (province.admin) {
		const existingAdmin = await User.findById(province.admin);
		if (existingAdmin) {
			console.log(`  ⚠️  Province "${provinceName}" already has admin "${existingAdmin.username}", will be replaced`);
		}
	}

	user.provinceId = province._id;
	await user.save();

	province.admin = user._id;
	await province.save();

	return true;
}

/**
 * Creates a province admin user
 */
async function createProvinceAdmin(credentials: AdminCredentials & { provinceName?: string }): Promise<void> {
	const validationError = validateCredentials(credentials, `Province admin "${credentials.username}"`);
	if (validationError) {
		console.error(`  ❌ ${validationError}, skipping...`);
		return;
	}

	const { username, password, provinceName } = credentials;

	const existingUser = await User.findOne({ username });
	let user: InstanceType<typeof User>;

	if (existingUser) {
		// Ensure role is correct
		if (existingUser.role !== USER_ROLE.PROVINCE_ADMIN) {
			existingUser.role = USER_ROLE.PROVINCE_ADMIN;
		}

		// Sync password from config if it changed
		const samePassword = await bcrypt.compare(password, existingUser.passwordHash);
		if (!samePassword) {
			existingUser.passwordHash = await hashPassword(password);
			console.log(`  ✅ Updated password for province admin: ${username} from config`);
		} else {
			console.log(`  ℹ️  Password for province admin "${username}" already matches config`);
		}

		user = existingUser;
		await user.save();
	} else {
		const passwordHash = await hashPassword(password);
		user = new User({
			username,
			passwordHash,
			role: USER_ROLE.PROVINCE_ADMIN,
		});
		await user.save();
		console.log(`  ✅ Created province admin user: ${username}`);
	}

	// Link to province if provided
	if (isValidString(provinceName)) {
		const linked = await linkProvinceToAdmin(user, provinceName!);
		if (linked) {
			console.log(`  ✅ Created province admin: ${username} (linked to ${provinceName})`);
		} else {
			await user.save();
			console.log(`  ⚠️  Created province admin: ${username} (province "${provinceName}" not found, not linked)`);
		}
	} else {
		await user.save();
		console.log(`  ⚠️  Created province admin: ${username} (no province name provided)`);
	}
}

/**
 * Main function to seed admins from configuration
 */
async function seedAdmins() {
	try {
		await connectDB();
		console.log('Connected to database');

		const config = loadConfig();

		// Create global admin
		console.log('\nCreating global admin...');
		if (config.globalAdmin) {
			await createGlobalAdmin(config.globalAdmin);
		} else {
			console.log('  ⚠️  No global admin configured, skipping...');
		}

		// Create province admins
		console.log('\nCreating province admins...');
		if (!config.provinceAdmins || config.provinceAdmins.length === 0) {
			console.log('  ⚠️  No province admins configured, skipping...');
		} else {
			for (const admin of config.provinceAdmins) {
				await createProvinceAdmin(admin);
			}
		}

		console.log('\n✅ Admin seeding completed successfully!');
		process.exit(0);
	} catch (err) {
		console.error('❌ Error seeding admins:', err);
		if (err instanceof Error) {
			console.error('Error details:', err.message);
		}
		process.exit(1);
	}
}

// Run the seed script
seedAdmins();
