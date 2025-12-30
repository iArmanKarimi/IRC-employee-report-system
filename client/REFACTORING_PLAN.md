# Client Refactoring Plan

## ✅ Completed

### 1. Constants & Configuration

- Created `/const/ui.ts` with:
  - Form validation constraints (FORM_CONSTRAINTS)
  - Common flex styles (FLEX_STYLES)
  - Spacing constants (SPACING)
  - Pagination defaults (PAGINATION)
  - Toast durations (TOAST_DURATION)
  - Flex field sizing patterns (FLEX_FIELD)

### 2. Common Components

- Created `/components/common/InfoField.tsx` - Reusable labeled data display
- Created `/components/common/PerformanceSummaryTooltip.tsx` - Extracted tooltip component
- Created `/components/common/index.ts` - Barrel export

## 🔄 Recommended Next Steps

### 3. Apply Constants Throughout Codebase

- Replace hardcoded `20` with `PAGINATION.DEFAULT_PAGE_SIZE`
- Replace `4000` with `TOAST_DURATION.DEFAULT`
- Replace repeated `min: 0, max: 31` with `FORM_CONSTRAINTS.PERFORMANCE`
- Replace repeated flex styles with `FLEX_FIELD` constants

### 4. Component Extraction

- Extract `EmployeeStatsChips` from ProvinceEmployeesPage
- Extract `ExportButton` component
- Replace tooltip content with `PerformanceSummaryTooltip`
- Replace info fields in EmployeePage with `InfoField`

### 5. Hook Improvements

- Add JSDoc comments to all custom hooks
- Extract common loading/error patterns

### 6. Type Safety

- Create stricter types for form states
- Add JSDoc to complex utility functions

### 7. Code Organization

- Group related useState declarations
- Extract large useEffect logic to custom hooks
- Split large page components into feature components

## Benefits

- **Maintainability**: Centralized constants reduce update burden
- **Consistency**: Reusable components ensure UI uniformity
- **Readability**: Less code duplication, clearer intent
- **Type Safety**: Better TypeScript inference
- **Testing**: Isolated components easier to test
