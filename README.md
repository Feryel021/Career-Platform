# Career Guidance and Mentorship Portal

A web platform that brings students, mentors and industry professionals together in one place. Students can find mentors, ask for guidance, browse jobs and internships, share useful resources and talk to each other directly.

This project is the practical part of a bachelor thesis (topic: *Web-based application development*, supervisor: Dr. Godó Zoltán Attila, author: Jebali Feryel).

**Live demo:** https://career-platform-nu.vercel.app
**API documentation:** https://career-platform-s1hx.onrender.com/api-docs

> The server runs on a free hosting plan and goes to sleep when nobody uses it. The first request after a quiet period can take up to a minute.

## What it does

- **Accounts and roles.** People register as a student, mentor or professional. What they can do depends on the role.
- **Mentorship.** Students browse the mentor directory and send a request. Mentors accept or reject the requests they receive.
- **Jobs and internships.** Everyone can browse. Mentors and professionals can post any type of job, students can post internships. You can only delete your own posts.
- **Resources.** Anyone logged in can share a guide, article or course link, filed under a category such as CV Writing or Interview Tips.
- **Messages.** One-to-one conversations with unread counters.

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React (Create React App), React Router, Axios |
| Backend | Node.js, Express 5 |
| Database | MySQL (TiDB Cloud in production) |
| Auth | JSON Web Tokens, bcrypt password hashing |
| Validation | express-validator |
| Security | helmet, CORS allow-list, rate limiting |
| Tests | Jest, Supertest |
| API docs | OpenAPI 3 with Swagger UI |
| Hosting | Vercel (frontend), Render (backend), TiDB Cloud (database) |
| CI | GitHub Actions |

## How the pieces fit together

```
Browser  ->  Vercel (React app)  ->  Render (Express API)  ->  TiDB Cloud (MySQL)
```

The React app never talks to the database. Every request goes through the API, which checks the login token, the user's role and the shape of the data before touching the database.

## Project structure

```
Backend/
  app.js            Express app: middleware, routes, error handling
  server.js         Starts the server
  config/db.js      MySQL connection pool
  controllers/      Business logic for each feature
  routes/           URL definitions and input validation rules
  middleware/       Token check, role check, validation helper
  docs/openapi.js   API description shown at /api-docs
  tests/            Automated tests
  schema.sql        Database tables
frontend/
  src/pages/        Login, Register, Dashboard, Mentors, Jobs, Resources, Messages
  src/context/      Login state shared across the app
  src/api/axios.js  API client (reads REACT_APP_API_URL)
```

## Running it on your own computer

You need Node.js 20 or newer and a MySQL server.

**1. Database**

```
mysql -u root -p < Backend/schema.sql
```

**2. Backend**

```
cd Backend
cp .env.example .env      # then fill in your values
npm install
npm run dev
```

The API starts on http://localhost:5000.

**3. Frontend** (in a second terminal)

```
cd frontend
npm install
npm start
```

The site opens on http://localhost:3000.

### Settings

Backend (`Backend/.env`):

| Name | Meaning |
|---|---|
| `PORT` | Port to listen on (default 5000) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection |
| `DB_SSL` | `true` for cloud databases that require TLS |
| `JWT_SECRET` | Long random text used to sign login tokens |
| `FRONTEND_URL` | Website address allowed to call the API (comma-separate several) |

Frontend: `REACT_APP_API_URL` is the API address including `/api`. Locally it defaults to `http://localhost:5000/api`.

## Tests

```
cd Backend
npm test               # run all tests
npm run test:coverage  # with a coverage table
```

The tests replace the database with a mock, so they run anywhere without MySQL. They cover registration and login rules, token and role checks, input validation, ownership checks on deletes, CORS, security headers and the documentation page. GitHub Actions runs them on every push, and also checks that the frontend builds.

## API documentation

Start the backend and open http://localhost:5000/api-docs. To try a protected endpoint, log in through `/api/auth/login`, click **Authorize** and paste the token.

## Security measures

- Passwords are hashed with bcrypt and never returned by the API.
- Login tokens expire after 24 hours.
- The role is checked on the server for every protected action. Hiding a button in the interface is never the only protection.
- Every input is validated: roles, job types, categories, links, ids and message length.
- Users can only delete their own jobs and resources, and mentors can only answer requests addressed to them.
- Error responses never include internal details.
- Only the configured website may call the API (CORS), and helmet adds standard security headers.
- Login and registration are limited to 20 attempts per 15 minutes per address.
- Secrets live in environment variables. `.env` is excluded from Git.

Known trade-off: the login token is kept in the browser's `localStorage`, which is simple but readable by injected scripts. A production system would move it to an HttpOnly cookie.

## Deployment

Pushing to `main` redeploys both hosts automatically.

- **Database:** a TiDB Cloud Starter instance. Tables were created from `Backend/schema.sql`.
- **Backend on Render:** root directory `Backend`, build `npm install`, start `node server.js`, with the settings above as environment variables.
- **Frontend on Vercel:** root directory `frontend`, with `REACT_APP_API_URL` set to the Render address plus `/api`. `frontend/vercel.json` makes page refreshes work for client-side routes.

## Ideas for the future

A career-exploration quiz, profile pages, real-time chat, moderation tools and an HttpOnly cookie for sessions.
