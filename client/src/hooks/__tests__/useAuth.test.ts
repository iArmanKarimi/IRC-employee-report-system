import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useIsGlobalAdmin } from '../useAuth';
import api from '../../api/api';
import { API_ENDPOINTS } from '../../const/endpoints';

vi.mock('../../api/api');

describe('useIsGlobalAdmin', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return true when user has global admin access', async () => {
		vi.mocked(api.get).mockResolvedValueOnce({ data: [] });

		const { result } = renderHook(() => useIsGlobalAdmin());

		expect(result.current.loading).toBe(true);
		expect(result.current.isGlobalAdmin).toBe(false);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.isGlobalAdmin).toBe(true);
		expect(api.get).toHaveBeenCalledWith(API_ENDPOINTS.PROVINCES);
	});

	it('should return false when user does not have global admin access', async () => {
		vi.mocked(api.get).mockRejectedValueOnce(new Error('Forbidden'));

		const { result } = renderHook(() => useIsGlobalAdmin());

		expect(result.current.loading).toBe(true);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.isGlobalAdmin).toBe(false);
		expect(api.get).toHaveBeenCalledWith(API_ENDPOINTS.PROVINCES);
	});

	it('should handle network errors gracefully', async () => {
		vi.mocked(api.get).mockRejectedValueOnce(new Error('Network Error'));

		const { result } = renderHook(() => useIsGlobalAdmin());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.isGlobalAdmin).toBe(false);
	});
});
