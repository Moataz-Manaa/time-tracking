# Platform checklist

Complete tasks in order. Check a box only when its implementation and relevant checks are finished. Keep verification requiring a real database separate from code completion.

## 1. Foundation
- [x] Review existing React, Express, and Tailwind app.
- [x] Separate dashboard, entry point, API client, and formatting utility.
- [x] Define backend folders for config, models, middleware, and routes.
- [x] Verify dependency installation and production build.

## 2. MongoDB
- [x] Install MongoDB and authentication dependencies.
- [x] Add database connection and environment configuration.
- [x] Create User, Project, Task, and TimeEntry models with indexes.
- [x] Replace JSON persistence with MongoDB queries.
- [x] Verify persistence against a real MongoDB database (isolated MongoDB integration test).
- [ ] Provide an explicit import path for existing local data.

## 3. Authentication
- [x] Register with validated name, email, and hashed password.
- [x] Login and logout with secure server-side sessions stored in MongoDB.
- [x] Add current-user endpoint and protect all workspace endpoints.
- [x] Restrict every query and mutation to the authenticated user.
- [x] Add login/register screens and session restoration.
- [x] Add rate limits, cookie settings, origin checks, and safe errors.
- [x] Test invalid credentials, logout, expiration, and cross-user access.

## 4. Projects
- [x] Add a dedicated Projects page with creation form, descriptions, project cards, task counts, and navigation to project tasks (production build verified).
- [x] Create, list, edit, archive, and restore projects.
- [ ] Add description, status, and project detail view.
- [ ] Validate project inputs and show useful empty/error/loading states.
- [x] Test project ownership and archival behavior, including running-timer rejection and preserved tasks/history.

## 5. Tasks
- [x] Create, edit titles/descriptions, and delete tasks within owned projects.
- [x] Add description, due date, priority, and todo/in-progress/done status to task creation and editing, with overdue indicators.
- [x] Add title/description search and combined project/status/priority/deadline filters, with clear-all and matching counts.
- [x] Prevent deleting tasks with a running timer; retain historical labels.
- [x] Test validation, permissions, filters, and status changes (API integration tests plus date-boundary and combined-filter tests).

## 6. Time tracking
- [x] Persist a single running timer per user using a database constraint.
- [ ] Start/stop/switch timers safely, including concurrent requests.
- [x] Restore running timer after refresh/login.
- [x] Add manual time entries with task selection, local start/end times, duration preview, ownership/date/overlap validation, and saved time-log entries.
- [x] Edit finished time entries with local timestamps, ownership, date and overlap checks.
- [ ] Delete finished time entries.
- [ ] Validate time ranges and compute durations on the server.
- [ ] Test concurrent starts, repeated stops, reload, and user isolation.

## 7. Reports
- [x] Add Reports page with today/week/selected-range totals, local date boundaries, project filter, and time breakdowns by project and task.
- [ ] Dashboard totals for today, this week, and project progress.
- [ ] Filter time log by date and project.
- [x] Summarize time by project and task.
- [x] Export selected report range/project as project or task summary CSV, including timezone and duration columns.
- [x] Test totals and date boundaries, including midnight splits, running timers, and deleted-task history.

## 8. Account and usability
- [x] Edit profile name and change password with current-password verification; invalidate other sessions after password changes.
- [ ] Add responsive layouts, accessible labels, keyboard focus, and confirmations.
- [ ] Add pending states that prevent duplicate submissions.
- [ ] Verify authentication, projects, tasks, timer, and reports in browser.

## 9. Delivery
- [x] Add API integration tests using an isolated test database.
- [x] Run tests and production build successfully (current MongoDB/authentication milestone; rerun after later features).
- [ ] Document setup, environment variables, architecture, API, and backups.
- [ ] Add health endpoint and production configuration instructions.
- [ ] Verify production startup and document remaining limitations.

## 10. Team collaboration
- [x] Share projects with registered teammates by account email, without sending messages.
- [x] Add owner/member roles; only owners manage project details and membership.
- [x] Let members create, edit, assign, and delete shared tasks.
- [x] Assign tasks to project teammates or leave them unassigned.
- [x] Remove members and clear their assignments; require their running project timer to stop first.
- [x] Keep personal time entries, reports, and running timers private.
- [x] Test shared access, nonmember rejection, owner-only management, assignment validation, removal, and time privacy.
- [ ] Optional later: invitations for unregistered users and live updates.

Scope: multi-account platform with project-level collaboration and private personal time tracking.

## Latest verification

- Production build passed.
- Integration test passed against a temporary MongoDB 8.2.6 process: credential validation, password hashing, session restoration, logout, expired sessions, origin rejection, cross-user access, concurrent timer starts, repeat stops, and saved history after login.
- Windows restricted execution prevented the MongoDB test process from starting; the same test passed with process permissions enabled.
- Browser walkthrough remains pending.
- Legacy import command is implemented but its transaction-based workflow still needs verification; its checkbox remains open.
- Local development still needs a configured, running MongoDB database and `.env`; the test database is temporary and is removed after tests.
- Next: finish legacy import verification, then project editing, archival, and detail screens.
