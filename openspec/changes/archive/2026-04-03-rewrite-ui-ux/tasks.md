## 1. Setup & Design System Foundations

- [x] 1.1 Install Manrope (Display/Headline) and Inter (Body/Labels) fonts.
- [x] 1.2 Update `tailwind.config.js` with new design tokens: `background`, `surface-container-low`, `surface-container-lowest`, `surface-bright`, `primary`, `primary-container`, `tertiary_fixed`, `outline-variant` (ghost border).
- [x] 1.3 Add spacing utilities (e.g., `8`, `12`, `2`) and typography scales (`display-md`, `headline-sm`, `title-md`, `body-md`, `label-md`).
- [x] 1.4 Add `backdrop-blur` and shadow utilities for floating elements (e.g., `blur: 32px`, `spread: -4px`, `color: on-surface/6%`).

## 2. Core Navigation & Layout

- [x] 2.1 Refactor responsive grid components to strictly use whitespace (`Spacing Scale`) instead of 1px solid borders for sectioning.
- [x] 2.2 Create a floating, glassmorphic command bar (`surface-bright`, 80% opacity) for navigation or primary actions.
- [x] 2.3 Implement the `ThemeProvider` context mapping the tonal surface hierarchy for light/dark modes.

## 3. UI Components (Editorial Aesthetic)

- [x] 3.1 Design borderless Cards and Widgets (no borders, `moderate` (2) roundedness, `surface-container-lowest` background).
- [x] 3.2 Create primary action buttons with linear gradients (`primary` to `primary-container`) and `full` roundedness.
- [x] 3.3 Create tonal inputs (`surface-container-highest`) with a `sm` (0.125rem) bottom-only accent in `primary` on focus.
- [x] 3.4 Build "Work Mode" toggles using a frosted glass "HUD" effect (`surface_tint` 10% opacity, heavy blur).

## 4. Dashboard Implementation

- [x] 4.1 Update the dashboard container using "Organic Minimalism" (breathing room, intentional asymmetry, high-contrast typography).
- [x] 4.2 Replace existing dashboard widgets with the new borderless card components and tonal icons (`primary_fixed` backgrounds).

## 5. Grading Interface Redesign

- [x] 5.1 Refactor the grading and attendance views to remove all spreadsheet-like grid lines.
- [x] 5.2 Implement alternating row tints (`surface` and `surface-container-low`) and vertical padding (Spacing `2`) for lists.
- [x] 5.3 If strictly required for a11y, implement the "Ghost Border" fallback (`outline-variant` at 15% opacity).
- [x] 5.4 Apply Status Chips (`tertiary_fixed` for Success, custom amber 10% for Warning) to grading and attendance data points.

## 6. Homework Page Rewrite

- [x] 6.1 Refactor HomeworkPage header: add page title with subtitle (active homework count) and view toggle (Lista/Tablica) with pill-styled buttons.
- [x] 6.2 Implement bento dashboard widgets: "Most Urgent Task" hero card with `primary-container` background and "Weekly Progress" widget with progress bar.
- [x] 6.3 Implement filter bar with status chips (Nadchodzące/Zakończone/Zaległe) and subject dropdown filter.
- [x] 6.4 Rewrite homework cards as responsive grid (1/2/3 columns) with subject icon, status badge, title, due date, and details.
- [x] 6.5 Update HomeworkModal to match new design with badges, formatted description, teacher info.
- [x] 6.6 Add empty state "Dodaj własne zadanie" card at end of grid with dashed border and hover effect.

## 7. Messages Page Rewrite

- [x] 7.1 Refactor MessagesPage header with unified style matching calendar pattern and inbox/sent tab toggle.
- [x] 7.2 Rewrite MessageList cards with unread indicator, subject, sender/recipient, preview, and date.
- [x] 7.3 Update ComposeMessage modal with teacher search, recipient dropdown, and form validation.
- [x] 7.4 Update MessageDetail modal with sender/recipient info, date, and full message body.
- [x] 7.5 Add floating compose button (FAB) with pencil icon at bottom-right corner.
