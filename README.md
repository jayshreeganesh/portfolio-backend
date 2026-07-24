# Portfolio — Backend API

Express + MongoDB backend for the portfolio contact form, built as a **Project Enhancement Idea** from the Project 1 brief. Works with both the [vanilla](../portfolio-website) and [React](../portfolio-react) frontends.

## Features

- `POST /api/contact` — validates and stores a contact message
- `GET  /api/contact` — lists recent messages (debug/admin helper)
- `GET  /api/health` — health check
- MongoDB persistence via Mongoose (`Message` model)
- **Graceful no-DB fallback**: if `MONGODB_URI` is unset or unreachable, the
  server still runs and logs messages instead of crashing
- CORS allow-list, JSON body limit, and rate limiting on the contact route

## Getting started

```bash
npm install
cp .env.example .env      # then edit values
npm run dev               # auto-reload (node --watch)
# or
npm start
```

Server runs on `http://localhost:5000` by default.

## Environment

See `.env.example`:

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (default 5000) |
| `MONGODB_URI` | Mongo connection string; omit for no-DB mode |
| `CORS_ORIGIN` | Comma-separated allowed frontend origins |

## API

### `POST /api/contact`

```json
{ "name": "Jane", "email": "jane@example.com", "message": "Hello there!" }
```

**201** (stored) or **200** (no-DB mode):
```json
{ "ok": true, "message": "Message stored." }
```

**400** (validation):
```json
{ "ok": false, "errors": ["A valid email is required."] }
```

## Connecting the frontends

- **React**: set `VITE_API_URL=http://localhost:5000/api/contact` in `portfolio-react/.env`.
- **Vanilla**: replace the simulated success in `portfolio-website/script.js` with a
  `fetch()` POST to the same endpoint (see that repo's README).

## Structure

```
portfolio-backend/
├── src/
│   ├── server.js          # Express app + middleware
│   ├── db.js              # Mongo connection (with fallback)
│   ├── models/Message.js  # Mongoose schema
│   └── routes/contact.js  # validation + handlers
├── .env.example
└── package.json
```
