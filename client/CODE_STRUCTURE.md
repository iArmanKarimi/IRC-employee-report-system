# Client Code Structure & Standards

## 📁 Directory Structure

```
client/
├── public/                 # Static assets
├── src/
│   ├── api/               # API client & HTTP utilities
│   │   ├── api.ts        # Main API client (axios instance, endpoints)
│   │   └── __tests__/    # API tests
│   │
│   ├── components/        # React components
│   │   ├── common/       # ✨ Reusable UI components
│   │   │   ├── InfoField.tsx
│   │   │   ├── PerformanceSummaryTooltip.tsx
│   │   │   └── index.ts  # Barrel export
│   │   ├── dialogs/      # Modal/Dialog components
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── EditEmployeeDialog.tsx
│   │   │   ├── FormDialog.tsx
│   │   │   └── PerformanceDialog.tsx
│   │   ├── states/       # Loading/Error/Empty states
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorView.tsx
│   │   │   └── LoadingView.tsx
│   │   ├── Breadcrumbs.tsx
│   │   ├── NavBar.tsx
│   │   ├── PerformanceAccordion.tsx
│   │   ├── PerformanceCard.tsx
│   │   ├── PerformanceDisplay.tsx
│   │   ├── PerformanceManager.tsx
│   │   ├── PersianDateInput.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── SearchFilterBar.tsx
│   │   └── __tests__/    # Component tests
│   │
│   ├── const/            # Constants & configuration
│   │   ├── cookie.ts     # Cookie-related constants
│   │   ├── endpoints.ts  # API routes & endpoints
│   │   └── ui.ts         # ✨ UI constants (form constraints, styles, etc.)
│   │
│   ├── hooks/            # Custom React hooks
│   │   ├── useApiMutation.ts
│   │   ├── useAuth.ts
│   │   ├── useEmployee.ts
│   │   ├── useEmployees.ts
│   │   ├── useGlobalSettings.ts
│   │   ├── useProvinces.ts
│   │   └── __tests__/    # Hook tests
│   │
│   ├── pages/            # Page components (routes)
│   │   ├── AdminDashboardPage.tsx
│   │   ├── EmployeePage.tsx
│   │   ├── GlobalAdminDashboardPage.tsx
│   │   ├── LoginFormPage.tsx
│   │   ├── NewEmployeeFormPage.tsx
│   │   └── ProvinceEmployeesPage.tsx
│   │
│   ├── tests/            # Test configuration
│   │   ├── setup.ts      # Vitest setup
│   │   └── README.md     # Testing documentation
│   │
│   ├── theme/            # MUI theme configuration
│   │   └── theme.ts      # Custom theme definition
│   │
│   ├── types/            # TypeScript type definitions
│   │   ├── models.ts     # Data models
│   │   └── jalaali-js.d.ts  # Third-party type declarations
│   │
│   ├── utils/            # Utility functions
│   │   ├── dateUtils.ts      # Date conversion (Persian/Gregorian)
│   │   ├── formatters.ts     # Data formatters
│   │   └── __tests__/        # Utility tests
│   │
│   ├── App.tsx           # Main app component (routing)
│   └── main.tsx          # Entry point
│
├── docs/                 # Documentation
├── index.html           # HTML template
├── package.json         # Dependencies & scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
├── vitest.config.ts     # Test configuration
├── CLIENT_README.md     # Client documentation
├── IMPLEMENTATION.md    # Implementation details
├── REFACTORING_PLAN.md  # ✨ Refactoring roadmap
├── REFACTORING_SUMMARY.md  # ✨ Refactoring details
└── TEST_SUITE_SUMMARY.md   # Test coverage summary
```

## 📋 Coding Standards

### File Naming

- **Components**: PascalCase (e.g., `NavBar.tsx`, `EmployeePage.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Utils**: camelCase (e.g., `dateUtils.ts`, `formatters.ts`)
- **Constants**: camelCase (e.g., `endpoints.ts`, `ui.ts`)
- **Tests**: Same name as tested file + `.test.ts(x)`

### Component Structure

```tsx
// 1. Imports (grouped logically)
import { useState } from "react";
import Button from "@mui/material/Button";
import { ROUTES } from "../const/endpoints";
import { useAuth } from "../hooks/useAuth";

// 2. Types/Interfaces
type MyComponentProps = {
	title: string;
	onSave: () => void;
};

// 3. Main Component
export default function MyComponent({ title, onSave }: MyComponentProps) {
	// 4. State & hooks
	const [loading, setLoading] = useState(false);
	const { user } = useAuth();

	// 5. Handlers
	const handleClick = () => {
		setLoading(true);
		onSave();
	};

	// 6. Effects
	useEffect(() => {
		// ...
	}, []);

	// 7. Early returns (loading, error states)
	if (loading) return <LoadingView />;

	// 8. Render
	return <div>{title}</div>;
}

// 9. Helper components (if needed)
function HelperComponent() {
	return <span>Helper</span>;
}
```

### Import Order

1. React & React ecosystem
2. Third-party libraries (MUI, etc.)
3. Absolute imports from `src/`
4. Relative imports
5. Types

### TypeScript Guidelines

- Use `type` for simple object shapes
- Use `interface` for extensible/composable types
- Prefer explicit return types for complex functions
- Use `as const` for literal types
- Avoid `any` - use `unknown` if truly needed

### Styling Conventions

- Use MUI's `sx` prop for component-specific styles
- Extract repeated styles to constants in `const/ui.ts`
- Use theme values via `theme.spacing()`, `theme.palette.X`
- Avoid inline styles when possible

### State Management

- Use `useState` for local component state
- Use custom hooks for shared logic
- Keep state as close to usage as possible
- Lift state when multiple components need it

### API Calls

- All API calls go through `api/api.ts`
- Use custom hooks (`useEmployee`, `useEmployees`, etc.) for data fetching
- Use `useApiMutation` for mutations
- Handle loading/error states consistently

### Error Handling

- Use `ErrorView` component for page-level errors
- Use `Alert` component for form errors
- Always provide user-friendly Persian error messages
- Log detailed errors to console for debugging

### Constants

- Use `UPPER_SNAKE_CASE` for constant objects
- Mark as `as const` for literal type inference
- Group related constants in same file
- Document purpose with JSDoc

### Testing

- Write tests for utilities (100% coverage goal)
- Write tests for hooks (complex logic)
- Write tests for isolated components
- Use descriptive test names in Persian or English
- Follow AAA pattern (Arrange, Act, Assert)

## 🎯 Best Practices

### Performance

- Use `React.memo` for expensive components
- Avoid creating functions in render
- Destructure props in function signature
- Use `useMemo` for expensive computations
- Use `useCallback` for event handlers passed as props

### Accessibility

- Use semantic HTML
- Provide ARIA labels where needed
- Ensure keyboard navigation works
- Use proper heading hierarchy

### Code Quality

- Keep components under 300 lines
- Extract complex logic to hooks or utilities
- Use meaningful variable names (prefer Persian for UI strings)
- Comment complex business logic
- Keep functions focused (single responsibility)

### Git Commits

- Use conventional commit format
- Write clear, descriptive messages
- Group related changes
- Reference issue numbers when applicable

## 🔧 Development Workflow

### Adding a New Component

1. Create file in appropriate directory
2. Define TypeScript types first
3. Implement component with proper structure
4. Add to barrel export if in `common/`
5. Write tests if complex logic
6. Document props with JSDoc if needed

### Adding a New Page

1. Create in `pages/` directory
2. Add route in `App.tsx`
3. Add route constant in `const/endpoints.ts`
4. Implement with Loading/Error states
5. Add breadcrumbs if applicable
6. Test navigation flow

### Adding a New Hook

1. Create in `hooks/` directory
2. Prefix name with `use`
3. Define clear return type
4. Handle loading/error states
5. Add JSDoc documentation
6. Write tests for edge cases

### Using Constants

1. Check if constant exists in `const/ui.ts`
2. If not, add it there instead of hardcoding
3. Import and use: `import { PAGINATION } from "../const/ui"`
4. Mark as `as const` for type safety

## 📚 Key Files

| File                  | Purpose                                   |
| --------------------- | ----------------------------------------- |
| `api/api.ts`          | Axios instance, API client, all endpoints |
| `const/endpoints.ts`  | Route paths and API endpoints             |
| `const/ui.ts`         | UI constants (constraints, styles, etc.)  |
| `App.tsx`             | Route configuration                       |
| `theme/theme.ts`      | MUI theme customization                   |
| `types/models.ts`     | Data model interfaces                     |
| `utils/dateUtils.ts`  | Persian/Gregorian date conversion         |
| `utils/formatters.ts` | Data display formatting                   |

## 🧪 Testing

### Running Tests

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Test Files Location

- Component tests: `components/__tests__/`
- Hook tests: `hooks/__tests__/`
- Utility tests: `utils/__tests__/`
- Test setup: `tests/setup.ts`

## 🚀 Build & Deploy

### Development

```bash
npm run dev              # Start dev server (port 5173)
```

### Production

```bash
npm run build            # Build for production
npm run preview          # Preview production build
```

### Linting

```bash
npm run lint             # Run ESLint
```

## 📖 Additional Resources

- [CLIENT_README.md](CLIENT_README.md) - Setup & getting started
- [IMPLEMENTATION.md](IMPLEMENTATION.md) - Implementation details
- [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md) - Recent refactoring
- [TEST_SUITE_SUMMARY.md](TEST_SUITE_SUMMARY.md) - Test coverage details
- [MUI Documentation](https://mui.com/) - Material-UI docs
- [React Router](https://reactrouter.com/) - Routing documentation
- [Vitest](https://vitest.dev/) - Testing framework
