# Performance Lock Feature - Implementation Summary

## Overview

Implemented a global admin lock mechanism that prevents all employees from editing their performance records system-wide. This feature allows global administrators to temporarily lock performance editing across the entire system.

## Feature Behavior

### Lock States

- **Locked**: All employees cannot edit performance records; "Reset All Performances" button is disabled
- **Unlocked**: Employees can edit performance records; all functions are available

### User Experience

1. **Global Admin Dashboard**: Toggle lock with confirmation dialog and countdown timer
2. **Lock Status Display**: Shows current lock state (Locked/Unlocked) with icon indicator
3. **Toast Notifications**: Success/error feedback when toggling lock
4. **Employee Pages**: Warning alerts displayed when performances are locked
5. **UI Feedback**: Buttons disabled, warnings shown, lock status visible

---

## Backend Implementation

### 1. GlobalSettings Model

**File**: `server/src/models/GlobalSettings.ts`

```typescript
interface IGlobalSettings {
	_id?: string;
	performanceLocked: boolean;
	lastLockedBy?: IUser | string;
	lockedAt?: Date;
}
```

**Features**:

- Unique index constraint ensures only one settings document exists
- Tracks who locked performances and when
- Mongoose schema with timestamps

### 2. Global Settings Routes

**File**: `server/src/routes/global-settings.ts`

**Endpoints**:

- `GET /global-settings` - Retrieves lock status (public)
- `POST /global-settings/toggle-performance-lock` - Toggles lock (admin-only)

**Features**:

- Lazy initialization of settings document
- Admin-only protection for toggle endpoint
- Logging of admin actions
- Sets lastLockedBy and lockedAt on toggle

### 3. Performance Lock Middleware

**File**: `server/src/middleware/performanceLock.ts`

```typescript
export const checkPerformanceLocked = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>
```

**Features**:

- Returns HTTP 423 (Locked) status when performanceLocked is true
- Fail-open design: allows operation if check fails (for availability)
- Called before performance mutation operations

### 4. Middleware Integration

**Files Modified**:

- `server/src/routes/employees.ts`: Added to PUT route for employee updates
- `server/src/routes/employees-global.ts`: Added to DELETE /clear-performances route

---

## Frontend Implementation

### 1. Global Settings Hook

**File**: `client/src/hooks/useGlobalSettings.ts`

```typescript
export function useGlobalSettings() {
  const settings: IGlobalSettings | null;
  const loading: boolean;
  const error: string | null;

  const fetchSettings(): Promise<void>;
  const togglePerformanceLock(): Promise<void>;
  const refetch(): Promise<void>;
}
```

**Features**:

- Auto-fetches settings on mount
- Manages lock toggle with error handling
- Exposes refetch for manual updates

### 2. Type Definitions

**File**: `client/src/types/models.ts`

```typescript
interface IGlobalSettings {
	_id?: string;
	performanceLocked: boolean;
	lastLockedBy?: IUser | string;
	lockedAt?: Date | string;
}
```

### 3. API Endpoints

**File**: `client/src/const/endpoints.ts`

```typescript
GLOBAL_SETTINGS: "/global-settings";
TOGGLE_PERFORMANCE_LOCK: "/global-settings/toggle-performance-lock";
```

### 4. Global Admin Dashboard Integration

**File**: `client/src/pages/GlobalAdminDashboardPage.tsx`

**New Components**:

- Lock status indicator (icon + text: Locked/Unlocked)
- Toggle lock button (switches color/icon based on state)
- Lock confirmation dialog with countdown timer (5 seconds)
- Toast notifications for success/error feedback
- Disabled "Reset All Performances" button when locked

**Features**:

- Mirrors existing clear performances dialog pattern
- Countdown timer prevents accidental clicks
- Visual feedback with icons (LockIcon, LockOpenIcon)
- Color-coded buttons (error red when locked, success green when unlocked)

### 5. Employee Page Updates

**File**: `client/src/pages/EmployeePage.tsx`

**Changes**:

- Import useGlobalSettings hook
- Display warning alert when performances are locked
- Disable "Save Changes" button when locked
- Disable edit dialogs with lock message

### 6. Performance Dialog Updates

**File**: `client/src/components/dialogs/PerformanceDialog.tsx`

**Changes**:

- Add performanceLocked prop
- Display red alert when locked
- Pass saveDisabled prop to FormDialog
- Alert text: "Performance editing is currently locked by a global administrator"

### 7. Form Dialog Updates

**File**: `client/src/components/dialogs/FormDialog.tsx`

**Changes**:

- Add saveDisabled prop
- Disable save button when saveDisabled=true
- Works in conjunction with loading state

### 8. Performance Manager Updates

**File**: `client/src/components/PerformanceManager.tsx`

**Changes**:

- Add performanceLocked prop
- Pass to PerformanceDialog component
- Propagates lock status from parent

### 9. Performance Display Updates

**File**: `client/src/components/PerformanceDisplay.tsx`

**Changes**:

- Add locked prop
- Display warning alert when locked
- Alert text: "Performance records are currently locked. You cannot make changes at this time."

### 10. Province Employees Page Updates

**File**: `client/src/pages/ProvinceEmployeesPage.tsx`

**Changes**:

- Import useGlobalSettings hook
- Display lock status alert at top of page
- Alert only shown when lock is active

---

## UI/UX Features

### Dialogs and Confirmations

1. **Lock Confirmation Dialog**:

   - Title shows current action (Lock/Unlock)
   - Alert explains consequences
   - Lists affected actions
   - 5-second countdown before confirmation
   - Color-coded buttons

2. **Toast Notifications**:
   - Success: "Performance editing has been [locked/unlocked]..."
   - Error: Shows error message from server

### Visual Indicators

- **Lock Icon** (red): When performances are locked
- **Lock Open Icon** (green): When performances are unlocked
- **Disabled Buttons**: When lock is active
- **Alert Boxes**: Warning users of lock status
- **Status Chips**: Show locked/unlocked state

### Button States

- **Lock Button**: Contained red when locked, outlined green when unlocked
- **Reset Button**: Disabled when locked, disabled during clearing
- **Save Buttons**: Disabled when locked or no changes
- **Edit Buttons**: Disabled with alert message when locked

---

## API Contract

### Response Codes

- **200 OK**: Lock toggled successfully, performances reset
- **423 Locked**: Operation blocked due to performance lock
- **401 Unauthorized**: Missing authentication
- **403 Forbidden**: Not global admin

### Error Handling

- Middleware returns 423 with message: "Performance editing is currently locked"
- API endpoints return error details in response.data.error
- Frontend displays user-friendly error messages in toasts

---

## Database Schema

### GlobalSettings Collection

```json
{
  "_id": ObjectId,
  "performanceLocked": boolean,
  "lastLockedBy": ObjectId (reference to User),
  "lockedAt": Date,
  "createdAt": Date,
  "updatedAt": Date
}
```

**Constraints**:

- Unique index on collection (ensures only one document)
- lastLockedBy can be null initially
- lockedAt populated when lock is set

---

## Testing Scenarios

### Admin Lock Workflow

1. ✅ Admin clicks "Lock" button on Global Admin Dashboard
2. ✅ Confirmation dialog appears with countdown
3. ✅ After countdown, admin confirms lock
4. ✅ Toast shows success message
5. ✅ Lock status indicator changes to "Locked"
6. ✅ Reset button becomes disabled

### Employee Lock Workflow

1. ✅ Employee tries to edit performance
2. ✅ Alert appears: "Performance editing is currently locked"
3. ✅ Save button is disabled
4. ✅ Edit dialogs show lock message
5. ✅ Page shows warning at top

### Admin Unlock Workflow

1. ✅ Admin clicks "Unlock" button
2. ✅ Confirmation dialog appears
3. ✅ After countdown, admin confirms unlock
4. ✅ Toast shows success message
5. ✅ Lock status changes to "Unlocked"
6. ✅ Buttons are re-enabled

---

## Files Modified/Created

### Backend Files

- ✅ `server/src/models/GlobalSettings.ts` (CREATED)
- ✅ `server/src/routes/global-settings.ts` (CREATED)
- ✅ `server/src/middleware/performanceLock.ts` (CREATED)
- ✅ `server/src/routes/employees.ts` (MODIFIED)
- ✅ `server/src/routes/employees-global.ts` (MODIFIED)

### Frontend Files

- ✅ `client/src/hooks/useGlobalSettings.ts` (CREATED)
- ✅ `client/src/types/models.ts` (MODIFIED)
- ✅ `client/src/const/endpoints.ts` (MODIFIED)
- ✅ `client/src/pages/GlobalAdminDashboardPage.tsx` (MODIFIED)
- ✅ `client/src/pages/EmployeePage.tsx` (MODIFIED)
- ✅ `client/src/pages/ProvinceEmployeesPage.tsx` (MODIFIED)
- ✅ `client/src/components/dialogs/PerformanceDialog.tsx` (MODIFIED)
- ✅ `client/src/components/dialogs/FormDialog.tsx` (MODIFIED)
- ✅ `client/src/components/PerformanceManager.tsx` (MODIFIED)
- ✅ `client/src/components/PerformanceDisplay.tsx` (MODIFIED)

---

## Key Design Decisions

1. **Single Settings Document**: Uses unique index to ensure only one GlobalSettings record exists (avoids conflicts)

2. **HTTP 423 Status**: Uses HTTP 423 (Locked) status code for locked state (REST convention)

3. **Middleware Placement**: checkPerformanceLocked runs before route handlers to prevent unauthorized mutations

4. **Fail-Open Middleware**: If lock check fails, operation proceeds (availability over strict enforcement)

5. **Toast Notifications**: User-friendly feedback without page reload

6. **Countdown Timer**: Prevents accidental lock/unlock with 5-second delay

7. **Propagated Lock Status**: Lock status passed through component hierarchy (useGlobalSettings → pages → components)

8. **Visual Consistency**: Lock dialogs mirror existing clear performances dialog pattern

---

## Future Enhancements

1. Add audit log entries for lock/unlock actions
2. Show last locked by and time in dashboard
3. Add scheduled unlock feature (auto-unlock at specific time)
4. Send notifications to employees when lock is activated
5. Add lock history/logs view
6. Implement role-based lock permissions (department-specific locks)
