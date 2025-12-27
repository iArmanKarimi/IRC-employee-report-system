# Performance Lock Feature - Quick Reference Guide

## User Workflows

### Global Admin: Locking Performance Editing

1. Navigate to **Global Admin Dashboard** (Provinces page)
2. Click **Lock** button (green outline button with LockOpenIcon)
3. Confirmation dialog appears:
   - Shows consequences of lock
   - Lists what employees can't do
   - 5-second countdown timer
4. After countdown, click **Confirm Lock**
5. Toast notification confirms success
6. Lock status indicator changes to "Locked" (red icon)
7. **Reset All Performances** button becomes disabled

### Global Admin: Unlocking Performance Editing

1. On **Global Admin Dashboard**, click **Unlock** button (red contained button with LockIcon)
2. Confirmation dialog appears:
   - Shows what will be re-enabled
   - 5-second countdown timer
3. After countdown, click **Confirm Unlock**
4. Toast notification confirms success
5. Lock status changes to "Unlocked" (green icon)
6. All buttons are re-enabled

### Employee: Attempting to Edit When Locked

1. Employee navigates to their **Employee Profile** page
2. Sees alert at top: "Performance records are currently locked..."
3. **Save Changes** button is disabled
4. If employee clicks **Edit** button for performance, dialog shows:
   - Red alert: "Performance editing is currently locked by a global administrator"
   - **Save** button is disabled in dialog
5. Employee cannot make any changes

### Employee: Viewing Lock Status (Province Employees Page)

1. Employee navigates to **Province Employees** page
2. If lock is active, sees alert at top of page:
   - "Performance editing is currently locked..."
3. All View buttons work normally
4. Edit dialogs are disabled with lock message

---

## Component Integration Points

### Using Performance Lock in New Components

**To check lock status:**

```typescript
import { useGlobalSettings } from "../hooks/useGlobalSettings";

function MyComponent() {
	const { settings } = useGlobalSettings();

	if (settings?.performanceLocked) {
		// Show locked state
	}
}
```

**To toggle lock (admin only):**

```typescript
const { togglePerformanceLock } = useGlobalSettings();
await togglePerformanceLock(); // Toggles lock state
```

**To pass lock status to performance dialog:**

```typescript
<PerformanceDialog
	performanceLocked={settings?.performanceLocked}
	// ... other props
/>
```

**To disable buttons when locked:**

```typescript
<Button disabled={settings?.performanceLocked}>Edit Performance</Button>
```

---

## API Reference

### Endpoints

#### GET /global-settings

**Access**: Public (no authentication required)

**Response**:

```json
{
	"_id": "ObjectId",
	"performanceLocked": true,
	"lastLockedBy": "user_id",
	"lockedAt": "2024-01-15T10:30:00Z"
}
```

#### POST /global-settings/toggle-performance-lock

**Access**: Global Admin only  
**Auth**: Required (session cookie)

**Request**: No body required

**Response**: Same as GET /global-settings

**Error Codes**:

- **401 Unauthorized**: Not authenticated
- **403 Forbidden**: Not a global admin
- **500 Internal Error**: Server error

---

## HTTP Status Codes

| Code | Meaning      | Example                               |
| ---- | ------------ | ------------------------------------- |
| 200  | Success      | Lock toggled, settings fetched        |
| 401  | Unauthorized | Missing authentication                |
| 403  | Forbidden    | Not a global admin                    |
| 423  | Locked       | Performance locked, operation blocked |
| 500  | Server Error | Database error                        |

---

## Database Schema

### GlobalSettings Collection

```json
{
  "_id": ObjectId("..."),
  "performanceLocked": boolean,
  "lastLockedBy": ObjectId("...") or null,
  "lockedAt": Date or null,
  "createdAt": Date,
  "updatedAt": Date
}
```

**Indexes**:

- Unique index on entire collection (ensures only 1 document)

---

## Configuration

No environment variables required. Lock feature works out of the box after:

1. Server: Backend routes and middleware are auto-integrated in app.ts
2. Client: useGlobalSettings hook can be imported and used immediately

---

## Troubleshooting

### Lock Status Not Updating

- Refresh page to fetch latest settings
- Check browser console for API errors
- Ensure global-settings endpoint is accessible

### Buttons Still Enabled When Locked

- Verify `performanceLocked` prop is being passed correctly
- Check that `settings?.performanceLocked` is true in component state
- Ensure component is using latest IGlobalSettings type

### Admin Can't Toggle Lock

- Verify user has GLOBAL_ADMIN role
- Check browser console for 403 Forbidden error
- Ensure session cookie is present

### Lock Dialog Countdown Not Working

- Verify countdown state is initialized in component
- Check useEffect is properly set up with dependencies
- Ensure setCountdown updates state correctly

---

## Feature Flags / Environment Variables

None required. Feature is always available.

## Monitoring

### Log Messages Generated

```
Global admin [user_id] locked performance records
Global admin [user_id] unlocked performance records
```

Check server logs for admin lock/unlock actions.

---

## Future Enhancements

1. **Audit Trail**: Add full history of lock/unlock actions
2. **Scheduled Unlock**: Set auto-unlock time when locking
3. **Department-Level Locks**: Lock specific departments only
4. **Lock Notification**: Send emails to employees when locked
5. **Lock Reason**: Store reason for lock (maintenance, audit, etc.)
