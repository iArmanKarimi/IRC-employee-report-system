# Client Testing Documentation

## Overview

This directory contains comprehensive tests for the IRC Staff System client application using **Vitest** and **React Testing Library**.

## Test Structure

```
client/src/
├── tests/
│   ├── setup.ts                 # Test environment setup
│   └── README.md                # This file
├── utils/__tests__/             # Utility function tests
├── hooks/__tests__/             # React hooks tests
└── components/__tests__/        # Component tests
```

## Running Tests

### All Tests

```bash
npm test
```

### Watch Mode (for development)

```bash
npm test -- --watch
```

### Run Tests Once

```bash
npm run test:run
```

### With UI Interface

```bash
npm run test:ui
```

### With Coverage Report

```bash
npm run test:coverage
```

## Test Categories

### 1. Utility Tests (`utils/__tests__/`)

- **formatters.test.ts**: Tests for employee name formatting logic
  - Handles full names, first/last names, missing data
  - Tests whitespace trimming and fallback logic

### 2. Hook Tests (`hooks/__tests__/`)

- **useAuth.test.ts**: Authentication hook tests
  - Global admin access verification
  - Error handling for unauthorized users
- **useApiMutation.test.ts**: Generic mutation hook tests
  - Success/failure scenarios
  - Loading states
  - Error handling
  - State reset functionality

### 3. Component Tests (`components/__tests__/`)

- **Breadcrumbs.test.tsx**: Navigation breadcrumb tests
  - Dynamic breadcrumb generation
  - Province and employee navigation
  - Edge cases (empty names, etc.)
- **ProtectedRoute.test.tsx**: Route protection tests
  - Authorization checks
  - Loading states
  - Redirect behavior

## Test Coverage

Current test coverage (as of latest run):

- **Test Files**: 5 passed
- **Total Tests**: 34 passed
- **Test Categories**:
  - Utils: 8 tests (employee name formatting)
  - Hooks: 13 tests (API mutations, authentication)
  - Components: 13 tests (breadcrumbs, protected routes)

### Coverage Goals

- **Statements**: Aim for >80%
- **Branches**: Aim for >75%
- **Functions**: Aim for >80%
- **Lines**: Aim for >80%

## Writing New Tests

### Component Test Example

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MyComponent from "../MyComponent";

describe("MyComponent", () => {
	it("should render correctly", () => {
		render(<MyComponent />);
		expect(screen.getByText("Expected Text")).toBeInTheDocument();
	});
});
```

### Hook Test Example

```typescript
import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useMyHook } from "../useMyHook";

describe("useMyHook", () => {
	it("should return expected value", async () => {
		const { result } = renderHook(() => useMyHook());
		await waitFor(() => {
			expect(result.current.value).toBe("expected");
		});
	});
});
```

### API Test Example

```typescript
import { describe, it, expect, vi } from "vitest";
import api from "../api";

vi.mock("axios");

describe("API Function", () => {
	it("should call endpoint correctly", async () => {
		vi.mocked(api.get).mockResolvedValue({ data: { success: true } });
		const result = await myApiFunction();
		expect(result.success).toBe(true);
	});
});
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Clarity**: Test names should clearly describe what is being tested
3. **Mocking**: Mock external dependencies (API calls, browser APIs)
4. **Cleanup**: Use `beforeEach` and `afterEach` for setup/teardown
5. **Async**: Always use `waitFor` for async operations
6. **Accessibility**: Use accessible queries (`getByRole`, `getByLabelText`)

## Mocking

### API Mocking

```typescript
vi.mock("../../api/api");
vi.mocked(api.get).mockResolvedValue({ data: mockData });
```

### Router Mocking

```typescript
<MemoryRouter initialEntries={["/path"]}>
	<Component />
</MemoryRouter>
```

## Common Testing Utilities

- `render()`: Render a component
- `screen`: Query the rendered output
- `waitFor()`: Wait for async operations
- `userEvent`: Simulate user interactions
- `vi.fn()`: Create mock functions
- `vi.mock()`: Mock modules

## Continuous Integration

Tests should be run in CI/CD pipeline:

- On every pull request
- Before deployment
- As part of pre-commit hooks

## Troubleshooting

### Tests are slow

- Use `vi.mock()` to mock heavy dependencies
- Avoid unnecessary async operations
- Use `test.concurrent()` for parallel execution

### Flaky tests

- Ensure proper cleanup in `afterEach`
- Use `waitFor()` instead of fixed timeouts
- Check for race conditions

### Mock not working

- Verify mock is called before importing the tested module
- Check mock path matches the import path
- Use `vi.clearAllMocks()` in `beforeEach`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro)
- [Vitest UI](https://vitest.dev/guide/ui.html)
