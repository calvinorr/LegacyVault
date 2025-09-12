# Design System Specification

This is the design system specification for the spec detailed in @.agent-os/specs/2025-09-11-premium-design-transformation/spec.md

> Created: 2025-09-11
> Version: 1.0.0

## Color Palette

### Primary Neutral Colors
```css
/* Base Colors - Swiss Spa Aesthetic */
--color-stone-50: #fafaf9;    /* Lightest background */
--color-stone-100: #f5f5f4;   /* Card backgrounds */
--color-stone-200: #e7e5e4;   /* Borders, dividers */
--color-stone-300: #d6d3d1;   /* Disabled states */
--color-stone-400: #a8a29e;   /* Placeholder text */
--color-stone-500: #78716c;   /* Secondary text */
--color-stone-600: #57534e;   /* Primary text */
--color-stone-700: #44403c;   /* Headings */
--color-stone-800: #292524;   /* High contrast text */
--color-stone-900: #1c1917;   /* Maximum contrast */
```

### Accent Colors
```css
/* Subtle Luxury Accents */
--color-emerald-50: #ecfdf5;   /* Success background */
--color-emerald-500: #10b981;  /* Success primary */
--color-emerald-600: #059669;  /* Success hover */

--color-amber-50: #fffbeb;     /* Warning background */
--color-amber-500: #f59e0b;    /* Warning primary */
--color-amber-600: #d97706;    /* Warning hover */

--color-rose-50: #fff1f2;      /* Error background */
--color-rose-500: #ef4444;     /* Error primary */
--color-rose-600: #dc2626;     /* Error hover */

--color-blue-50: #eff6ff;      /* Info background */
--color-blue-500: #3b82f6;     /* Info primary */
--color-blue-600: #2563eb;     /* Info hover */
```

## Typography System

### Font Families
```css
/* Primary Font - Inter for excellent readability */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace - JetBrains Mono for code/numbers */
--font-mono: 'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Code', monospace;
```

### Typography Scale (rem-based)
```css
/* Display Typography */
--text-display-2xl: 4.5rem;    /* 72px - Hero titles */
--text-display-xl: 3.75rem;    /* 60px - Page titles */
--text-display-lg: 3rem;       /* 48px - Section titles */

/* Heading Typography */
--text-4xl: 2.25rem;           /* 36px - h1 */
--text-3xl: 1.875rem;          /* 30px - h2 */
--text-2xl: 1.5rem;            /* 24px - h3 */
--text-xl: 1.25rem;            /* 20px - h4 */
--text-lg: 1.125rem;           /* 18px - h5 */

/* Body Typography */
--text-base: 1rem;             /* 16px - Body text */
--text-sm: 0.875rem;           /* 14px - Small text */
--text-xs: 0.75rem;            /* 12px - Captions */
--text-2xs: 0.625rem;          /* 10px - Labels */
```

### Font Weights
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights
```css
--leading-tight: 1.25;         /* Headings */
--leading-snug: 1.375;         /* Large text */
--leading-normal: 1.5;         /* Body text */
--leading-relaxed: 1.625;      /* Large body text */
--leading-loose: 2;            /* Captions */
```

## Spacing System

### Base Unit: 8px Grid System
```css
/* Spacing Scale (8px base) */
--space-0: 0;                  /* 0px */
--space-1: 0.125rem;           /* 2px */
--space-2: 0.25rem;            /* 4px */
--space-3: 0.375rem;           /* 6px */
--space-4: 0.5rem;             /* 8px */
--space-5: 0.625rem;           /* 10px */
--space-6: 0.75rem;            /* 12px */
--space-8: 1rem;               /* 16px */
--space-10: 1.25rem;           /* 20px */
--space-12: 1.5rem;            /* 24px */
--space-16: 2rem;              /* 32px */
--space-20: 2.5rem;            /* 40px */
--space-24: 3rem;              /* 48px */
--space-32: 4rem;              /* 64px */
--space-40: 5rem;              /* 80px */
--space-48: 6rem;              /* 96px */
--space-56: 7rem;              /* 112px */
--space-64: 8rem;              /* 128px */
```

### Component Spacing Guidelines
- **Button padding**: `space-3 space-6` (6px 12px)
- **Card padding**: `space-6` (24px)
- **Section margins**: `space-12` (48px)
- **Component gaps**: `space-4` (16px)
- **Form field spacing**: `space-5` (20px)

## Border Radius System

```css
/* Border Radius Scale */
--radius-none: 0;
--radius-sm: 0.125rem;         /* 2px */
--radius-default: 0.25rem;     /* 4px */
--radius-md: 0.375rem;         /* 6px */
--radius-lg: 0.5rem;           /* 8px */
--radius-xl: 0.75rem;          /* 12px */
--radius-2xl: 1rem;            /* 16px */
--radius-3xl: 1.5rem;          /* 24px */
--radius-full: 9999px;         /* Circular */
```

## Shadow System

```css
/* Elevation Shadows - Subtle and Sophisticated */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-default: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

## Icon System

### Icon Library: Lucide React
- **Size Scale**: 16px, 20px, 24px, 32px, 48px
- **Default Size**: 20px for most UI elements
- **Large Size**: 24px for prominent actions
- **Small Size**: 16px for inline text elements

### Icon Usage Guidelines
```typescript
// Standard sizes
const iconSizes = {
  sm: 16,    // Inline with text
  md: 20,    // Default UI icons
  lg: 24,    // Primary actions
  xl: 32,    // Headers/features
  '2xl': 48  // Hero elements
}

// Consistent stroke width: 1.5 for all icons
<Icon size={20} strokeWidth={1.5} />
```

### Icon Categories
- **Navigation**: Menu, ChevronRight, ArrowLeft, Home
- **Actions**: Plus, Edit, Trash2, Download, Upload
- **Status**: Check, X, AlertCircle, Info, CheckCircle
- **Financial**: DollarSign, CreditCard, PiggyBank, TrendingUp
- **UI Elements**: Search, Filter, Settings, MoreHorizontal

## Animation & Transitions

### Duration Scale
```css
--duration-75: 75ms;           /* Micro interactions */
--duration-100: 100ms;         /* Quick feedback */
--duration-150: 150ms;         /* Hover states */
--duration-200: 200ms;         /* Standard transitions */
--duration-300: 300ms;         /* Modal/drawer open */
--duration-500: 500ms;         /* Page transitions */
```

### Easing Functions
```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Standard Transitions
```css
/* Hover Effects */
.transition-standard {
  transition: all var(--duration-150) var(--ease-out);
}

/* Modal/Overlay Animations */
.transition-modal {
  transition: all var(--duration-200) var(--ease-out);
}

/* Transform Animations */
.transition-transform {
  transition: transform var(--duration-150) var(--ease-out);
}
```

## Component Standards

### Button Variants
- **Primary**: Stone-800 background, white text, medium shadow
- **Secondary**: Stone-100 background, stone-700 text, subtle border
- **Ghost**: Transparent background, stone-600 text, hover stone-100
- **Danger**: Rose-500 background, white text
- **Success**: Emerald-500 background, white text

### Input Field Standards
- **Border**: Stone-200, focus Stone-400
- **Background**: White with stone-50 on focus
- **Padding**: `space-3 space-4` (12px 16px)
- **Border radius**: `radius-md` (6px)
- **Font size**: `text-base` (16px)

### Card Standards
- **Background**: White
- **Border**: 1px solid stone-200
- **Border radius**: `radius-lg` (8px)
- **Padding**: `space-6` (24px)
- **Shadow**: `shadow-sm`
- **Hover shadow**: `shadow-md`