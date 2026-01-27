---
applyTo: "**/*.css"
---

# Entrust Theme Web Style Guide

Apply these brand styles when modifying CSS files. All styles use the Figtree font family.

## Brand Colors

Use these CSS custom properties defined in `theme/index.css`:

**Primary Colors:**

- `--entrust-plum`: #723988 (Primary brand color)
- `--entrust-dark-gray`: #3F454F (Text color)

**Secondary Colors:**

- `--entrust-fuchsia`: #AF1685

**Interactive Colors:**

- `--entrust-electric-blue`: #456BD1 (Links, primary buttons)
- `--entrust-blue`: #3655AA (Hover states)

**Background Colors:**

- `--entrust-light-gray-bg`: #F2F2F5
- `--entrust-white-bg`: #FFFFFF

## Typography

### Headings

**Eyebrow Headers**

Used to label and identify content sections or categories above headlines.

- Font: Figtree
- Weight: 800 (Extra Bold)
- Size: 20px
- Line Height: 28px
- Color: var(--entrust-plum)
- Text Transform: uppercase

**H1**

- Font: Figtree
- Weight: 400 (Regular)
- Size: 48px
- Line Height: 54px
- Color: var(--entrust-dark-gray)
- Text Transform: none

**H2**

- Font: Figtree
- Weight: 600 (Semibold)
- Size: 40px
- Line Height: 46px
- Color: var(--entrust-dark-gray)
- Text Transform: none

**H3**

- Font: Figtree
- Weight: 300 (Light)
- Size: 32px
- Line Height: 40px
- Color: var(--entrust-dark-gray)
- Text Transform: none

**H4**

- Font: Figtree
- Weight: 400 (Regular)
- Size: 28px
- Line Height: 36px
- Color: var(--entrust-dark-gray)
- Text Transform: none

**H5**

- Font: Figtree
- Weight: 500 (Medium)
- Size: 24px
- Line Height: 28px
- Color: var(--entrust-dark-gray)
- Text Transform: none

### Body Text

**Default Body Text**

- Font: Figtree
- Weight: 400 (Regular)
- Size: 16px
- Line Height: 24px
- Color: var(--entrust-dark-gray)
- Text Transform: none

## Navigation Elements

### Utility Menu

- Font: Figtree
- Weight: 400 (Regular)
- Size: 13px
- Line Height: 24px
- Color: var(--entrust-dark-gray)
- Text Transform: uppercase

### Breadcrumbs

**Default State**

- Font: Figtree
- Weight: 400 (Regular)
- Size: 12px
- Line Height: 24px
- Color: var(--entrust-dark-gray)
- Text Transform: uppercase

**Active State**

- Weight: 700 (Bold)

**Hover State**

- Text Decoration: underline

## Links

### Standard Links

**Default State**

- Font Weight: 500 (Medium)
- Color: var(--entrust-electric-blue)

**Hover State**

- Color: var(--entrust-blue)
- Text Decoration: underline

**Visited State**

- Color: var(--entrust-plum)

### White Links

Used on dark backgrounds.

**Default State**

- Font Weight: 500 (Medium)
- Color: #FFFFFF

**Hover State**

- Color: #D9E1E2
- Text Decoration: underline

**Visited State**

- Color: #D9E1E2

## Buttons

### Standard Buttons

**Default State**

- Font: Figtree
- Background: var(--entrust-electric-blue)
- Color: #FFFFFF
- Font Size: 16px
- Text Transform: none

**Hover State**

- Background: var(--entrust-blue)

### Menu Buttons

- Font: Figtree
- Background: var(--entrust-electric-blue)
- Font Size: 16px
- Text Transform: uppercase

### Reverse Buttons

**Default State**

- Background: #FFFFFF
- Border: 1px solid var(--entrust-electric-blue)
- Color: var(--entrust-electric-blue)
- Font Size: 16px
- Text Transform: none

**Hover State**

- Background: var(--entrust-electric-blue)
- Color: #FFFFFF

## Implementation Guidelines

When modifying CSS files:

1. **Use CSS Custom Properties**: Always reference color variables (e.g., `var(--entrust-plum)`) instead of hardcoding hex values
2. **Support Dark Mode**: Ensure styles work in both light and dark themes using the `.dark` class selector
3. **Maintain Consistency**: Follow the established naming conventions for custom properties
4. **Test Accessibility**: Verify color contrast ratios meet WCAG AA standards (minimum 4.5:1 for normal text, 3:1 for large text)
5. **Preserve Brand Identity**: Keep the Entrust color palette and typography hierarchy intact
