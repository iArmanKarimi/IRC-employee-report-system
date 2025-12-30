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

		// Convert Gregorian date to Jalali (Persian) calendar
		const jalali = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());

		if (format === 'text') {
			// Persian month names for text format
			const monthNames = [
				'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
				'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
			];
			return `${jalali.jd} ${monthNames[jalali.jm - 1]} ${jalali.jy}`;
		}

		// Format with separator ('/' for full, '-' for compact)
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
 * Convert Persian (Jalali) date to Gregorian date
 * @param persianDate - Persian date string (e.g., "1404/10/09" or "1404-10-09")
 * @returns Date object or null if invalid
 */
export function toGregorianDate(persianDate: string): Date | null {
	if (!persianDate) return null;

	try {
		// Parse the Persian date (handle both / and - separators)
		const parts = persianDate.split(/[/-]/).map(p => parseInt(p, 10));
		if (parts.length !== 3 || parts.some(isNaN)) return null;

		// Convert Persian (Jalali) to Gregorian calendar
		const [jy, jm, jd] = parts;
		const gregorian = jalaali.toGregorian(jy, jm, jd);

		return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
	} catch (error) {
		console.error('Error converting from Persian date:', error);
		return null;
	}
}

/**
 * Get today's date in Persian format
 * @param format - 'full' (1404/10/09) or 'compact' (1404-10-09) or 'text' (9 دی 1404)
 * @returns Today's date in Persian format
 */
export function getTodayPersian(format: 'full' | 'compact' | 'text' = 'full'): string {
	return toPersianDate(new Date(), format);
}

/**
 * Format a Persian date for HTML date input (YYYY-MM-DD in Gregorian)
 * This is used when we need to populate an HTML date input from a Persian date
 * @param persianDate - Persian date string
 * @returns Gregorian date in YYYY-MM-DD format for HTML input
 */
export function persianToInputValue(persianDate: string): string {
	const gregorian = toGregorianDate(persianDate);
	if (!gregorian) return '';

	const year = gregorian.getFullYear();
	const month = (gregorian.getMonth() + 1).toString().padStart(2, '0');
	const day = gregorian.getDate().toString().padStart(2, '0');

	return `${year}-${month}-${day}`;
}

/**
 * Convert HTML date input value (YYYY-MM-DD Gregorian) to Persian date string
 * @param inputValue - HTML date input value (Gregorian YYYY-MM-DD)
 * @param format - Output format for Persian date
 * @returns Persian date string
 */
export function inputValueToPersian(
	inputValue: string,
	format: 'full' | 'compact' | 'text' = 'compact'
): string {
	if (!inputValue) return '';
	return toPersianDate(inputValue, format);
}

/**
 * Get the current Persian year
 */
export function getCurrentPersianYear(): number {
	const now = new Date();
	const jalali = jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
	return jalali.jy;
}

/**
 * Validate if a string is a valid Persian date
 * @param persianDate - Persian date string
 * @returns true if valid, false otherwise
 */
export function isValidPersianDate(persianDate: string): boolean {
	const gregorian = toGregorianDate(persianDate);
	return gregorian !== null;
}
