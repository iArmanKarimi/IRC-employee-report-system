import request from 'supertest';
import { app } from '../app';
import { startTestDB, stopTestDB } from './setup';

describe('System Routes', () => {
	beforeAll(async () => {
		await startTestDB();
	}, 60000);

	afterAll(async () => {
		await stopTestDB();
	}, 60000);

	describe('GET /health', () => {
		it('should return health status', async () => {
			const response = await request(app)
				.get('/health');

			expect(response.status).toBe(200);
			expect(response.body.ok).toBe(true);
			expect(response.body.timestamp).toBeDefined();
		}, 15000);

		it('should be accessible without authentication', async () => {
			const response = await request(app)
				.get('/health');

			expect(response.status).toBe(200);
		}, 15000);
	});

	describe('404 Handler', () => {
		it('should return 404 for non-existent route', async () => {
			const response = await request(app)
				.get('/non-existent-route');

			expect(response.status).toBe(404);
			expect(response.body.success).toBe(false);
		}, 15000);
	});
});
