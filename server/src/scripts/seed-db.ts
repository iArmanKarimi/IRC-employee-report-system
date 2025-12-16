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
        provinceName: string;
    }>;
}

interface SeedConfig {
    admins: AdminConfig;
}

function isValidString(value: string | undefined | null): boolean {
    return value !== undefined && value !== null && value.trim() !== '';
}

function normalizeProvinceName(name: string): string {
    return name.trim();
    // If you want case-insensitive uniqueness:
    // return name.trim().toLowerCase();
}

async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

async function validateCredentials(username: string, password: string, context: string) {
    if (!isValidString(username)) throw new Error(`${context}: username is required`);
    if (!isValidString(password)) throw new Error(`${context}: password is required`);
}

// ------------------------------------------------------------
// GLOBAL ADMIN
// ------------------------------------------------------------
async function createOrUpdateGlobalAdmin(credentials: { username: string; password: string }) {
    const { username, password } = credentials;
    await validateCredentials(username, password, 'Global admin');

    const existing = await User.findOne({ username });

    if (existing) {
        const same = await bcrypt.compare(password, existing.passwordHash);
        if (!same) {
            existing.passwordHash = await hashPassword(password);
            await existing.save();
            console.log(`  🔄 Updated global admin password: ${username}`);
        } else {
            console.log(`  ℹ️ Global admin password unchanged: ${username}`);
        }
        return existing;
    }

    const user = new User({
        username,
        passwordHash: await hashPassword(password),
        role: USER_ROLE.GLOBAL_ADMIN
    });

    await user.save();
    console.log(`  ✅ Created global admin: ${username}`);
    return user;
}

// ------------------------------------------------------------
// PROVINCE ADMINS (users only, no province creation yet)
// ------------------------------------------------------------
async function createOrUpdateProvinceAdmin(
    username: string,
    password: string
) {
    await validateCredentials(username, password, `Province admin "${username}"`);

    let user = await User.findOne({ username });

    if (user) {
        const same = await bcrypt.compare(password, user.passwordHash);
        if (!same) {
            user.passwordHash = await hashPassword(password);
            console.log(`  🔄 Updated password for province admin: ${username}`);
        }
        user.role = USER_ROLE.PROVINCE_ADMIN;
        await user.save();
        return user;
    }

    user = new User({
        username,
        passwordHash: await hashPassword(password),
        role: USER_ROLE.PROVINCE_ADMIN
    });

    await user.save();
    console.log(`  ✅ Created province admin user: ${username}`);
    return user;
}

// ------------------------------------------------------------
// CREATE PROVINCES *AFTER* ADMINS EXIST (DEDUPED)
// ------------------------------------------------------------
async function createProvincesWithAdmins(
    provinceAdmins: Array<{ username: string; provinceName: string }>
) {
    // Deduplicate by normalized province name
    const provinceMap = new Map<string, { provinceName: string; username: string }>();

    for (const entry of provinceAdmins) {
        if (!entry.provinceName) continue;

        const normalizedName = normalizeProvinceName(entry.provinceName);

        // Keep the LAST admin for each province
        provinceMap.set(normalizedName, {
            provinceName: normalizedName,
            username: entry.username,
        });
    }

    for (const { provinceName, username } of provinceMap.values()) {
        const admin = await User.findOne({ username });
        if (!admin) {
            console.log(`  ❌ Cannot create province "${provinceName}" — admin "${username}" not found`);
            continue;
        }

        let province = await Province.findOne({ name: provinceName });

        if (province) {
            if (!province.admin || province.admin.toString() !== admin._id.toString()) {
                province.admin = admin._id;
                await province.save();
                console.log(`  🔄 Updated province "${provinceName}" admin → ${username}`);
            } else {
                console.log(`  ℹ️ Province "${provinceName}" already linked to ${username}`);
            }
        } else {
            province = new Province({
                name: provinceName,
                admin: admin._id,
            });
            await province.save();
            console.log(`  ✅ Created province "${provinceName}" with admin ${username}`);
        }

        admin.provinceId = province._id;
        await admin.save();
    }
}

// ------------------------------------------------------------
// MAIN SEEDING FLOW
// ------------------------------------------------------------
async function seedDB() {
    const configPath = path.join(__dirname, '../../seed-config.json');
    if (!fs.existsSync(configPath)) {
        console.error(`Error: seed-config.json not found at ${configPath}`);
        process.exit(1);
    }

    const config: SeedConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    await connectDB();
    console.log('✅ Connected to database\n');

    // 1. Global admin
    if (config.admins.globalAdmin) {
        console.log('Creating global admin...');
        await createOrUpdateGlobalAdmin(config.admins.globalAdmin);
    }

    // 2. Province admins (users only)
    console.log('\nCreating province admin users...');
    const provinceAdmins = config.admins.provinceAdmins || [];
    for (const admin of provinceAdmins) {
        await createOrUpdateProvinceAdmin(admin.username, admin.password);
    }

    // 3. Provinces WITH admins assigned (deduped)
    console.log('\nCreating provinces with assigned admins...');
    await createProvincesWithAdmins(provinceAdmins);

    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
}

seedDB();
