# Component Specifications

This is the component specification for the spec detailed in @.agent-os/specs/2025-09-11-premium-design-transformation/spec.md

> Created: 2025-09-11
> Version: 1.0.0

## Dashboard Components

### Dashboard Header
**Current Issues**: Debug information visible, inconsistent spacing
**Target Design**:
- Clean header with app name "LegacyLock" in stone-800
- Subtitle "Financial Vault" in stone-500
- User avatar and menu in top-right with proper spacing
- Remove all debug elements and temporary text
- Implement consistent 24px vertical padding

```tsx
// Premium Header Structure
<header className="bg-white border-b border-stone-200 px-6 py-6">
  <div className="flex items-center justify-between max-w-7xl mx-auto">
    <div>
      <h1 className="text-2xl font-semibold text-stone-800">LegacyLock</h1>
      <p className="text-sm text-stone-500 mt-1">Financial Vault</p>
    </div>
    <UserMenu />
  </div>
</header>
```

### Dashboard Stats Cards
**Current Issues**: Basic styling, emoji usage, inconsistent spacing
**Target Design**:
- Premium card design with subtle shadows
- Replace emoji icons with Lucide React icons
- Consistent padding and border radius
- Sophisticated color scheme
- Proper typography hierarchy

```tsx
// Premium Stats Card
<div className="bg-white rounded-lg border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-150">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-stone-500 uppercase tracking-wide">Total Entries</p>
      <p className="text-3xl font-semibold text-stone-800 mt-2">{count}</p>
    </div>
    <div className="p-3 bg-stone-50 rounded-full">
      <FileText className="h-8 w-8 text-stone-600" strokeWidth={1.5} />
    </div>
  </div>
</div>
```

### Dashboard Quick Actions
**Current Issues**: Button styling inconsistent, emoji usage
**Target Design**:
- Premium button styling with consistent variants
- Lucide React icons instead of emojis
- Proper spacing and hover states
- Sophisticated color transitions

```tsx
// Premium Quick Action Button
<button className="flex items-center gap-3 w-full p-4 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-all duration-150 text-left group">
  <div className="p-2 bg-stone-100 rounded-md group-hover:bg-stone-200 transition-colors duration-150">
    <Plus className="h-5 w-5 text-stone-600" strokeWidth={1.5} />
  </div>
  <div>
    <p className="font-medium text-stone-800">Add New Entry</p>
    <p className="text-sm text-stone-500">Create a new vault entry</p>
  </div>
</button>
```

## Form Components

### Input Fields
**Current Issues**: Basic browser styling, inconsistent appearance
**Target Design**:
- Premium input styling with focus states
- Consistent padding and border radius
- Sophisticated color transitions
- Proper label and error state styling

```tsx
// Premium Input Component
<div className="space-y-2">
  <label className="block text-sm font-medium text-stone-700">
    Account Name
  </label>
  <input
    type="text"
    className="w-full px-4 py-3 border border-stone-200 rounded-md focus:ring-2 focus:ring-stone-400 focus:border-stone-400 bg-white placeholder-stone-400 text-stone-800 transition-all duration-150"
    placeholder="Enter account name"
  />
</div>
```

### Select Dropdowns
**Current Issues**: Basic browser styling, poor UX
**Target Design**:
- Custom styled select with premium appearance
- Smooth dropdown animations
- Proper hover and focus states
- Lucide React chevron icons

```tsx
// Premium Select Component
<div className="relative">
  <select className="w-full px-4 py-3 pr-10 border border-stone-200 rounded-md focus:ring-2 focus:ring-stone-400 focus:border-stone-400 bg-white text-stone-800 appearance-none cursor-pointer transition-all duration-150">
    <option>Select category</option>
  </select>
  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400 pointer-events-none" strokeWidth={1.5} />
</div>
```

### Buttons
**Current Issues**: Inconsistent styling, basic appearance
**Target Design**:
- Premium button variants following design system
- Proper hover and active states
- Consistent sizing and padding
- Subtle shadow and transition effects

```tsx
// Primary Button
<button className="px-6 py-3 bg-stone-800 text-white font-medium rounded-md hover:bg-stone-900 focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 transition-all duration-150 shadow-sm hover:shadow-md">
  Save Entry
</button>

// Secondary Button
<button className="px-6 py-3 bg-stone-100 text-stone-700 font-medium rounded-md hover:bg-stone-200 focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 transition-all duration-150 border border-stone-200">
  Cancel
</button>
```

## Navigation Components

### Sidebar Navigation
**Current Issues**: Basic styling, emoji usage in menu items
**Target Design**:
- Premium sidebar with sophisticated spacing
- Lucide React icons for all menu items
- Proper active and hover states
- Elegant typography and colors

```tsx
// Premium Navigation Item
<a
  href="/dashboard"
  className="flex items-center gap-3 px-4 py-3 text-stone-600 hover:text-stone-800 hover:bg-stone-50 rounded-md transition-all duration-150 group"
>
  <Home className="h-5 w-5 text-stone-500 group-hover:text-stone-700" strokeWidth={1.5} />
  <span className="font-medium">Dashboard</span>
</a>
```

### Breadcrumbs
**Current Issues**: Basic or missing breadcrumb navigation
**Target Design**:
- Elegant breadcrumb styling with proper separators
- Hover states for clickable items
- Consistent typography and spacing

```tsx
// Premium Breadcrumb
<nav className="flex items-center space-x-2 text-sm text-stone-500 mb-6">
  <a href="/dashboard" className="hover:text-stone-700 transition-colors duration-150">Dashboard</a>
  <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
  <span className="text-stone-800 font-medium">Bank Import</span>
</nav>
```

## Modal Components

### Modal Container
**Current Issues**: Basic modal styling, harsh edges
**Target Design**:
- Premium modal with sophisticated backdrop
- Smooth animations and transitions
- Proper spacing and typography
- Elegant close button styling

```tsx
// Premium Modal
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
  <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    <div className="flex items-center justify-between p-6 border-b border-stone-200">
      <h2 className="text-xl font-semibold text-stone-800">Create New Entry</h2>
      <button className="p-2 hover:bg-stone-100 rounded-full transition-colors duration-150">
        <X className="h-5 w-5 text-stone-500" strokeWidth={1.5} />
      </button>
    </div>
    <div className="p-6">
      {/* Modal content */}
    </div>
  </div>
</div>
```

## Table Components

### Data Tables
**Current Issues**: Basic table styling, poor visual hierarchy
**Target Design**:
- Premium table with sophisticated styling
- Proper alternating row colors
- Elegant header styling
- Hover states and selection indicators

```tsx
// Premium Table
<div className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-sm">
  <table className="w-full">
    <thead className="bg-stone-50 border-b border-stone-200">
      <tr>
        <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
          Date
        </th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
          Description
        </th>
        <th className="px-6 py-4 text-right text-xs font-semibold text-stone-600 uppercase tracking-wider">
          Amount
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-stone-200">
      <tr className="hover:bg-stone-50 transition-colors duration-150">
        <td className="px-6 py-4 text-sm text-stone-800">01/09/2025</td>
        <td className="px-6 py-4 text-sm text-stone-800">Transaction description</td>
        <td className="px-6 py-4 text-sm text-stone-800 text-right font-medium">£123.45</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Card Components

### Entry Cards
**Current Issues**: Basic card styling, emoji usage, poor spacing
**Target Design**:
- Premium card design with sophisticated shadows
- Lucide React icons for categories
- Proper typography hierarchy
- Elegant hover states

```tsx
// Premium Entry Card
<div className="bg-white rounded-lg border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all duration-150 group">
  <div className="flex items-start justify-between">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-stone-100 rounded-full group-hover:bg-stone-200 transition-colors duration-150">
        <CreditCard className="h-6 w-6 text-stone-600" strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="font-semibold text-stone-800 text-lg">HSBC Current Account</h3>
        <p className="text-stone-500 text-sm mt-1">Personal Banking</p>
      </div>
    </div>
    <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-stone-100 rounded-full transition-all duration-150">
      <MoreHorizontal className="h-5 w-5 text-stone-500" strokeWidth={1.5} />
    </button>
  </div>
  
  <div className="mt-4 pt-4 border-t border-stone-100">
    <div className="flex items-center justify-between text-sm">
      <span className="text-stone-500">Sort Code:</span>
      <span className="font-mono text-stone-800">40-12-34</span>
    </div>
    <div className="flex items-center justify-between text-sm mt-2">
      <span className="text-stone-500">Account Number:</span>
      <span className="font-mono text-stone-800">••••••••1234</span>
    </div>
  </div>
</div>
```

## Status Components

### Loading States
**Current Issues**: Basic or missing loading indicators
**Target Design**:
- Elegant loading animations
- Consistent spinner styling
- Proper skeleton loading for content

```tsx
// Premium Loading Spinner
<div className="flex items-center justify-center p-8">
  <div className="animate-spin rounded-full h-8 w-8 border-2 border-stone-200 border-t-stone-600"></div>
</div>

// Premium Skeleton Loading
<div className="animate-pulse">
  <div className="h-4 bg-stone-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-stone-200 rounded w-1/2"></div>
</div>
```

### Alert Messages
**Current Issues**: Basic alert styling, poor visual hierarchy
**Target Design**:
- Sophisticated alert designs with proper color coding
- Lucide React icons for different alert types
- Elegant spacing and typography

```tsx
// Premium Success Alert
<div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
  <div>
    <h4 className="font-medium text-emerald-800">Success</h4>
    <p className="text-emerald-700 text-sm mt-1">Entry has been created successfully.</p>
  </div>
</div>

// Premium Error Alert
<div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-start gap-3">
  <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
  <div>
    <h4 className="font-medium text-rose-800">Error</h4>
    <p className="text-rose-700 text-sm mt-1">Please check your input and try again.</p>
  </div>
</div>
```

## Icon Replacement Map

### Current Emoji → Lucide React Icon Mapping
- 🏠 → `Home`
- 💰 → `DollarSign` or `PiggyBank`
- 🏦 → `Building2` or `CreditCard`
- 📊 → `BarChart3` or `TrendingUp`
- ⚙️ → `Settings`
- 👤 → `User`
- 📁 → `Folder`
- 📄 → `FileText`
- ✏️ → `Edit`
- 🗑️ → `Trash2`
- ➕ → `Plus`
- 🔍 → `Search`
- 💾 → `Save`
- 📤 → `Upload`
- 📥 → `Download`
- ✅ → `Check` or `CheckCircle`
- ❌ → `X` or `XCircle`
- ⚠️ → `AlertCircle` or `AlertTriangle`
- ℹ️ → `Info`
- 📋 → `ClipboardList`
- 🔒 → `Lock`
- 🔓 → `Unlock`
- 📧 → `Mail`
- 📞 → `Phone`
- 📍 → `MapPin`
- 🔄 → `RefreshCw`
- ⬅️ → `ArrowLeft`
- ➡️ → `ArrowRight`
- ⬆️ → `ArrowUp`
- ⬇️ → `ArrowDown`

## Component State Guidelines

### Hover States
- Subtle background color changes (stone-50 to stone-100)
- Smooth transitions (150ms ease-out)
- Shadow elevation changes (shadow-sm to shadow-md)
- Color deepening for text and icons

### Focus States
- Ring-based focus indicators using stone-400
- 2px ring width with 2px offset
- Maintain accessibility contrast ratios
- Clear visual indication without harsh borders

### Active States
- Slightly deeper colors than hover states
- Reduced shadow to indicate "pressed" state
- Quick transition duration (100ms)
- Maintain visual feedback consistency

### Disabled States
- Reduced opacity (opacity-50 for content)
- Stone-300 colors for borders and text
- Cursor-not-allowed for interactive elements
- Remove hover and focus effects