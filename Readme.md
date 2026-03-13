# Shortly — URL Shortener

A full stack URL shortener with click analytics, built with Node.js, Express, MongoDB and React.

---

## Features

- Shorten long URLs instantly
- Custom aliases
- Link expiry dates
- Click analytics — total clicks, device and browser breakdown
- QR code per link
- Conversion-first flow — shorten before signup

---

## Tech Stack

**Backend** — Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Zod

**Frontend** — React, Vite, Tailwind CSS, React Router

---

## Getting Started

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:
```
PORT=3001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
BASE_URL=http://localhost:3001
```

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:
```
VITE_API_BASE_URL=http://localhost:3001
```

```bash
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/urls` | Yes | Create short URL |
| GET | `/api/urls` | Yes | Get all your URLs |
| GET | `/api/urls/:id/analytics` | Yes | Get click analytics |
| DELETE | `/api/urls/:id` | Yes | Delete a URL |
| GET | `/:shortCode` | No | Redirect to original URL |

---

## Project Structure

```
url-shortener/
  backend/
    controllers/    — request logic
    middleware/     — auth, validation, rate limiting
    models/         — User, Url, Click schemas
    routes/         — API route definitions
    validators/     — Zod schemas
    utils/          — short code generator
  frontend/
    src/
      api/          — backend API calls
      components/   — Navbar, ProtectedRoute
      context/      — AuthContext
      hooks/        — useUrls
      pages/        — Home, Login, Signup, Profile, Analytics
      utils/        — token helpers
```