# Icon System

This directory contains a comprehensive icon system for the Clippy Suite application.

## Structure

- `icons/` - Individual SVG icon components
- `Icon.tsx` - Unified Icon component that can render any icon
- `index.ts` - Exports all icons and the unified component

## Usage

### Using Individual Icons

```tsx
import { CheckIcon, HeartIcon, PinIcon } from '@/assets';

// Direct usage
<CheckIcon className="w-4 h-4 text-green-500" />
<HeartIcon className="w-6 h-6 text-red-500 fill-red-500" />
<PinIcon className="w-5 h-5 text-blue-500" />
```

### Using the Unified Icon Component

```tsx
import { Icon } from '@/assets';

// Using the unified component
<Icon name="check" size={16} className="text-green-500" />
<Icon name="heart" size={24} className="text-red-500 fill-red-500" />
<Icon name="pin" size={20} className="text-blue-500" />
```

### Available Icons

- `check` - Check mark
- `check-square` - Checkbox with check
- `clock` - Clock/time
- `code` - Code brackets
- `copy` - Copy/clipboard
- `edit` - Edit/pencil
- `external-link` - External link
- `file` - File document
- `heart` - Heart/favorite
- `home` - Home
- `image` - Image
- `more-horizontal` - Three dots horizontal
- `pin` - Pin/thumbtack
- `settings` - Settings/gear
- `tag` - Tag/label
- `trash` - Trash/delete
- `zap` - Lightning bolt

## CSS Utilities

The icon system includes utility classes for common icon patterns:

### Size Classes

- `.icon-sm` - 14px (0.875rem)
- `.icon-md` - 16px (1rem)
- `.icon-lg` - 20px (1.25rem)
- `.icon-xl` - 24px (1.5rem)
- `.icon-2xl` - 32px (2rem)

### Animation Classes

- `.icon-spin` - Continuous rotation
- `.icon-pulse` - Fade in/out
- `.icon-bounce` - Bounce animation

### Hover Effects

- `.icon-hover-scale` - Scale on hover
- `.icon-hover-rotate` - Rotate on hover
- `.icon-hover-glow` - Glow effect on hover

### Example with Utilities

```tsx
<Icon name="heart" className="icon-lg icon-hover-scale text-red-500" />
```

## Benefits

1. **Consistency** - All icons follow the same design patterns
2. **Performance** - Tree-shakeable individual imports
3. **Flexibility** - Both individual and unified component usage
4. **Type Safety** - TypeScript support with IconName type
5. **Styling** - Built-in CSS utilities for common patterns
6. **Maintainability** - Centralized icon management
