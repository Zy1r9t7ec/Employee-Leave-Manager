# Frontend Component Breakdown

Here is a map of every React component you will build, organized by page.

---

## Login Page (`/login`)

The entry point for all users.

```
LoginPage
  ├── LoginForm
  │   ├── Email Input Field
  │   ├── Password Input Field
  │   ├── Submit Button
  │   └── Validation Messages
  └── LoadingSpinner (during API call)
```

**Responsibilities:**
- Collect email and password
- Call `/api/auth/login` endpoint
- Store JWT token in localStorage
- Redirect to appropriate dashboard based on user role
- Show error messages for invalid credentials

---

## Employee Dashboard (`/dashboard`)

What employees see after login. They can submit leave and view history.

```
EmployeeDashboard
  ├── Navbar
  │   ├── User Name & Profile Icon
  │   └── Logout Button
  ├── Sidebar
  │   ├── Dashboard Link (active)
  │   ├── My Leave History
  │   ├── Profile Settings
  │   └── Help/Support
  ├── LeaveBalanceSummary
  │   ├── Annual Leave Card (remaining/total)
  │   ├── Sick Leave Card (remaining/total)
  │   └── Unpaid Leave Card (used count)
  ├── NewLeaveRequestButton (primary action)
  ├── LeaveRequestModal (opens on button click)
  │   ├── LeaveTypeSelector (dropdown)
  │   ├── DateRangePicker (start & end dates)
  │   ├── ReasonInput (text area, optional)
  │   ├── AvailableBalanceDisplay
  │   ├── DurationCalculator (auto-calculates days)
  │   ├── SubmitButton
  │   └── CancelButton
  └── MyLeaveHistory (table/card list)
      ├── LeaveRequestRow (per request)
      │   ├── Leave Type Badge (color-coded)
      │   ├── Date Range Display
      │   ├── Duration Display
      │   ├── Status Badge (Pending/Approved/Rejected)
      │   ├── Submitted Date
      │   └── Cancel Button (if Pending)
      └── Pagination (if many requests)
```

**Key Features:**
- Display current year leave balances
- Submit new leave requests with validation
- View all personal leave requests with status
- Cancel pending requests
- Show success/error toasts for actions

---

## Manager Dashboard (`/manager`)

Managers review and act on pending leave requests from their team.

```
ManagerDashboard
  ├── Navbar (same as employee)
  ├── Sidebar
  │   ├── Dashboard Link (active)
  │   ├── My Leaves
  │   ├── Team Leaves (new for managers)
  │   ├── Reports (if needed)
  │   └── Settings
  ├── PendingRequestsTable
  │   ├── Filters
  │   │   ├── Filter by Date Range
  │   │   ├── Filter by Employee
  │   │   └── Sort Options
  │   ├── EmployeeLeaveRow (per request)
  │   │   ├── Employee Name & Avatar
  │   │   ├── Department
  │   │   ├── Leave Type
  │   │   ├── Date Range
  │   │   ├── Duration
  │   │   ├── Reason (if provided)
  │   │   ├── Submitted Date
  │   │   ├── Approve Button
  │   │   └── Reject Button
  │   └── Empty State (if no pending requests)
  ├── ApprovalModal (opens when Approve clicked)
  │   ├── Request Summary (read-only)
  │   ├── Optional Comment Field
  │   ├── Confirm Button
  │   └── Cancel Button
  ├── RejectionModal (opens when Reject clicked)
  │   ├── Request Summary (read-only)
  │   ├── Required Comment Field
  │   ├── Confirm Button
  │   └── Cancel Button
  └── StatusMessage (shows success/error after action)
```

**Key Features:**
- View all pending requests for team members
- See full leave request details
- Approve with optional comments
- Reject with required comment
- Real-time list updates after action
- Filter and sort pending requests

---

## HR Admin Panel (`/admin`)

The most feature-rich dashboard with tabs for different admin tasks.

```
AdminPanel
  ├── Navbar (same as employee)
  ├── Sidebar
  │   ├── Dashboard (admin home)
  │   ├── Calendar View (active tab selector)
  │   ├── Balance Management
  │   ├── Reports
  │   ├── User Management
  │   └── Settings
  │
  ├── TabNavigation
  │   ├── Tab 1: Calendar (active default)
  │   ├── Tab 2: Balances
  │   └── Tab 3: Reports
  │
  ├─── TAB 1: Company Leave Calendar ───────────────
  │   ├── MonthYearSelector (navigate months)
  │   ├── LeaveCalendarGrid
  │   │   ├── CalendarHeader (days of week)
  │   │   └── CalendarCells (with leave blocks)
  │   │       └── LeaveBlock (colored by type)
  │   ├── CalendarFilters
  │   │   ├── Department Filter (dropdown)
  │   │   ├── Leave Type Filter (multi-select)
  │   │   ├── Employee Filter (search/select)
  │   │   └── Apply Filters Button
  │   ├── LegendDisplay (color coding guide)
  │   └── ExportButton (export calendar as PDF/Excel)
  │
  ├─── TAB 2: Leave Balance Tracker ──────────────
  │   ├── SearchBar (find employee)
  │   ├── SortOptions (by name, department, etc.)
  │   ├── BalanceTable
  │   │   ├── BalanceTableHeader (column names)
  │   │   └── BalanceRow (per employee)
  │   │       ├── Employee Name & ID
  │   │       ├── Department
  │   │       ├── Annual (total/used/remaining)
  │   │       ├── Sick (total/used/remaining)
  │   │       ├── Unpaid (used)
  │   │       ├── Edit Button (pencil icon)
  │   │       └── View History Button
  │   ├── EditBalanceModal (opens on Edit)
  │   │   ├── Annual Balance Inputs
  │   │   ├── Sick Balance Inputs
  │   │   ├── Reason/Notes Field
  │   │   ├── Save Button
  │   │   └── Cancel Button
  │   ├── BulkActionsBar
  │   │   ├── Select All Checkbox
  │   │   ├── Reset Balances Button (for new year)
  │   │   └── Export Button
  │   └── Pagination
  │
  ├─── TAB 3: Report Generator ──────────────────
  │   ├── ReportTypeSelector
  │   │   ├── Monthly Utilisation (selected)
  │   │   └── Departmental Summary (future)
  │   ├── MonthYearPicker
  │   │   ├── Month Selector (dropdown)
  │   │   └── Year Selector (dropdown)
  │   ├── GenerateReportButton (primary)
  │   ├── LoadingSpinner (during generation)
  │   ├── PreviewPane (if report cached)
  │   │   ├── Embedded Report HTML
  │   │   ├── Print Button
  │   │   └── Download Button
  │   └── PreviousReports (list of past generated reports)
  │
  └── GlobalAdminSettings
      ├── Leave Type Management (modal)
      ├── Public Holiday Management (modal)
      └── System Configuration
```

**Key Features:**
- Visual calendar of all company leaves
- Real-time leave balance tracking
- Edit employee balances with audit trail
- Generate and view monthly reports
- Filter and search capabilities
- Export data to CSV/PDF

---

## Shared / Reusable Components

These components are used across multiple pages:

```
Navbar
├── Logo/Brand
├── Current Page Title
├── User Info
│   ├── User Name
│   ├── User Role Badge
│   └── Profile Dropdown
│       ├── Profile Link
│       ├── Settings Link
│       └── Logout Link
└── Notification Bell (if implementing notifications)

Sidebar
├── Navigation Links (role-specific)
├── Active Link Indicator
├── Collapse/Expand Toggle (on mobile)
└── User Info Mini Card

StatusBadge (status indicator)
├── Pending (yellow)
├── Approved (green)
├── Rejected (red)
└── Cancelled (gray)

LeaveTypeBadge (leave type indicator)
├── Annual (blue)
├── Sick (orange)
└── Unpaid (gray)

LoadingSpinner
├── Animated Spinner Icon
└── Optional Loading Text

ErrorMessage
├── Error Icon
├── Error Text
└── Optional Retry Button

ConfirmDialog (reusable modal)
├── Title
├── Message
├── Confirm Button
├── Cancel Button
└── Optional Warning/Danger Styling

Toast (notification)
├── Success (green)
├── Error (red)
├── Info (blue)
├── Warning (orange)
├── Auto-dismiss after 3-5 seconds
└── Close Button

DateRangePicker
├── Start Date Input
├── End Date Input
├── Calendar Popup
└── Validation Messages

EmployeeSelector
├── Search Box
├── Dropdown List
├── Avatar & Name
└── Selected Badge

DepartmentFilter
├── Checkboxes or Dropdown
├── Select All / Clear All
└── Applied Count Badge
```

---

## Component State Management

### Using React Context for Global State
```
AuthContext
├── currentUser
├── token
├── loading
├── login(email, password)
├── logout()
└── updateUser()

LeaveContext (optional, for shared leave data)
├── leaves
├── balances
├── filters
├── fetchLeaves()
├── submitLeave()
└── clearFilters()
```

### Local State Management (useState)
Each page/component manages its own local state:
- Form inputs (email, password, dates)
- Modal open/close
- Filters and sort options
- Loading states for API calls
- Temporary data before save

---

## Component Library Recommendations

For faster development, use pre-built component libraries:

- **Material-UI** or **Chakra UI** — pre-built components (buttons, inputs, modals)
- **React Big Calendar** — calendar views (excellent for leave calendar)
- **React Table / TanStack Table** — advanced tables with sorting/filtering
- **React Hook Form** — form state management (validation, error handling)
- **Axios** — HTTP client for API calls
- **date-fns** or **dayjs** — date formatting and calculations

