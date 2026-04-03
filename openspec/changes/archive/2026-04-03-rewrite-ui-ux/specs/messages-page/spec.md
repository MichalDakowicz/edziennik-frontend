## ADDED Requirements

### Requirement: Messages Page Header with Tabs
The system SHALL display a unified page header with the title "Wiadomości" and inbox/sent tab toggle styled as pill buttons.

#### Scenario: Default inbox view
- **WHEN** the user navigates to the messages page
- **THEN** the system SHALL display "Odebrane" as the active tab with `primary` background and white text
- **THEN** the system SHALL display "Wysłane" as an inactive tab with `surface-container-lowest` background and `slate-600` text

#### Scenario: Switching to sent view
- **WHEN** the user clicks "Wysłane"
- **THEN** the system SHALL switch the active tab to "Wysłane" with the same pill styling
- **THEN** the message list SHALL update to show sent messages

### Requirement: Message List Cards
The system SHALL display messages as cards with unread indicator, subject, sender/recipient, preview, and date.

#### Scenario: Rendering an unread message
- **WHEN** a message is unread
- **THEN** the card SHALL display a blue dot indicator (`bg-blue-400`)
- **THEN** the subject text SHALL be bold (`font-semibold`)
- **THEN** the card SHALL have a hover effect with border transition

#### Scenario: Rendering a read message
- **WHEN** a message is read
- **THEN** the card SHALL display a gray dot indicator (`bg-zinc-500`)
- **THEN** the card SHALL use `surface-container-lowest` background with `rounded-xl`

#### Scenario: Message card content
- **WHEN** a message card is displayed
- **THEN** the card SHALL show the subject line, sender/recipient name, a 120-character preview of the message body, and the formatted date
- **THEN** the date SHALL be right-aligned

### Requirement: Compose Message Modal
The system SHALL provide a compose modal with teacher search, recipient dropdown, subject input, and message body textarea.

#### Scenario: Searching for a recipient
- **WHEN** the user types in the teacher search field
- **THEN** the system SHALL filter the recipient dropdown to matching teachers by first and last name

#### Scenario: Form validation
- **WHEN** the user submits the form with missing fields
- **THEN** the system SHALL display error messages below the invalid fields
- **THEN** the submit button SHALL be disabled during sending

### Requirement: Message Detail Modal
The system SHALL display a message detail modal with sender, recipient, date, and full message body.

#### Scenario: Viewing message details
- **WHEN** the user opens a message
- **THEN** the modal SHALL display the subject as the title, sender name, recipient name, formatted date, and the full message body with whitespace preserved

### Requirement: Floating Compose Button
The system SHALL display a floating action button (FAB) for composing new messages.

#### Scenario: FAB visibility
- **WHEN** the user is on the messages page
- **THEN** a circular button with a pencil icon SHALL be fixed at the bottom-right corner
- **THEN** the button SHALL use `bg-blue-600` with white icon and rounded-full shape
