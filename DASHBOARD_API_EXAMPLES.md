# Dashboard API - Usage Examples

## Authentication

All endpoints require Global Admin role. Include credentials with requests:

```bash
curl -X GET http://localhost:3000/dashboard/overview \
  -H "Cookie: irc.sid=<session_id>" \
  -H "Content-Type: application/json"
```

---

## 1. Dashboard Overview Endpoint

### Request

```
GET /dashboard/overview
```

### Response

```json
{
	"success": true,
	"data": {
		"totalProvinces": 5,
		"totalEmployees": 245,
		"totalAdmins": 5,
		"employeeStatuses": {
			"active": 210,
			"inactive": 25,
			"onLeave": 10
		}
	},
	"message": "Dashboard overview retrieved successfully"
}
```

### Use Cases

- Display high-level system metrics
- Show summary cards on dashboard
- Quick health check of system

### Example Client Usage

```typescript
const { data: overview } = useDashboardOverview();

if (overview) {
	console.log(`Total employees: ${overview.totalEmployees}`);
	console.log(`Active: ${overview.employeeStatuses.active}`);
}
```

---

## 2. Analytics Endpoint

### Request

```
GET /dashboard/analytics
```

### Response

```json
{
	"success": true,
	"data": {
		"employees": {
			"totalCount": 245,
			"avgChildrenCount": 2.3,
			"maleCount": 180,
			"femaleCount": 65,
			"marriedCount": 198
		},
		"provinces": [
			{
				"_id": "507f1f77bcf86cd799439011",
				"name": "Province A",
				"employeeCount": 45
			},
			{
				"_id": "507f1f77bcf86cd799439012",
				"name": "Province B",
				"employeeCount": 38
			}
		],
		"performance": [
			{
				"_id": "active",
				"count": 210,
				"avgDailyPerformance": 82.5,
				"avgOvertimeHours": 4.2,
				"totalTruckDrivers": 45
			}
		]
	},
	"message": "Dashboard analytics retrieved successfully"
}
```

### Use Cases

- Visualize employee demographics
- Compare province sizes
- Analyze performance trends

### Example Client Usage

```typescript
const { data: analytics } = useDashboardAnalytics();

if (analytics) {
	const malePercentage =
		(analytics.employees.maleCount / analytics.employees.totalCount) * 100;
	console.log(`Male employees: ${malePercentage.toFixed(1)}%`);
}
```

---

## 3. Performance Summary Endpoint

### Request

```
GET /dashboard/performance-summary
```

### Response

```json
{
	"success": true,
	"data": {
		"byStatus": [
			{
				"_id": "active",
				"count": 210,
				"avgDailyPerformance": 82.5,
				"avgDailyLeave": 1.2,
				"avgSickLeave": 2.1,
				"avgAbsence": 0.5,
				"avgOvertime": 4.2,
				"totalShifts": 5280,
				"avgShiftDuration": 12
			},
			{
				"_id": "inactive",
				"count": 25,
				"avgDailyPerformance": 45.0,
				"avgDailyLeave": 0,
				"avgSickLeave": 3.5,
				"avgAbsence": 2.0,
				"avgOvertime": 0,
				"totalShifts": 0,
				"avgShiftDuration": 0
			}
		],
		"byRank": [
			{
				"_id": "Manager",
				"count": 12,
				"avgDailyPerformance": 88.5
			},
			{
				"_id": "Supervisor",
				"count": 35,
				"avgDailyPerformance": 85.2
			}
		],
		"byBranch": [
			{
				"_id": "Headquarters",
				"count": 65,
				"avgPerformance": 84.3
			},
			{
				"_id": "Branch A",
				"count": 52,
				"avgPerformance": 81.5
			}
		]
	},
	"message": "Performance summary retrieved successfully"
}
```

### Use Cases

- Analyze performance by employee status
- Compare rank-based productivity
- Evaluate branch performance
- Track leave patterns

### Example Client Usage

```typescript
const { data: summary } = usePerformanceSummary();

if (summary) {
	summary.byStatus.forEach((status) => {
		console.log(`${status._id}: ${status.count} employees`);
		console.log(`Average performance: ${status.avgDailyPerformance}`);
	});
}
```

---

## 4. Provinces Overview Endpoint

### Request

```
GET /dashboard/provinces-overview
```

### Response

```json
{
	"success": true,
	"data": [
		{
			"_id": "507f1f77bcf86cd799439011",
			"name": "Province A",
			"employeeCount": 45,
			"activeEmployeeCount": 42,
			"avgEmployeePerformance": 84.25,
			"admin": {
				"_id": "507f1f77bcf86cd799439111",
				"username": "admin_a"
			}
		},
		{
			"_id": "507f1f77bcf86cd799439012",
			"name": "Province B",
			"employeeCount": 38,
			"activeEmployeeCount": 35,
			"avgEmployeePerformance": 81.5,
			"admin": {
				"_id": "507f1f77bcf86cd799439112",
				"username": "admin_b"
			}
		}
	],
	"message": "Provinces overview retrieved successfully"
}
```

### Use Cases

- Display all provinces with metrics
- Admin assignment overview
- Performance comparison between provinces
- Employee distribution across regions

### Example Client Usage

```typescript
const { data: provinces } = useProvincesOverview();

if (provinces) {
	// Sort by performance
	const topProvinces = provinces.sort(
		(a, b) => b.avgEmployeePerformance - a.avgEmployeePerformance
	);

	console.log(`Top province: ${topProvinces[0].name}`);
}
```

---

## 5. Recent Activity Endpoint

### Request

```
GET /dashboard/recent-activity?limit=20
```

### Parameters

- `limit` (optional, default: 20, max: 100) - Number of recent activities to return

### Response

```json
{
	"success": true,
	"data": [
		{
			"_id": "607f1f77bcf86cd799439001",
			"basicInfo": {
				"firstName": "John",
				"lastName": "Doe"
			},
			"createdAt": "2024-12-20T10:15:00.000Z",
			"updatedAt": "2024-12-26T14:30:00.000Z",
			"province": {
				"_id": "507f1f77bcf86cd799439011",
				"name": "Province A"
			}
		},
		{
			"_id": "607f1f77bcf86cd799439002",
			"basicInfo": {
				"firstName": "Jane",
				"lastName": "Smith"
			},
			"createdAt": "2024-12-21T09:45:00.000Z",
			"updatedAt": "2024-12-26T13:20:00.000Z",
			"province": {
				"_id": "507f1f77bcf86cd799439012",
				"name": "Province B"
			}
		}
	],
	"message": "Recent activity retrieved successfully"
}
```

### Use Cases

- Activity feed on dashboard
- Track recent changes
- Monitor system activity
- Audit trail

### Example Client Usage

```typescript
const { data: activities, refetch } = useRecentActivity(10);

activities.forEach((activity) => {
	console.log(
		`${activity.basicInfo.firstName} ${activity.basicInfo.lastName} ` +
			`updated in ${activity.province.name}`
	);
	console.log(`Updated: ${new Date(activity.updatedAt).toLocaleString()}`);
});

// Refetch with different limit
setTimeout(() => refetch(), 30000); // Refresh every 30 seconds
```

---

## Error Responses

### Unauthorized (Not Global Admin)

```json
{
	"success": false,
	"error": "Unauthorized - Insufficient permissions",
	"message": "Only Global Admin can access this endpoint"
}
```

### Server Error

```json
{
	"success": false,
	"error": "Internal Server Error",
	"message": "Error details..."
}
```

---

## Request/Response Headers

### Request Headers (Required)

```
Content-Type: application/json
Cookie: irc.sid=<session_id>
```

### Response Headers

```
Content-Type: application/json
Set-Cookie: irc.sid=<updated_session_id>; Path=/; HttpOnly; SameSite=Lax
```

---

## Rate Limiting

Dashboard endpoints follow the global rate limit:

- 100 requests per 15 minutes per IP

## Caching Recommendations

- Overview: Cache 1-5 minutes (relatively stable)
- Analytics: Cache 5-10 minutes (can change frequently)
- Performance Summary: Cache 5-10 minutes
- Provinces Overview: Cache 5-10 minutes (admin changes are rare)
- Recent Activity: Cache 1-2 minutes (shows recent changes)

---

## Pagination Note

Currently, the `recent-activity` endpoint uses a `limit` parameter for simplification.
For large datasets, consider implementing offset-based pagination:

```typescript
// Future enhancement
GET /dashboard/recent-activity?limit=20&offset=40
```

---

## Testing with cURL

### Test Overview Endpoint

```bash
curl -X GET http://localhost:3000/dashboard/overview \
  -H "Cookie: irc.sid=your_session_id" \
  -H "Content-Type: application/json" | jq .
```

### Test Recent Activity with Custom Limit

```bash
curl -X GET "http://localhost:3000/dashboard/recent-activity?limit=5" \
  -H "Cookie: irc.sid=your_session_id" \
  -H "Content-Type: application/json" | jq .
```

---

## Integration Checklist

- [ ] Backend endpoints deployed and accessible
- [ ] Authentication verified (test with non-admin user)
- [ ] Database indexes created for aggregate queries
- [ ] Frontend components rendering without errors
- [ ] Data flowing correctly from API to components
- [ ] Error handling working for all endpoints
- [ ] Loading states showing appropriately
- [ ] Export functionality working
- [ ] Responsive design verified on mobile
- [ ] Performance acceptable with large datasets
