/**
 * UI Constants for consistent styling and behavior across the application
 */

// Form field validation constraints
export const FORM_CONSTRAINTS = {
	PERFORMANCE: {
		MIN: 0,
		MAX: 31,
	},
	CHILDREN_COUNT: {
		MIN: 0,
	},
	YEAR_OFFSET: {
		DEFAULT: 18, // Default offset for birth dates
		JOB_END: 0, // No offset for job end dates
	},
} as const;

// Common sx props for flexbox layouts
export const FLEX_STYLES = {
	ROW_BETWEEN: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
	},
	ROW_CENTER: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	COLUMN: {
		display: "flex",
		flexDirection: "column",
	},
} as const;

// Common spacing values
export const SPACING = {
	CARD_GAP: 3,
	SECTION_GAP: 2.5,
	FIELD_GAP: 2,
	SMALL_GAP: 1.5,
} as const;

// Pagination
export const PAGINATION = {
	DEFAULT_PAGE_SIZE: 20,
	MAX_PAGE_SIZE: 100,
} as const;

// Toast/Alert durations (milliseconds)
export const TOAST_DURATION = {
	DEFAULT: 4000,
	ERROR: 6000,
	SUCCESS: 3000,
} as const;

// Flex field sizing patterns
export const FLEX_FIELD = {
	HALF: { flex: "1 1 calc(50% - 8px)", minWidth: 200 },
	THIRD: { flex: "1 1 calc(33.33% - 8px)", minWidth: 180 },
	FULL: { flex: "1 1 100%" },
} as const;
