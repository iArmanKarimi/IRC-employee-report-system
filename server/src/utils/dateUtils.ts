import jalaali from 'jalaali-js';

/**
 * Convert Gregorian date to Persian (Jalali) date string
 * @param date - Date object or ISO string
 * @param format - 'full' (1404/10/09) or 'compact' (1404-10-09) or 'text' (9 دی 1404)
 * @returns Formatted Persian date string
 */
export function toPersianDate(
	date: Date | string | null | undefined,
	format: 'full' | 'compact' | 'text' = 'full'
): string {
	if (!date) return '-';

	try {
		const d = typeof date === 'string' ? new Date(date) : date;
		if (isNaN(d.getTime())) return '-';

		const jalali = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());

		if (format === 'text') {
			const monthNames = [
				'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
				'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
			];
			return `${jalali.jd} ${monthNames[jalali.jm - 1]} ${jalali.jy}`;
		}

		const separator = format === 'compact' ? '-' : '/';
		const month = jalali.jm.toString().padStart(2, '0');
		const day = jalali.jd.toString().padStart(2, '0');

		return `${jalali.jy}${separator}${month}${separator}${day}`;
	} catch (error) {
		console.error('Error converting to Persian date:', error);
		return '-';
	}
}

/**
 * Get today's date in Persian format for filenames
 * @returns Today's date in compact Persian format (YYYY-MM-DD)
 */
export function getTodayPersianCompact(): string {
	return toPersianDate(new Date(), 'compact');
}
