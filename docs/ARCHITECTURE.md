# Architecture

Keep one React client and one Express API. Use plain JavaScript and direct Mongoose queries; avoid extra repository or service layers until needed.

- `src/main.jsx`: React entry point and global styles.
- `src/pages/`: dashboard and upcoming authentication/project/account screens.
- `src/services/api.js`: shared HTTP client.
- `src/utils/`: small shared formatting functions.
- `server/index.js`: database connection, index creation, and server startup.
- `server/app.js`: Express configuration, session store, and route mounting.
- `server/config/`: environment and database setup.
- `server/models/`: MongoDB schemas.
- `server/routes/`: authentication, projects, tasks, time, reports.
- `server/middleware/`: authentication, validation, error handling.
- `docs/`: setup and API documentation.

The API now uses MongoDB. Existing JSON data is preserved and is imported only through an explicit command targeting an empty account.

Projects have an owner and registered members. Owners manage project settings and membership; owners and members can work on project tasks. Task queries check project access rather than task creator identity. Assignments must point to the project owner or a current member. Time entries, reports, and running timers are private to the person who records them. Removing a member revokes project access and clears their assignments while retaining their personal history. Refresh the workspace to see other members’ changes.

Sessions live in MongoDB; the browser holds an HTTP-only session cookie. Password hashes are excluded from normal User queries.

A partial unique index enforces one running time entry per user. Starting another requires stopping the existing timer. Explicit switching and simultaneous task completion/start behavior remain later checklist work.
