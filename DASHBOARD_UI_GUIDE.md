# Global Admin Dashboard - Visual Guide

## Dashboard Layout

### Overview Section (Always Visible)

Four stat cards showing:

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ 📍 Provinces    │ 👥 Employees    │ ✓ Active        │ 👤 Admins       │
│ [Count]         │ [Count]         │ [Count] [%]     │ [Count]         │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### Tab Navigation

```
┌─ Employee Distribution ─────────────────────┐
├─ Performance Analysis                       │
├─ All Provinces                              │
└─ Recent Activity                            │
```

---

## Tab 1: Employee Distribution

### Left Column (2/3 width)

**Employee Distribution by Province**

- Bar chart showing employee count per province
- Sorted by count (descending)
- Visual progress bars for comparison

### Right Column (1/3 width)

**Employee Demographics Card**

- Total employees count
- Gender split (Male/Female)
- Married count
- Average children per employee

---

## Tab 2: Performance Analysis

### Top Section

**Performance by Status** (1/2 width)

- Active/Inactive/On Leave breakdown
- Employee count per status
- Average performance score
- Average overtime hours

**Top Ranks** (1/2 width)

- 5 highest ranks by employee count
- Count and average performance

### Bottom Section

**Top Branches** (1/2 width)

- 5 highest branches by employee count
- Count and average performance

**Leave Summary** (1/2 width)

- Daily leave average
- Sick leave average
- Absence average
- Grouped by status

---

## Tab 3: All Provinces

### Action Bar

- "Export All Employees" button (downloads Excel)

### Provinces Overview Table

```
┌──────────────┬──────────┬────────┬─────────────┬───────────┐
│ Province     │ Total    │ Active │ Avg Perf.   │ Admin     │
├──────────────┼──────────┼────────┼─────────────┼───────────┤
│ Province A   │ 45       │ 40     │ 85.2%       │ admin_a   │
│ Province B   │ 32       │ 28     │ 78.5%       │ admin_b   │
│ ...          │ ...      │ ...    │ ...         │ ...       │
└──────────────┴──────────┴────────┴─────────────┴───────────┘
```

### Quick Access Grid

Cards showing province names with images/avatars

- Click to navigate to province employees
- Responsive grid (4-8 columns based on screen size)

---

## Tab 4: Recent Activity

### Recent Updates Table

```
┌──────────────────┬──────────────┬──────────────────────┬──────────────────────┐
│ Employee Name    │ Province     │ Last Updated         │ Created              │
├──────────────────┼──────────────┼──────────────────────┼──────────────────────┤
│ John Doe         │ Province A   │ Dec 26, 2024 2:30 PM │ Dec 20, 2024 10:15AM │
│ Jane Smith       │ Province B   │ Dec 26, 2024 1:45 PM │ Dec 21, 2024 3:20 PM │
│ ...              │ ...          │ ...                  │ ...                  │
└──────────────────┴──────────────┴──────────────────────┴──────────────────────┘
```

- Shows 15 most recent updates (configurable)
- Timestamps formatted for readability

---

## Color Coding

| Element         | Color      | Meaning                |
| --------------- | ---------- | ---------------------- |
| Primary Card    | Blue       | Default/Primary metric |
| Success Card    | Green      | Active/Positive status |
| Info Card       | Light Blue | Secondary info         |
| Warning Card    | Orange     | Alert/Caution          |
| Chips - Success | Green      | Active status          |
| Chips - Warning | Orange     | On leave status        |
| Chips - Error   | Red        | Inactive status        |

---

## Responsive Breakpoints

| Breakpoint   | Stat Cards Layout | Tab Content       |
| ------------ | ----------------- | ----------------- |
| Mobile (xs)  | 1 column          | Full width        |
| Tablet (sm)  | 2 columns         | Full width        |
| Tablet (md)  | 3 columns         | 2-column grid     |
| Desktop (lg) | 4 columns         | Multi-column grid |

---

## Data Loading States

- **Initial Load**: LoadingView with spinner
- **Tab Content Loading**: Individual component loading indicators
- **Error States**: ErrorView with retry button
- **Empty States**: "No data available" message

---

## Key Interactions

1. **Export Button**: Downloads all employees as Excel file
2. **Tab Navigation**: Switches between different analysis views
3. **Province Cards**: Click to navigate to province employee list
4. **Status Indicators**: Color-coded for quick visual reference
5. **Refetch**: Each component can independently refresh its data

---

## Performance Considerations

- Data fetched on page load, not real-time
- Implement refetch buttons in detailed views
- Consider adding pagination for large datasets
- Cache employee data to reduce server load

---

## Accessibility Features

- Semantic HTML structure
- Color not the only indicator (icons, text labels used)
- Keyboard navigation support (Material-UI components)
- ARIA labels on icon-only buttons
- Table headers properly marked with `<strong>`
