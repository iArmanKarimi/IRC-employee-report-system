import { describe, it, expect } from 'vitest';
import { formatEmployeeName } from '../formatters';
import type { Employee } from '../../api/api';

describe('formatEmployeeName', () => {
	it('should return fullName when available', () => {
		const employee = {
			_id: '123',
			basicInfo: {
				firstName: 'علی',
				lastName: 'محمدی',
				fullName: 'علی محمدی رضایی',
			},
		} as unknown as Employee;

		expect(formatEmployeeName(employee)).toBe('علی محمدی رضایی');
	});

	it('should return firstName + lastName when fullName is not available', () => {
		const employee = {
			_id: '123',
			basicInfo: {
				firstName: 'علی',
				lastName: 'محمدی',
			},
		} as unknown as Employee;

		expect(formatEmployeeName(employee)).toBe('علی محمدی');
	});

	it('should return firstName only when lastName is not available', () => {
		const employee = {
			_id: '123',
			basicInfo: {
				firstName: 'علی',
			},
		} as unknown as Employee;

		expect(formatEmployeeName(employee)).toBe('علی');
	});

	it('should return lastName only when firstName is not available', () => {
		const employee = {
			_id: '123',
			basicInfo: {
				lastName: 'محمدی',
			},
		} as unknown as Employee;

		expect(formatEmployeeName(employee)).toBe('محمدی');
	});

	it('should return employee _id when no name information is available', () => {
		const employee = {
			_id: '123456',
			basicInfo: {},
		} as unknown as Employee;

		expect(formatEmployeeName(employee)).toBe('123456');
	});

	it('should handle missing basicInfo', () => {
		const employee = {
			_id: '123456',
		} as unknown as Employee;

		expect(formatEmployeeName(employee)).toBe('123456');
	});

	it('should trim whitespace from names', () => {
		const employee = {
			_id: '123',
			basicInfo: {
				firstName: '  علی  ',
				lastName: '  محمدی  ',
			},
		} as unknown as Employee;

		expect(formatEmployeeName(employee)).toBe('علی محمدی');
	});

	it('should handle empty string names', () => {
		const employee = {
			_id: '123',
			basicInfo: {
				firstName: '',
				lastName: '',
			},
		} as unknown as Employee;

		expect(formatEmployeeName(employee)).toBe('123');
	});
});
