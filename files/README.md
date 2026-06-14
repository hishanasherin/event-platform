# ⚡ Eventify — Event Registration Platform

A full-stack event registration platform built with **React** + **Django REST Framework**, featuring JWT authentication, event browsing, one-click registration, and a personal registrations dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Django 4.2, Django REST Framework 3.14 |
| Auth | JWT (djangorestframework-simplejwt) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Containerization | Docker + Docker Compose |

---

## Features

- **Authentication** — Register, login, logout with JWT (access + refresh tokens, auto-refresh)
- **Event Listing** — Browse all events with live search and pagination
- **Event Detail** — Full event page with registration/unregistration
- **My Registrations** — Dashboard showing all registered events with cancel option
- **Duplicate guard** — Backend enforces one registration per user per event
- **Protected routes** — Frontend guards `/my-registrations`, redirects to login
- **Admin panel** — Django admin for managing users, events, and registrations
- **Bonus** — Search, pagination, responsive design, seed data command

---

## Quick Start (Docker — recommended)

```bash
git clone <your-repo-url>
cd event-platform
docker-compose up --build
```

Then open:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin

---

## Manual Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- pip

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set SECRET_KEY and DATABASE_URL

# Run migrations
python manage.py migrate

# Seed sample events
python manage.py seed_events

# Create superuser (optional, for admin panel)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend runs at **http://localhost:8000**

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs at **http://localhost:3000**

> The `package.json` proxy setting forwards `/api` requests to `localhost:8000` automatically during development.

---

## Database Setup

### SQLite (default — no config needed)

The `.env.example` defaults to SQLite. Run `python manage.py migrate` and you're done.

### PostgreSQL

1. Create a database: `createdb eventplatform`
2. Set in `.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/eventplatform
   ```
3. Run: `python manage.py migrate`

### MySQL

```
DATABASE_URL=mysql://user:password@localhost:3306/eventplatform
```

Install MySQL adapter: `pip install mysqlclient`

---

## API Documentation

Base URL: `http://localhost:8000/api`

All protected endpoints require: `Authorization: Bearer <access_token>`

---

### Authentication

#### `POST /api/register`
Create a new user account.

**Request body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepassword123",
  "password2": "securepassword123"
}
```

**Response `201`:**
```json
{
  "user": { "id": 1, "name": "Jane Smith", "email": "jane@example.com", "created_at": "..." },
  "access": "<jwt_access_token>",
  "refresh": "<jwt_refresh_token>"
}
```

---

#### `POST /api/login`
Obtain JWT tokens.

**Request body:**
```json
{ "email": "jane@example.com", "password": "securepassword123" }
```

**Response `200`:**
```json
{
  "access": "<jwt_access_token>",
  "refresh": "<jwt_refresh_token>",
  "user": { "id": 1, "name": "Jane Smith", "email": "jane@example.com" }
}
```

---

#### `POST /api/logout`
Blacklist the refresh token. **Requires auth.**

**Request body:**
```json
{ "refresh": "<jwt_refresh_token>" }
```

---

#### `POST /api/token/refresh`
Refresh the access token.

**Request body:**
```json
{ "refresh": "<jwt_refresh_token>" }
```

---

### Events

#### `GET /api/events`
List all events. Supports search and pagination.

**Query params:**
- `search` — filter by title, description, or location
- `page` — page number (default: 1, page size: 10)

**Response `200`:**
```json
{
  "count": 6,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "React & Django Full-Stack Workshop",
      "description": "...",
      "date": "2026-06-21T10:00:00Z",
      "location": "Tech Hub, Bangalore",
      "created_at": "...",
      "registration_count": 12,
      "is_registered": false
    }
  ]
}
```

---

#### `GET /api/events/:id`
Retrieve a single event.

**Response `200`:** Same as a single item from the list above.

---

#### `POST /api/events/:id/register`
Register the authenticated user for an event. **Requires auth.**

**Response `201`:**
```json
{
  "id": 5,
  "user": { ... },
  "event": { ... },
  "registered_at": "2026-06-14T08:30:00Z"
}
```

**Error `400`** (already registered):
```json
{ "detail": "You are already registered for this event." }
```

---

#### `DELETE /api/events/:id/register`
Cancel the authenticated user's registration. **Requires auth.**

**Response `200`:**
```json
{ "detail": "Registration cancelled." }
```

---

### Registrations

#### `GET /api/my-registrations`
List all events the current user has registered for. **Requires auth.**

**Response `200`:**
```json
[
  {
    "id": 5,
    "user": { "id": 1, "name": "Jane Smith", "email": "jane@example.com" },
    "event": { "id": 1, "title": "...", "date": "...", "location": "..." },
    "registered_at": "2026-06-14T08:30:00Z"
  }
]
```

---

## Project Structure

```
event-platform/
├── backend/
│   ├── core/
│   │   ├── settings.py        # Django settings (JWT, CORS, DB)
│   │   ├── urls.py            # Root URL config
│   │   └── wsgi.py
│   ├── api/
│   │   ├── models.py          # User, Event, Registration models
│   │   ├── serializers.py     # DRF serializers with validation
│   │   ├── views.py           # API views (class-based)
│   │   ├── urls.py            # API URL patterns
│   │   ├── admin.py           # Django admin config
│   │   └── management/
│   │       └── commands/
│   │           └── seed_events.py
│   ├── requirements.txt
│   ├── manage.py
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js      # Axios + JWT interceptors
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── EventsPage.jsx
│   │   │   ├── EventDetailPage.jsx
│   │   │   └── MyRegistrationsPage.jsx
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## Database Schema

```sql
-- Users (custom AbstractBaseUser)
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  email       VARCHAR(254) UNIQUE NOT NULL,
  password    VARCHAR(128) NOT NULL,   -- bcrypt hashed by Django
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  date        TIMESTAMPTZ NOT NULL,
  location    VARCHAR(300) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Registrations
CREATE TABLE registrations (
  id            SERIAL PRIMARY KEY,
  user_id       INT REFERENCES users(id) ON DELETE CASCADE,
  event_id      INT REFERENCES events(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, event_id)   -- prevents duplicate registration
);
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | insecure default | Django secret key — **change in production** |
| `DEBUG` | `True` | Set to `False` in production |
| `DATABASE_URL` | SQLite | Full DB connection string |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated allowed hosts |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Frontend origin(s) |

---

## Deployment Notes

For production deployment (e.g. Railway, Render, Fly.io):

1. Set `DEBUG=False`
2. Generate a strong `SECRET_KEY`: `python -c "import secrets; print(secrets.token_urlsafe(50))"`
3. Set `DATABASE_URL` to your production database
4. Run `python manage.py collectstatic`
5. Serve with `gunicorn core.wsgi:application`
6. Deploy frontend with `npm run build` and serve via Nginx or Vercel/Netlify

---

## Design Decisions

- **Custom User model** — Uses `email` as the login field instead of username, following Django best practices.
- **`get_or_create` for registration** — Atomically handles the "already registered" check without a separate lookup.
- **JWT refresh interceptor** — Axios automatically retries failed requests after refreshing the token, giving users a seamless experience.
- **`unique_together` constraint** — Duplicate registration prevention is enforced at the database level, not just the application layer.
- **`is_registered` field** — Computed per-request on the serializer so the frontend knows registration state without an extra API call.
