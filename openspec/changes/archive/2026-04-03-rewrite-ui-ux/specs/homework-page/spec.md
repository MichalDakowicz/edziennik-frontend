## ADDED Requirements

### Requirement: Homework Page Header with View Toggle
The system SHALL display a page header with the title "Zadania domowe", a subtitle showing the count of active homework for the current week, and a view toggle between "Lista" (List) and "Tablica" (Board) views.

#### Scenario: Default list view
- **WHEN** the user navigates to the homework page
- **THEN** the system SHALL display "Lista" as the active view with a `primary` background, rounded-full pill, and shadow
- **THEN** the system SHALL display "Tablica" as an inactive option with `slate-500` text

#### Scenario: Switching to board view
- **WHEN** the user clicks "Tablica"
- **THEN** the system SHALL switch the active view to "Tablica" with the same pill styling
- **NOTE**: Board view implementation is deferred; list view is the primary implementation

### Requirement: Bento Dashboard Widgets
The system SHALL display two bento-style dashboard widgets above the homework list: a "Most Urgent Task" hero card and a "Weekly Progress" widget.

#### Scenario: Most urgent task card
- **WHEN** there are upcoming homework assignments
- **THEN** the system SHALL display a full-width (md:col-span-2) hero card with `primary-container` background
- **THEN** the card SHALL show the nearest deadline homework with title, due date, subject, and a "Przejdź do zadania" CTA button
- **THEN** the card SHALL have a decorative blurred circle element for visual depth

#### Scenario: Weekly progress widget
- **WHEN** the user views the homework page
- **THEN** the system SHALL display a progress widget showing percentage of completed homework (e.g., "68%")
- **THEN** the system SHALL display a progress bar and counts for "Zaległe" (overdue) and "Zakończone" (completed)

### Requirement: Status Filter Chips
The system SHALL provide filter chips for homework status: "Nadchodzące" (Upcoming), "Zakończone" (Completed), and "Zaległe" (Overdue).

#### Scenario: Filtering by status
- **WHEN** the user clicks a status chip
- **THEN** the active chip SHALL have `primary` background with white text
- **THEN** inactive chips SHALL have `surface-container-lowest` background with `slate-600` text
- **THEN** the homework list SHALL update to show only matching items

### Requirement: Subject Filter Dropdown
The system SHALL provide a dropdown to filter homework by subject.

#### Scenario: Filtering by subject
- **WHEN** the user selects a subject from the dropdown
- **THEN** the dropdown SHALL display "Wszystkie przedmioty" as the default option
- **THEN** the homework list SHALL update to show only homework for the selected subject

### Requirement: Homework Card Grid
The system SHALL display homework items as cards in a responsive grid (1 column on mobile, 2 on tablet, 3 on desktop).

#### Scenario: Rendering a homework card
- **WHEN** a homework item is displayed
- **THEN** the card SHALL use `surface-container-lowest` background with `rounded-xl`
- **THEN** the card SHALL display a subject icon with tonal background (e.g., `bg-blue-50` for math)
- **THEN** the card SHALL display a status badge ("Nowe", "W trakcie", "Oddane") with appropriate color
- **THEN** the card SHALL display subject name, homework title, due date, and additional details
- **THEN** the card SHALL have a hover effect with shadow and subtle border (`hover:border-primary/5`)

#### Scenario: Card status badges
- **WHEN** the homework is new (not yet viewed)
- **THEN** the badge SHALL use `bg-blue-100 text-blue-700` with text "Nowe"
- **WHEN** the homework is in progress
- **THEN** the badge SHALL use `bg-amber-100 text-amber-700` with text "W trakcie"
- **WHEN** the homework is submitted
- **THEN** the badge SHALL use `bg-emerald-100 text-emerald-700` with text "Oddane"

### Requirement: Empty State Card
The system SHALL display an "Add custom task" card as the last item in the grid for users to create personal reminders or notes.

#### Scenario: Rendering empty state
- **WHEN** the user views the homework card grid
- **THEN** the last card SHALL be a dashed-border card with an add icon and text "Dodaj własne zadanie"
- **THEN** the card SHALL have a hover effect that changes border color to `primary/50`
