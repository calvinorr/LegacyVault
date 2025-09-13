# Frontend Specification

This is the frontend specification for the spec detailed in @.agent-os/specs/2025-09-12-renewal-reminder-system/spec.md

## Component Architecture

### RenewalSection Component
**Location:** `web/src/components/entries/RenewalSection.tsx`
**Purpose:** Embedded renewal management within entry forms
**Props:**
```typescript
interface RenewalSectionProps {
  entryType: string;
  renewalInfo: RenewalInfo | null;
  onRenewalChange: (renewalInfo: RenewalInfo) => void;
  isEditing: boolean;
  categoryId?: string;
}

interface RenewalInfo {
  startDate: Date | null;
  endDate: Date | null;
  renewalCycle: 'monthly' | 'quarterly' | 'annually' | 'custom';
  isRenewalTracked: boolean;
  reminderSettings: {
    reminderDays: number[];
    emailEnabled: boolean;
  };
}
```

**Features:**
- Smart visibility based on entry category (show for Insurance, Subscriptions)
- Date pickers with UK date format (DD/MM/YYYY)
- Automatic renewal cycle detection based on date range
- Reminder preference toggles with visual feedback
- Validation for logical date ranges and renewal cycles

### RenewalDatePicker Component
**Location:** `web/src/components/ui/RenewalDatePicker.tsx`
**Purpose:** UK-focused date picker with renewal logic
**Props:**
```typescript
interface RenewalDatePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onCycleDetected: (cycle: RenewalCycle) => void;
  minDate?: Date;
  maxDate?: Date;
}
```

**Features:**
- UK date format display and input validation
- Visual connection between start and end dates
- Automatic cycle calculation (monthly = 28-35 days, annually = 360-370 days)
- Warnings for past dates or illogical ranges
- Integration with existing premium design system

### ReminderSettings Component
**Location:** `web/src/components/renewals/ReminderSettings.tsx`
**Purpose:** Configure notification preferences per entry
**Props:**
```typescript
interface ReminderSettingsProps {
  settings: ReminderSettings;
  onChange: (settings: ReminderSettings) => void;
  renewalCycle: RenewalCycle;
  isGlobalDefault?: boolean;
}

interface ReminderSettings {
  reminderDays: number[];
  emailEnabled: boolean;
  customMessage?: string;
}
```

**Features:**
- Toggle switches for enabling email reminders
- Multiple reminder day selection (checkboxes for 1, 7, 14, 30 days)
- Cycle-appropriate suggestions (monthly subscriptions vs annual insurance)
- Preview of when reminders would be sent
- Link to global reminder preferences

### RenewalDashboard Component
**Location:** `web/src/components/renewals/RenewalDashboard.tsx`
**Purpose:** Central view of all upcoming renewals
**Features:**
- Timeline view of renewals by month
- Color coding for urgency (overdue=red, <7days=amber, >7days=green)
- Filter by category, overdue status, reminder enabled
- Bulk actions: mark as handled, snooze, edit
- Quick statistics cards (overdue count, this month, next month)

### RenewalCard Component
**Location:** `web/src/components/renewals/RenewalCard.tsx`
**Purpose:** Individual renewal item display
**Props:**
```typescript
interface RenewalCardProps {
  renewal: UpcomingRenewal;
  onAction: (action: RenewalAction) => void;
  onEdit: () => void;
  compact?: boolean;
}

interface UpcomingRenewal {
  entryId: string;
  title: string;
  provider: string;
  category: string;
  renewalDate: Date;
  daysUntilRenewal: number;
  isOverdue: boolean;
  lastReminderSent: Date | null;
}
```

**Features:**
- Swiss spa aesthetic consistent with existing design
- Action buttons for Handle/Snooze/Dismiss
- Visual urgency indicators (border colors, icons)
- Provider logos or category icons
- Expandable details view

## Page Components

### RenewalsOverviewPage
**Route:** `/renewals`
**Purpose:** Main renewals dashboard with navigation
**Sections:**
- Summary statistics cards
- Upcoming renewals timeline
- Filter and search controls
- Quick add renewal entry button
- Link to reminder preferences

### ReminderPreferencesPage
**Route:** `/settings/reminders`
**Purpose:** Global reminder preference management
**Features:**
- Default reminder timing settings
- Email notification master toggle
- Category-specific overrides
- Time of day and timezone settings
- Test reminder functionality

## Integration Points

### Entry Form Integration
**Modified Files:**
- `web/src/components/entries/AddEntryModal.tsx`
- `web/src/components/entries/EditEntryModal.tsx`

**Changes:**
- Conditional rendering of RenewalSection based on entry category
- Form validation to include renewal date logic
- Submission handling for renewal data
- Success messages mentioning reminder setup

### Navigation Integration
**Modified Files:**
- `web/src/components/layout/Navigation.tsx`
- `web/src/components/layout/MobileNavigation.tsx`

**Changes:**
- Add "Renewals" navigation item with urgency badge
- Urgent notification indicator for overdue renewals
- Integration with existing notification system

### Dashboard Integration
**Modified Files:**
- `web/src/pages/Dashboard.tsx`

**Changes:**
- "Upcoming Renewals" widget showing next 3-5 renewals
- Quick stats integration (overdue count in summary cards)
- Link to full renewals page

## State Management

### Renewal Contexts
**Location:** `web/src/contexts/RenewalContext.tsx`
**Purpose:** Global state for renewal data and preferences

```typescript
interface RenewalContextValue {
  upcomingRenewals: UpcomingRenewal[];
  reminderPreferences: ReminderPreferences;
  isLoading: boolean;
  error: string | null;
  refreshRenewals: () => Promise<void>;
  updateReminderPreferences: (prefs: ReminderPreferences) => Promise<void>;
  recordRenewalAction: (entryId: string, action: RenewalAction) => Promise<void>;
}
```

### Custom Hooks
**Location:** `web/src/hooks/useRenewals.ts`
**Purpose:** Renewal data fetching and management

```typescript
export function useRenewals() {
  const [renewals, setRenewals] = useState<UpcomingRenewal[]>([]);
  const [loading, setLoading] = useState(true);
  
  const refreshRenewals = useCallback(async () => {
    // Fetch upcoming renewals from API
  }, []);
  
  return { renewals, loading, refreshRenewals };
}
```

**Location:** `web/src/hooks/useRenewalReminders.ts`
**Purpose:** Reminder preference management

## Styling and Design

### Theme Integration
- Consistent with existing Swiss spa aesthetic
- Use Inter font family with appropriate weights
- Color palette: sage green (#9BA99E) for success, warm amber (#D97749) for warnings
- Lucide React icons: Calendar, Bell, Clock, AlertCircle

### Responsive Design
- Mobile-first approach matching existing components
- Touch-friendly date pickers and action buttons
- Collapsible sections for smaller screens
- Accessible color contrast and keyboard navigation

### Animation and Feedback
- Subtle fade-in animations for renewal cards
- Success animations for action confirmations
- Loading states with skeleton screens
- Toast notifications for reminder actions

## UK-Specific Considerations

### Date Formatting
- All dates displayed as DD/MM/YYYY format
- Relative dates: "in 5 days", "2 weeks ago"
- UK holidays awareness for reminder scheduling
- British English terminology throughout

### Renewal Patterns
- Insurance: typically annual (March/April common)
- TV Licence: annual (expires end of month)
- Subscriptions: monthly or annual
- Council Tax: annual (April to March)
- Utilities: varies but often quarterly or monthly

### Content and Messaging
- "Renewal" rather than "expiration" 
- "Policy" for insurance, "subscription" for services
- UK provider names and terminology
- Help text explaining UK-specific renewal timing patterns