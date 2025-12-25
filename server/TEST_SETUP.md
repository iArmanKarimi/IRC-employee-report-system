# Jest + Supertest Test Suite Setup

## ✅ Created Files

### Configuration

- **jest.config.js** - Jest configuration with ts-jest preset, 60s timeout, single worker

### Test Utilities

- ****tests**/setup.ts** - Database setup with:
  - `startTestDB()` - Starts mongodb-memory-server and connects Mongoose
  - `cleanupTestDB()` - Clears all collections between tests
  - `stopTestDB()` - Disconnects and stops MongoDB

### Test Files (32 tests total)

- ****tests**/auth.test.ts** (6 tests)
  - Login with valid/invalid credentials
  - Missing credentials validation
  - Logout functionality
- ****tests**/provinces.test.ts** (6 tests)

  - List provinces (global admin only)
  - Get province detail
  - Authentication/authorization checks
  - Invalid ID format handling

- ****tests**/employees.test.ts** (15 tests)

  - Create employee (global admin & province admin)
  - Access control (province admin scope)
  - List employees with pagination
  - Get employee detail
  - Cross-province validation

- ****tests**/health.test.ts** (5 tests)
  - Health check endpoint
  - Public accessibility
  - 404 handler

## 📦 Dependencies Added

```json
{
	"jest": "^29.7.0",
	"supertest": "^6.3.0",
	"ts-jest": "^29.1.0",
	"mongodb-memory-server": "^9.3.0",
	"@types/jest": "^29.5.0",
	"@types/supertest": "^6.0.0"
}
```

## 🚀 Running Tests

```bash
# Install dependencies (first time only, takes ~2 min for MongoDB download)
npm install

# Run all tests (single worker, 60s timeout per test)
npm test

# Watch mode
npm test:watch
```

## 📋 Test Features

✅ **Jest** - Test runner  
✅ **Supertest** - HTTP route testing  
✅ **mongodb-memory-server** - In-memory MongoDB (no real database needed)  
✅ **async/await** - Only async patterns, no callbacks  
✅ **Proper lifecycle** - beforeAll/afterEach/afterAll hooks  
✅ **Collection cleanup** - Fresh DB state between tests  
✅ **Access control tests** - Role-based authorization verification  
✅ **Pagination tests** - Offset/limit validation

## ⚡ First Run Note

The first test run will download MongoDB binary (~750MB). This is one-time only and cached locally. Subsequent runs are fast.

## 📝 Test Structure

Each test file:

- Starts test DB in `beforeAll`
- Cleans collections in `afterEach` (fresh state per test)
- Stops DB in `afterAll`
- Uses 15s individual test timeouts
- Sets cookies for authenticated routes
- Tests both success and error paths
