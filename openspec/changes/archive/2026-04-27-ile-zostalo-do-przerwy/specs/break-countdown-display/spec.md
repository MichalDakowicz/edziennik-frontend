## ADDED Requirements

### Requirement: Active lesson displays time remaining to break
The system SHALL display a countdown to the nearest break while a lesson is active. The countdown target SHALL be the end time of the current lesson block.

#### Scenario: Countdown during active lesson
- **WHEN** the current time is between lesson start and lesson end
- **THEN** the UI displays a message indicating time remaining to break
- **AND** the remaining time is calculated from the current lesson end time

#### Scenario: Boundary at lesson end
- **WHEN** the current time reaches the lesson end time
- **THEN** the active-lesson countdown to break is no longer shown
- **AND** the UI transitions to the break state messaging

### Requirement: Time label uses deterministic state priority
The system SHALL choose one time label state using this priority: before lesson, active lesson, break, after school day.

#### Scenario: Before lesson state
- **WHEN** there is an upcoming lesson and the current time is before its start
- **THEN** the UI shows countdown to lesson start
- **AND** it does NOT show countdown to break

#### Scenario: Break state
- **WHEN** the current time is after one lesson end and before the next lesson start
- **THEN** the UI shows break state messaging
- **AND** it does NOT show active-lesson countdown to break

#### Scenario: After school day state
- **WHEN** there are no remaining lessons in the current day
- **THEN** the UI shows end-of-day messaging
- **AND** no countdown to lesson or break is displayed

### Requirement: Missing time data falls back safely
The system SHALL avoid rendering numeric countdown values when required lesson end-time data is missing or invalid.

#### Scenario: Missing lesson end time
- **WHEN** an active lesson record has no valid end time
- **THEN** the UI shows a safe fallback text
- **AND** the UI does NOT display a potentially incorrect numeric countdown
