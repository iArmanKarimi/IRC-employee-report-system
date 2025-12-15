import { connectDB } from '../data-source';
import { User } from '../models/User';
import { Province } from '../models/Province';
import { USER_ROLE } from '../types/roles';
import { logger } from '../middleware/logger';
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

interface SeedConfig {
	admins: AdminConfig;
}


// Helper functions from seed-admins.ts
function isValidString(value: string | undefined | null): boolean {
	return value !== undefined && value !== null && value.trim() !== '';
}

interface AdminCredentials {
	username: string;
	password: string;
}

interface SeedStats {
	globalAdminCreated: boolean;
	globalAdminUpdated: boolean;
	provinceAdminsCreated: number;
	provinceAdminsUpdated: number;
	provinceAdminsLinked: number;
	errors: string[];
}

function validateCredentials(credentials: AdminCredentials, context: string): string | null {
	if (!isValidString(credentials.username)) {
		return `${context}: username is required`;
	}
	if (!isValidString(credentials.password)) {
		return `${context}: password is required`;
	}
	return null;
}

async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 10);
}

async function createGlobalAdmin(credentials: AdminCredentials, stats: SeedStats): Promise<void> {
	const validationError = validateCredentials(credentials, 'Global admin');
	if (validationError) {
		const errMsg = `${validationError}, skipping...`;
		console.error(`  ❌ ${errMsg}`);
		stats.errors.push(errMsg);
		return;
	}

	const { username, password } = credentials;

	try {
		const existingUser = await User.findOne({ username });
		if (existingUser) {
			const samePassword = await bcrypt.compare(password, existingUser.passwordHash);
			if (!samePassword) {
				existingUser.passwordHash = await hashPassword(password);
				await existingUser.save();
				logger.info("Global admin password updated", { username });
				console.log(`  ✅ Updated password for global admin: ${username} from config`);
				stats.globalAdminUpdated = true;
			} else {
				logger.debug("Global admin password unchanged", { username });
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
		logger.info("Global admin created", { username });
		console.log(`  ✅ Created global admin: ${username}`);
		stats.globalAdminCreated = true;
	} catch (err) {
		const errMsg = `Failed to create global admin ${username}`;
		logger.error(errMsg, err);
		console.error(`  ❌ ${errMsg}`);
		stats.errors.push(errMsg);
	}
}

async function linkProvinceToAdmin(user: InstanceType<typeof User>, provinceName: string, stats: SeedStats): Promise<boolean> {
	try {
		const province = await Province.findOne({ name: provinceName });
		if (!province) {
			const errMsg = `Province "${provinceName}" not found`;
			logger.warn(errMsg, { username: user.username });
			return false;
		}

		if (province.admin) {
			const existingAdmin = await User.findById(province.admin);
			if (existingAdmin) {
				logger.warn("Province admin will be replaced", {
					province: provinceName,
					oldAdmin: existingAdmin.username,
					newAdmin: user.username
				});
				console.log(`  ⚠️  Province "${provinceName}" already has admin "${existingAdmin.username}", will be replaced`);
			}
		}

		user.provinceId = province._id;
		await user.save();

		province.admin = user._id;
		await province.save();

		logger.info("Province admin linked", { username: user.username, province: provinceName });
		return true;
	} catch (err) {
		logger.error("Failed to link province admin", err);
		stats.errors.push(`Failed to link ${user.username} to province ${provinceName}`);
		return false;
	}
}

async function createProvinceAdmin(credentials: AdminCredentials & { provinceName?: string }, stats: SeedStats): Promise<void> {
	const validationError = validateCredentials(credentials, `Province admin "${credentials.username}"`);
	if (validationError) {
		const errMsg = `${validationError}, skipping...`;
		console.error(`  ❌ ${errMsg}`);
		stats.errors.push(errMsg);
		return;
	}

	const { username, password, provinceName } = credentials;

	try {
		const existingUser = await User.findOne({ username });
		let user: InstanceType<typeof User>;

		if (existingUser) {
			if (existingUser.role !== USER_ROLE.PROVINCE_ADMIN) {
				existingUser.role = USER_ROLE.PROVINCE_ADMIN;
			}

			const samePassword = await bcrypt.compare(password, existingUser.passwordHash);
			if (!samePassword) {
				existingUser.passwordHash = await hashPassword(password);
				await existingUser.save();
				logger.info("Province admin password updated", { username });
				console.log(`  ✅ Updated password for province admin: ${username} from config`);
				stats.provinceAdminsUpdated++;
			} else {
				logger.debug("Province admin password unchanged", { username });
				console.log(`  ℹ️  Password for province admin "${username}" already matches config`);
			}

			user = existingUser;
		} else {
			const passwordHash = await hashPassword(password);
			user = new User({
				username,
				passwordHash,
				role: USER_ROLE.PROVINCE_ADMIN,
			});
			await user.save();
			logger.info("Province admin user created", { username });
			console.log(`  ✅ Created province admin user: ${username}`);
			stats.provinceAdminsCreated++;
		}

		if (isValidString(provinceName)) {
			const linked = await linkProvinceToAdmin(user, provinceName!, stats);
			if (linked) {
				logger.info("Province admin created and linked", { username, province: provinceName });
				console.log(`  ✅ Created province admin: ${username} (linked to ${provinceName})`);
				stats.provinceAdminsLinked++;
			} else {
				logger.warn("Province admin created but not linked", { username, province: provinceName });
				console.log(`  ⚠️  Created province admin: ${username} (province "${provinceName}" not found, not linked)`);
			}
		} else {
			logger.warn("Province admin created without province", { username });
			console.log(`  ⚠️  Created province admin: ${username} (no province name provided)`);
		}
	} catch (err) {
		const errMsg = `Failed to create province admin ${username}`;
		logger.error(errMsg, err);
		console.error(`  ❌ ${errMsg}`);
		stats.errors.push(errMsg);
	}
}

// Seed provinces by extracting unique province names from provinceAdmins
async function seedProvincesFromAdmins(provinceAdmins: { provinceName?: string }[]) {
	const uniqueProvinces = Array.from(new Set(
		provinceAdmins
			.map(a => a.provinceName)
			.filter((name): name is string => !!name)
	));
	for (const name of uniqueProvinces) {
		let existing = await Province.findOne({ name });
		if (!existing) {
			existing = new Province({ name });
			await existing.save();
			logger.info('Province created', { name });
			console.log(`  ✅ Created province: ${name}`);
		} else {
			console.log(`  ℹ️  Province already exists: ${name}`);
		}
	}
}

// ...existing admin seeding logic, but call seedProvinces before seeding admins


async function seedDB() {
	const configPath = path.join(__dirname, '../../seed-config.json');
	if (!fs.existsSync(configPath)) {
		console.error(`Error: seed-config.json not found at ${configPath}`);
		process.exit(1);
	}
	const configContent = fs.readFileSync(configPath, 'utf-8');
	const config: SeedConfig = JSON.parse(configContent);

	await connectDB();
	logger.info('Database connected');
	console.log('✅ Connected to database\n');

	// Seed provinces based on provinceAdmins
	if (config.admins && config.admins.provinceAdmins && config.admins.provinceAdmins.length > 0) {
		console.log('Seeding provinces from provinceAdmins...');
		await seedProvincesFromAdmins(config.admins.provinceAdmins);
	}

	// Seed admins
	const stats: SeedStats = {
		globalAdminCreated: false,
		globalAdminUpdated: false,
		provinceAdminsCreated: 0,
		provinceAdminsUpdated: 0,
		provinceAdminsLinked: 0,
		errors: []
	};

	// Create global admin
	console.log('Creating global admin...');
	if (config.admins && config.admins.globalAdmin) {
		await createGlobalAdmin(config.admins.globalAdmin, stats);
	} else {
		console.log('  ⚠️  No global admin configured, skipping...');
	}

	// Create province admins
	console.log('\nCreating province admins...');
	if (!config.admins || !config.admins.provinceAdmins || config.admins.provinceAdmins.length === 0) {
		console.log('  ⚠️  No province admins configured, skipping...');
	} else {
		for (const admin of config.admins.provinceAdmins) {
			await createProvinceAdmin(admin, stats);
		}
	}

	// Print summary
	console.log('\n' + '='.repeat(50));
	console.log('SEED SUMMARY');
	console.log('='.repeat(50));

	if (stats.globalAdminCreated) {
		console.log('✅ Global Admin: Created');
	} else if (stats.globalAdminUpdated) {
		console.log('✅ Global Admin: Updated');
	} else {
		console.log('ℹ️  Global Admin: No changes');
	}

	console.log(`Province Admins:`);
	console.log(`  Created: ${stats.provinceAdminsCreated}`);
	console.log(`  Updated: ${stats.provinceAdminsUpdated}`);
	console.log(`  Linked:  ${stats.provinceAdminsLinked}`);

	if (stats.errors.length > 0) {
		console.log(`\nErrors (${stats.errors.length}):`);
		stats.errors.forEach(err => console.log(`  • ${err}`));
		logger.warn("Seed completed with errors", { errorCount: stats.errors.length });
		console.log('\n⚠️  Seeding completed with errors');
		process.exit(1);
	} else {
		logger.info("Seeding completed successfully");
		console.log('\n✅ Seeding completed successfully!');
		process.exit(0);
	}
}

seedDB();
