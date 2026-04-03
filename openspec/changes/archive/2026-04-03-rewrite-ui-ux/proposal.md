## Why

The current user interface (UI) and user experience (UX) need an overhaul to move away from the cluttered, utilitarian "spreadsheet" aesthetic. This change will transform the application into a calm, authoritative editorial experience, adopting the "Digital Curator" persona and "Organic Minimalism" to reduce cognitive load for teachers and students.

## What Changes

- Complete visual redesign adopting the "Editorial Academic Excellence" design system.
- Implementation of high-contrast typography (Manrope for headings, Inter for body/labels).
- Enforcement of the "No-Line Rule" to remove rigid grids and borders.
- Tonal Layering and Glassmorphism for depth and visual hierarchy.
- **BREAKING**: Redesigned dashboard and grading views moving from traditional tables to editorial, borderless layouts.
- **BREAKING**: Homework page rewritten with bento-style dashboard widgets, card grid layout, view toggle (Lista/Tablica), and status filter chips.
- **BREAKING**: Messages page rewritten with unified header, inbox/sent tabs, message list cards, compose modal, and detail modal.

## Capabilities

### New Capabilities
- `responsive-layout`: New fluid grid layout system that adapts seamlessly across devices using whitespace and typography for structure.
- `theme-system`: Support for light/dark modes utilizing the Material-inspired tonal surface hierarchy (`surface-container-low`, etc.).
- `dashboard-ui`: Complete rewrite of the dashboard view using the "Digital Curator" aesthetic, glassmorphic command bars, and tonal accents.
- `grading-interface`: Redesigned grade entry and viewing interfaces using alternating row tints and spacing instead of grid lines.
- `homework-page`: Complete rewrite of the homework page with bento-style widgets, card grid layout, view toggle (Lista/Tablica), status filter chips, and urgency indicators.
- `messages-page`: Complete rewrite of the messages page with unified header, inbox/sent tabs, message list cards with unread indicators, compose modal with teacher search, and detail modal.

### Modified Capabilities

## Impact

- All React components in `src/components/` and `src/App.tsx`.
- Tailwind configuration (`tailwind.config.js`) to include the new typography and tonal color palette.
- CSS styles (`src/index.css`) to add Manrope and Inter fonts, and glassmorphism utilities.
