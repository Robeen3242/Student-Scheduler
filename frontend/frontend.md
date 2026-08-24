# Frontend --- Student Scheduler

## Purpose

This file provides working context for the top-level frontend of the
Student Scheduler. Use it when modifying the React/TypeScript
application shell, global styling, page-level navigation, calendar
presentation, task/course form styling, or frontend entry point.

The frontend is a React application bootstrapped with Vite and
TypeScript. The files covered here are:

-   `main.tsx`
-   `App.tsx`
-   `index.css`
-   `App.css`
-   `Calendar.tsx`
-   `CalendarGrid.tsx`
-   `CalendarTaskChip.tsx`
-   `DayBox.tsx`
-   `Modal.tsx`
-   `RatingBox.tsx`
-   `Schedule.tsx`
-   `TaskBox.tsx`
-   `TaskForm.tsx`
-   `DailyRating.ts`
-   `ScheduleTask.ts`

The component and type sections below are grounded directly in the
current frontend source. Utility implementations such as `dateUtils.ts`
are referenced where used, but their internal behavior should not be
assumed beyond what these components require.

## Application Entry Point --- `main.tsx`

`main.tsx` is the React entry point.

Current structure:

``` tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Responsibilities:

-   Imports the global stylesheet from `index.css`.
-   Imports the root `App` component.
-   Mounts React into the DOM element with id `root`.
-   Wraps the application in `React.StrictMode`.

When changing startup behavior, providers, routers, or application-wide
context, this is the file where those wrappers would normally be added.

## Root Application Component --- `App.tsx`

`App.tsx` currently provides a very small page-level navigation layer.

### State

The root component owns:

``` tsx
const [currentPage, setCurrentPage] = useState<"dashboard" | "calendar">("dashboard");
```

This means the application currently has two top-level views:

-   `dashboard`
-   `calendar`

The default view is `dashboard`.

### Navigation behavior

When `currentPage === "dashboard"`, the app renders a dashboard panel
containing a `Go to Calendar` button.

Clicking that button runs:

``` tsx
setCurrentPage("calendar")
```

When `currentPage === "calendar"`, the application renders:

``` tsx
<Calendar />
```

The current page system is local React state, not URL routing. Do not
assume React Router is installed or in use.

### Top-level layout

The application content is wrapped in:

``` tsx
<section id="center">
```

The `#center` layout is defined in `App.css`.

### Imported component

`App.tsx` imports:

``` tsx
import Calendar from './components/Calendar'
```

Treat `Calendar` as the root component for the calendar/scheduling UI.
Its internal implementation is outside the scope of this file unless
separately provided.

## Global Styling --- `index.css`

`index.css` contains most of the Scheduler's current visual system. It
defines global variables, root layout, typography, calendar styling,
task/course UI styling, form controls, buttons, and mobile responsive
behavior.

## Theme Variables

The light theme is defined under `:root`.

Important CSS variables include:

``` css
--text
--text-h
--bg
--border
--code-bg
--accent
--accent-bg
--accent-border
--social-bg
--shadow
--sans
--heading
--mono
```

The primary accent is purple:

``` css
--accent: #aa3bff;
```

Dark-mode variants are defined with:

``` css
@media (prefers-color-scheme: dark)
```

When extending the UI, prefer these variables over hard-coded colors
when an existing semantic variable fits.

## Root Layout

`#root` is constrained to a maximum application width and centered:

``` css
#root {
  width: 1126px;
  max-width: 100%;
  margin: 0 auto;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
}
```

The root also has inline borders and centered text by default.

`body` removes the browser's default margin.

## Calendar Presentation

The calendar UI uses several important classes.

### Page and header

-   `.calendar-page`
-   `.calendar-header`
-   `.calendar-month-title`
-   `.calendar-nav-button`
-   `.calendar-actions`

The calendar header is limited to `920px` and uses a centered month
title with navigation controls positioned around it.

### Calendar grid

``` css
.calendar-grid {
  display: grid;
  width: min(100%, 920px);
  grid-template-columns: repeat(7, minmax(92px, 1fr));
  gap: 8px;
}
```

The calendar is therefore a seven-column CSS Grid.

Weekday labels use `.calendar-weekday`.

### Day cells

Calendar day cells use:

-   `.day-box`
-   `.day-box-empty`
-   `.day-box-header`
-   `.day-box-date`
-   `.day-box-content`

Interactive day boxes:

-   are clickable (`cursor: pointer`),
-   animate slightly upward on hover,
-   receive accent-colored hover treatment,
-   support `:focus-visible`,
-   shrink slightly while active.

### Completed day state

`.day-box-complete` provides a green-highlighted completed state.

This state changes:

-   border color,
-   inset and outer glow,
-   background overlay,
-   date badge styling,
-   task-chip appearance,
-   hover styling.

Preserve this state when modifying day-cell visual behavior.

## Calendar Task Chips

Tasks displayed inside calendar cells use:

-   `.calendar-task-chip`
-   `.calendar-task-title`
-   `.calendar-task-priority`

The title truncates using ellipsis when it does not fit:

``` css
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
```

Priority is displayed as a small badge. The task chip uses a left border
and has hover movement inherited from the surrounding day box.

## Dashboard

The dashboard uses `.dashboard-panel`.

It is currently a simple centered flex column with a minimum height of
`220px` and contains the button that opens the calendar view.

## Schedule / Task UI Styling

The stylesheet includes presentation classes for the schedule/task
management UI.

### Main schedule layout

-   `.schedule-main-panel`
-   `.schedule-action-row`
-   `.schedule-form-panel`
-   `.modal-actions`

These establish centered, responsive flex layouts for schedule controls
and forms.

### Task list

-   `.task-list`
-   `.task-list-empty`

Task collections are vertical flex lists with spacing between task
cards.

### Task cards

Task cards use:

-   `.task-box`
-   `.task-box-header`
-   `.task-box-priority`
-   `.task-box-description`
-   `.task-box-meta`

The task card has a dark blue-gray background, hover elevation, and
accent-border treatment.

Metadata values render as pill-like badges.

## Course UI Styling

Course management uses:

-   `.course-list`
-   `.course-list-empty`
-   `.course-box`
-   `.course-box-remove`
-   `.course-form-wrap`
-   `.course-form-error`

Course boxes are compact chips/cards. Their remove button is circular
and becomes red on hover.

## Task Form Styling

The task form is structured using:

-   `.task-form-wrap`
-   `.task-form`
-   `.task-field`
-   `.task-field-top`
-   `.task-field-disabled`
-   `.task-priority-input`
-   `.task-checkbox-field`
-   `.task-field-helper`
-   `.task-form-actions`

Desktop fields use a two-column grid:

``` css
grid-template-columns: 120px minmax(0, 1fr);
```

Inputs, textareas, and selects share consistent borders, sizing,
typography, focus states, and backgrounds.

Disabled fields use muted colors and a `not-allowed` cursor.

The textarea is vertically resizable.

## Rating Form Styling

The uploaded stylesheet contains `.rating-checkbox-field`, including
checkbox sizing and accent color. Other RatingBox implementation details
are not present in these files.

## Button System

The common button base class is:

``` css
.app-button
```

Button variants include:

-   `.app-button-primary`
-   `.app-button-calendar`
-   `.app-button-secondary`
-   `.app-button-course`
-   `.app-button-back`

### Base behavior

All buttons share:

-   rounded borders,
-   consistent typography,
-   hover elevation,
-   active reset,
-   accessible `:focus-visible` outline.

### Calendar button

`.app-button-calendar` is the prominent dashboard-to-calendar
call-to-action. It uses the purple accent, a gradient overlay, shadow,
and an arrow generated using `::after`.

### Course button

`.app-button-course` uses a yellow treatment.

### Back button

`.app-button-back` uses a transparent background and adds a `<`
character through `::before`.

## Responsive Behavior

There are two main breakpoints represented in the uploaded styles.

### Up to 1024px

Global font sizes, root spacing, `#center`, and some older `App.css`
sections adapt for narrower screens.

### Up to 620px

The calendar and forms receive explicit mobile behavior:

-   calendar header becomes a column,
-   month title becomes statically positioned,
-   navigation buttons become full width,
-   calendar columns shrink to `minmax(38px, 1fr)`,
-   day boxes become shorter and more compact,
-   task forms reduce padding,
-   task fields switch from two columns to one,
-   priority input can use full width,
-   form action buttons become full width.

When adding frontend functionality, preserve mobile behavior instead of
designing only for desktop.

## `App.css`

`App.css` currently defines `#center`, which is actively used by
`App.tsx`, along with several styles that appear to originate from the
starter Vite UI:

-   `.counter`
-   `.hero`
-   `#next-steps`
-   `#docs`
-   `#spacer`
-   `.ticks`

The active `#center` styling is:

``` css
#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: flex-start;
  place-items: center;
  flex-grow: 1;
  padding: 40px 24px 56px;
  box-sizing: border-box;
}
```

It becomes more compact below `1024px`.

Do not assume the other starter-looking classes are used by the current
Scheduler without checking component markup first.

## Frontend Conventions to Preserve

When modifying this portion of the Scheduler:

1.  Use React functional components and hooks.
2.  Keep TypeScript types explicit where state has a constrained set of
    values, as with `"dashboard" | "calendar"`.
3.  Reuse existing CSS variables and `.app-button` variants before
    introducing duplicate styling.
4.  Maintain keyboard focus states (`:focus-visible`) for interactive
    elements.
5.  Preserve responsive behavior at the existing `1024px` and `620px`
    breakpoints unless intentionally redesigning it.
6.  Keep calendar layout based on seven CSS Grid columns.
7.  Preserve the completed-day visual state represented by
    `.day-box-complete`.
8.  Do not introduce URL-routing assumptions unless routing is
    intentionally added to the project.
9.  Do not infer backend behavior from the frontend styles.
10. Before changing classes, search component markup to confirm where
    each class is used.

## Current Architectural Summary

``` text
main.tsx
  └── React StrictMode
      └── App.tsx
          ├── dashboard view
          │   └── Go to Calendar button
          └── calendar view
              └── Calendar component
```

Styling is split between:

``` text
index.css  -> global theme + Scheduler-specific UI styling
App.css    -> root center layout + remaining starter-style rules
```

## Important Scope Boundary

This context file is based only on the uploaded top-level frontend
files. It intentionally does not invent the implementation details of
imported components. Add separate context files for component groups
when their source files are supplied.

# Frontend Domain Types

## `DailyRating`

`DailyRating` represents one day's user-entered data:

``` ts
type DailyRating = {
  date: string;
  stress: number;
  energy: number;
  mood: number;
  burnout: number;
  sleep: number;
  time_spent: number;
  break_day: boolean;
}
```

`Calendar` considers a rating complete when its date is present, all six
numeric fields are finite, and `break_day` is a boolean. Completed dates
are passed to the calendar as a `Set<string>`.

## Schedule Types

`Recurrence` supports `"once"`, `"daily"`, `"weekly"`, `"biweekly"`, and
`"monthly"`.

A `ScheduleOccurrence` contains an `id`, parent `taskId`, `date_due`,
optional `note`, `isCompleted`, and `isCancelled`.

A `Course` contains `id` and `name`.

A `ScheduleTask` contains `taskId`, `title`, `description`, optional
`courseId`, `recurrence`, numeric `priority`, `exam`, and an array of
`occurrences`.

Calendar placement is based on `ScheduleTask.occurrences[].date_due`,
not a single parent due-date property.

# Component Architecture

``` text
App
└── Calendar
    ├── CalendarGrid
    │   └── DayBox
    │       └── CalendarTaskChip
    ├── Modal
    │   └── RatingBox
    └── Modal
        └── Schedule
            ├── TaskBox
            └── TaskForm
```

`Calendar` is the main shared state owner. Lower-level components
primarily receive data and callbacks through props.

# `Calendar.tsx`

`Calendar` coordinates month navigation, ratings, tasks, courses, and
modal visibility.

It owns `viewDate`, `ratingOpen`, `selectedRatingDate`, `ratings`,
`scheduleOpen`, `tasks`, and `courses`.

`getCalendarDays(year, month)` pads the beginning of a month with `null`
values and then adds a `Date` for every real day. `viewDate` is always
initialized to the first day of the currently viewed month.
Previous/Next buttons move it one month at a time.

On mount, the component currently requests:

``` text
GET http://127.0.0.1:8000/ratings
GET http://127.0.0.1:8000/courses
```

The expected response properties are `data.ratings` and `data.courses`.
The supplied component does **not** currently load persisted tasks with
`GET /tasks`, so `tasks` begins as an empty array.

Clicking a day formats it with `formatDate`, stores the date, and opens
`RatingBox`.

When a rating is submitted, `Calendar` replaces any existing local
rating for that same date and sends:

``` text
POST /ratings
```

`addTask` appends a task locally and sends:

``` text
POST /tasks
```

`updateTask` replaces the task with the same `taskId` and sends:

``` text
PUT /tasks/{taskId}
```

`addCourse` currently only adds the course to frontend state. The
supplied function does not POST the course.

`removeCourse` removes the course locally, unassigns every task using
that `courseId` by calling `updateTask`, and then sends:

``` text
DELETE /courses/{courseId}
```

# `CalendarGrid.tsx`

Props:

``` ts
type CalendarGridProps = {
  days: (Date | null)[];
  onDayClick: (day: Date) => void;
  tasks: ScheduleTask[];
  completedRatingDates: ReadonlySet<string>;
};
```

The grid renders weekday headers followed by the supplied month cells.
`null` values become empty padding cells.

For each real date it formats the date and selects tasks using:

``` ts
task.occurrences.some(
  occurrence => occurrence.date_due === dateString
)
```

It passes only those tasks to that day's `DayBox`. Completion styling is
enabled when `completedRatingDates.has(dateString)`.

# `DayBox.tsx`

`DayBox` is a clickable `<button>` representing one date.

It receives the date, tasks for that date, click callback, and
completion flag. A completed day receives the `day-box-complete` class.

The visible day number comes from `passKey.getDate()`. Each task is
rendered through `CalendarTaskChip`.

The task-content container currently has `aria-hidden="true"`.

# `CalendarTaskChip.tsx`

The calendar task chip displays the task title and numeric priority.

Its left-border priority colors are:

-   5: red
-   4: orange
-   3: yellow
-   2: lime
-   1: green
-   anything else: gray

# `Modal.tsx`

`Modal` accepts `isOpen`, `onClose`, `title`, and `children`.

When closed it returns `null`. When open it renders a fixed full-screen
overlay. Clicking the backdrop closes it; clicking the inner content
calls `stopPropagation()` so the modal remains open.

The modal layout is currently implemented primarily with inline styles.

# `RatingBox.tsx`

`RatingBox` is a sequential daily-rating form.

It collects numeric features in this order:

``` text
stress -> burnout -> energy -> mood -> sleep -> time_spent -> break_day
```

Stress, burnout, energy, mood, and sleep range from 0--10 in steps of 1.
`time_spent` ranges from 0--24 in steps of 0.25.

Initial values are 5 for the five 0--10 features, 0 for `time_spent`,
and `false` for `break_day`.

The Submit button advances one step at a time. On the final break-day
step it calls `onSubmit(score)` and then `onClose()`. The Close button
exits without submitting.

# `Schedule.tsx`

`Schedule` receives tasks and courses from `Calendar` and sends
mutations upward through callbacks.

Its internal view state is:

``` ts
type scheduleView = "main" | "addTask" | "addCourse" | "editTask";
```

`main` shows the action buttons, courses, and task list.

`addTask` renders `TaskForm` without an existing task.

`addCourse` validates that the course name is not blank, creates an ID
with `crypto.randomUUID()`, and passes the new course to `onAddCourse`.

`editTask` stores a selected `ScheduleTask` and renders `TaskForm` with
that task.

`getCourseName` resolves a task's `courseId` against the current course
list.

# `TaskBox.tsx`

`TaskBox` is the schedule-list card for one task.

It displays:

-   title,
-   priority,
-   course name or `Unassigned`,
-   recurrence,
-   number of generated due dates.

Its optional click handler is used by `Schedule` to select the task for
editing. It does not mutate task state itself.

# `TaskForm.tsx`

`TaskForm` handles both creation and editing. An optional `task` prop
determines whether fields initialize from an existing task.

Local form state includes title, description, course, recurrence,
priority, exam flag, and due date. When editing, the initial due date
comes from `task.occurrences[0]?.date_due`.

## Exam behavior

When `exam` is true:

``` text
recurrence = once
priority = 6
```

The recurrence and priority controls are disabled. When exam mode is
false, priority is capped back to 5 if necessary.

Normal task priority input allows 0--5. Priority 6 is therefore reserved
by this form for exams.

## Occurrence generation

Occurrence generation happens on the frontend during form submission.

Advancement rules are:

``` text
daily      -> +1 day
weekly     -> +7 days
biweekly   -> +14 days
monthly    -> +1 month
```

A `"once"` task receives one occurrence.

Recurring tasks generate occurrences from the chosen due date through
the date returned by `getSemesterEndDate(currentDate)`.

Every generated occurrence receives a UUID, the parent task ID,
formatted due date, `isCancelled: false`, and `isCompleted: false`.

The optional occurrence `note` is not populated by this form.

When editing, the existing `taskId` is preserved, but occurrences are
regenerated from the submitted form settings.

# Current Frontend Data Flow

``` text
Calendar owns ratings, tasks, courses
        |
        +--> CalendarGrid receives tasks + completed rating dates
        |       |
        |       +--> DayBox receives tasks for one date
        |               |
        |               +--> CalendarTaskChip receives one task
        |
        +--> RatingBox submits DailyRating back to Calendar
        |
        +--> Schedule receives tasks + courses
                |
                +--> TaskBox selects tasks for editing
                +--> TaskForm creates/updates ScheduleTask
                +--> course actions propagate back to Calendar
```

Preserve this shared-parent ownership unless deliberately refactoring
the architecture.

# Backend Endpoints Used by the Supplied Frontend

``` text
GET    /ratings
POST   /ratings

POST   /tasks
PUT    /tasks/{taskId}

GET    /courses
DELETE /courses/{courseId}
```

The backend base URL is currently hard-coded as:

``` text
http://127.0.0.1:8000
```

Do not assume another endpoint is wired into the frontend unless its
request exists in the source.

# Additional Frontend Rules to Preserve

1.  Keep task/calendar relationships occurrence-based.
2.  Keep formatted date strings at API/domain boundaries while using
    `Date` for month/date calculations.
3.  Treat exam tasks as one-time priority-6 tasks unless intentionally
    changing the domain rule.
4.  Keep normal recurrence values limited to the current `Recurrence`
    union.
5.  Course deletion should unassign matching tasks rather than delete
    them.
6.  Schedule sub-navigation currently uses local view state, not routes.
7.  Backdrop clicks close modals; inner clicks must not propagate to the
    backdrop.
8.  IDs created in these components use `crypto.randomUUID()`.
9.  Recurring occurrences are currently generated client-side through
    semester end.
10. Do not silently change API methods, response shapes, type fields, or
    ownership while making unrelated UI changes.
11. Initial rating/course loading has `try/catch`; most write operations
    currently have minimal error handling.
12. The supplied frontend does not currently fetch tasks on mount.
13. The supplied `addCourse` callback does not currently persist the
    course with a POST request.
