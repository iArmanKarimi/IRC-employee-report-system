import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../app';
import { startTestDB, cleanupTestDB, stopTestDB } from './setup';
import { User } from '../models/User';

describe('Authentication Routes', () => {
	beforeAll(async () => {
		await startTestDB();
	}, 60000);

	afterEach(async () => {
		await cleanupTestDB();
	});

	afterAll(async () => {
		await stopTestDB();
	}, 60000);

	describe('POST /auth/login', () => {
		it('should login successfully with valid credentials', async () => {
			const hashedPassword = await bcrypt.hash('password123', 10);
			await User.create({
				username: 'testuser',
				passwordHash: hashedPassword,
				role: 'globalAdmin',
			});

			const response = await request(app)
				.post('/auth/login')
				.send({
					username: 'testuser',
					password: 'password123',
				});

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.role).toBe('globalAdmin');
			expect(response.headers['set-cookie']).toBeDefined();
		}, 15000);

		it('should return 401 for non-existent user', async () => {
			const response = await request(app)
				.post('/auth/login')
				.send({
					username: 'nonexistent',
					password: 'password123',
				});

			expect(response.status).toBe(401);
			expect(response.body.error).toBe('Invalid credentials');
		}, 15000);

		it('should return 401 for incorrect password', async () => {
			const hashedPassword = await bcrypt.hash('correct', 10);
			await User.create({
				username: 'testuser',
				passwordHash: hashedPassword,
				role: 'globalAdmin',
			});

			const response = await request(app)
				.post('/auth/login')
				.send({
					username: 'testuser',
					password: 'wrong',
				});

			expect(response.status).toBe(401);
			expect(response.body.error).toBe('Invalid credentials');
		}, 15000);

		it('should return 400 for missing credentials', async () => {
			const response = await request(app)
				.post('/auth/login')
				.send({});

			expect(response.status).toBe(400);
		}, 15000);
	});

	describe('POST /auth/logout', () => {
		it('should logout successfully', async () => {
			const response = await request(app)
				.post('/auth/logout');

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		}, 15000);
	});
});
