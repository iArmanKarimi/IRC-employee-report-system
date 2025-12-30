import { describe, it, expect, vi } from 'vitest';
import jalaali from 'jalaali-js';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useApiMutation } from '../useApiMutation';

describe('useApiMutation', () => {
	it('should convert Gregorian date to Persian (Jalali) date', () => {
		// Example: 2025-12-30 (Gregorian) => 1404-10-9 (Jalali)
		const gregorian = { gy: 2025, gm: 12, gd: 30 };
		const jalaliDate = jalaali.toJalaali(gregorian.gy, gregorian.gm, gregorian.gd);
		expect(jalaliDate.jy).toBe(1404);
		expect(jalaliDate.jm).toBe(10);
		expect(jalaliDate.jd).toBe(9);
	});
	it('should initialize with correct default values', () => {
		const mockMutationFn = vi.fn();
		const { result } = renderHook(() => useApiMutation(mockMutationFn));

		expect(result.current.data).toBeNull();
		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBeNull();
		expect(typeof result.current.mutate).toBe('function');
		expect(typeof result.current.reset).toBe('function');
	});

	it('should handle successful mutation', async () => {
		const mockData = { id: '123', name: 'Test' };
		const mockMutationFn = vi
			.fn()
			.mockResolvedValue({ success: true, data: mockData });

		const { result } = renderHook(() => useApiMutation(mockMutationFn));

		let mutationResult: any;
		await act(async () => {
			mutationResult = await result.current.mutate('arg1', 'arg2');
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.data).toEqual(mockData);
		expect(result.current.error).toBeNull();
		expect(mutationResult).toEqual(mockData);
		expect(mockMutationFn).toHaveBeenCalledWith('arg1', 'arg2');
	});

	it('should handle failed mutation with error message', async () => {
		const mockMutationFn = vi
			.fn()
			.mockResolvedValue({ success: false, error: 'Operation failed' });

		const { result } = renderHook(() => useApiMutation(mockMutationFn));

		let mutationResult: any;
		await act(async () => {
			mutationResult = await result.current.mutate();
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.data).toBeNull();
		expect(result.current.error).toBe('Operation failed');
		expect(mutationResult).toBeNull();
	});

	it('should handle failed mutation without error message', async () => {
		const mockMutationFn = vi.fn().mockResolvedValue({ success: false });

		const { result } = renderHook(() => useApiMutation(mockMutationFn));

		await act(async () => {
			await result.current.mutate();
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe('Operation failed');
	});

	it('should handle thrown errors', async () => {
		const mockMutationFn = vi
			.fn()
			.mockRejectedValue(new Error('Network error'));

		const { result } = renderHook(() => useApiMutation(mockMutationFn));

		await act(async () => {
			await result.current.mutate();
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe('Network error');
		expect(result.current.data).toBeNull();
	});

	it('should handle non-Error thrown values', async () => {
		const mockMutationFn = vi.fn().mockRejectedValue('String error');

		const { result } = renderHook(() => useApiMutation(mockMutationFn));

		await act(async () => {
			await result.current.mutate();
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe('Operation failed');
	});

	it('should set loading to true during mutation', async () => {
		const mockMutationFn = vi.fn(
			() =>
				new Promise((resolve) =>
					setTimeout(() => resolve({ success: true, data: {} }), 100)
				)
		);

		const { result } = renderHook(() => useApiMutation(mockMutationFn));

		act(() => {
			result.current.mutate();
		});

		expect(result.current.loading).toBe(true);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});
	});

	it('should reset state when reset is called', async () => {
		const mockData = { id: '123' };
		const mockMutationFn = vi
			.fn()
			.mockResolvedValue({ success: true, data: mockData });

		const { result } = renderHook(() => useApiMutation(mockMutationFn));

		await act(async () => {
			await result.current.mutate();
		});

		await waitFor(() => {
			expect(result.current.data).toEqual(mockData);
		});

		act(() => {
			result.current.reset();
		});

		expect(result.current.data).toBeNull();
		expect(result.current.error).toBeNull();
		expect(result.current.loading).toBe(false);
	});

	it('should clear previous error on new mutation', async () => {
		const mockMutationFn = vi
			.fn()
			.mockResolvedValueOnce({ success: false, error: 'First error' })
			.mockResolvedValueOnce({ success: true, data: { id: '123' } });

		const { result } = renderHook(() => useApiMutation(mockMutationFn));

		await act(async () => {
			await result.current.mutate();
		});

		await waitFor(() => {
			expect(result.current.error).toBe('First error');
		});

		await act(async () => {
			await result.current.mutate();
		});

		await waitFor(() => {
			expect(result.current.error).toBeNull();
			expect(result.current.data).toEqual({ id: '123' });
		});
	});

	it('should handle mutation with no data in successful response', async () => {
		const mockMutationFn = vi.fn().mockResolvedValue({ success: true });

		const { result } = renderHook(() => useApiMutation(mockMutationFn));

		let mutationResult: any;
		await act(async () => {
			mutationResult = await result.current.mutate();
		});

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.data).toBeNull();
		expect(mutationResult).toBeNull();
		expect(result.current.error).toBeNull();
	});
});
