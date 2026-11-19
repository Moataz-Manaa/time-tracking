# Tempo

Tempo is a time tracker for individuals and teams, built with React, Vite, Tailwind CSS, Express, and MongoDB. Share projects and tasks with teammates while keeping your time entries, running timer, and reports private.

## Features

- Create, edit, archive, and restore projects. Project owners can add registered teammates by email.
- Assign tasks, set priorities and due dates, and filter by project, status, priority, or deadline.
- Track time with one running timer per account, or add and edit finished entries in the time log.
- See time totals by project or task for a selected date range and export either breakdown as CSV.
- Update your profile name and password; changing your password invalidates other sessions.

## Quick start

**Prerequisites:** Node.js 20.19 or newer (22 or 24 recommended), npm, and a running local MongoDB instance or a MongoDB Atlas database.

```sh
git clone https://github.com/Moataz-Manaa/time-tracking.git
cd time-tracking
npm ci
cp .env.example .env
```

In PowerShell, use `Copy-Item .env.example .env` for the last command. Edit `.env`: keep the default URI for local MongoDB or set `MONGODB_URI` to your own database URI. Generate a value for `SESSION_SECRET` and paste it into `.env`:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173), register, then create a project and a task. Press play on the task to start tracking. Refreshing preserves your running timer; stop it before starting another. Use `127.0.0.1`, not `localhost`: the browser origin must match `APP_ORIGIN`.

## Configuration

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string; the example targets the local `tempo` database. |
| `SESSION_SECRET` | Required random secret of at least 32 characters. Replace the example placeholder. |
| `APP_ORIGIN` | Exact browser origin, including the port if present, with no trailing slash. Defaults to `http://127.0.0.1:5173`. |
| `PORT` | Express port (default `3001`). If changed for development, update the API proxy in `vite.config.js` too. |
| `NODE_ENV` | Set to `production` for secure session cookies behind an HTTPS reverse proxy. |
| `DNS_SERVERS` | Optional comma-separated DNS servers when Atlas SRV records cannot resolve. |

## Commands

- `npm run dev`: frontend and API with reload.
- `npm run build`: build the frontend.
- `npm start`: serve the API and built frontend on port 3001.
- `npm test`: run unit and integration tests. Integration tests use an isolated, temporary MongoDB instance, not your configured app database. The first run may need internet access to download the MongoDB binary.
- `npm run import:legacy -- account@example.com`: import a locally supplied `server/data.json` into a registered, empty account. Stop old timers first. The original file is preserved and is not tracked in Git. The import transaction requires Atlas or a MongoDB replica set.

## Production settings

Run `npm run build` before `npm start`. Set `NODE_ENV=production`, set `APP_ORIGIN` to your public HTTPS origin, and configure `MONGODB_URI` and `SESSION_SECRET` privately. Use a single trusted HTTPS reverse proxy forwarding to `127.0.0.1:3001` (or your configured port). Check `/api/health` for database readiness. Back up MongoDB independently of the app, and never commit `.env` or database backups.

## Progress and architecture

The React client is in `src/` and the Express API is in `server/`. See [Architecture](docs/ARCHITECTURE.md) for folder responsibilities and the [platform checklist](PLAN.md) for remaining work.

## API

All mutation requests require an `Origin` header matching `APP_ORIGIN` and JSON bodies. Authenticated requests use a session cookie.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /api/health | Database availability |
| POST | /api/auth/register | name, email, password |
| POST | /api/auth/login | email, password |
| POST | /api/auth/logout | End current session |
| GET | /api/auth/me | Current account |
| PATCH | /api/auth/profile | Update profile name; email remains unchanged |
| PATCH | /api/auth/password | currentPassword and newPassword; invalidates other sessions |
| GET | /api/data | Private workspace |
| POST | /api/projects | Create project with name and optional description |
| PATCH | /api/projects/:id | Edit name/description or set archived to true/false |
| POST | /api/projects/:id/members | Owner adds a registered teammate by email |
| DELETE | /api/projects/:id/members/:userId | Owner removes a member and clears assignments |
| POST | /api/tasks | Create with title, projectId, optional status/priority/dueDate |
| PATCH | /api/tasks/:id | Edit title/description/status/priority/dueDate; empty body toggles completion |
| DELETE | /api/tasks/:id | Delete stopped task, retaining tracked time |
| POST | /api/timer | Start with taskId; stop with empty body |
| POST | /api/entries | Add manual time: taskId, start/end as UTC ISO timestamps; rejects future, reversed, and overlapping time |
| PATCH | /api/entries/:id | Edit start/end of a finished entry, retaining its task and project |

Implementation references: [Express sessions](https://expressjs.com/en/resources/middleware/session/) and [Mongoose connections](https://mongoosejs.com/docs/connections.html).
