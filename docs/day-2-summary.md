# Day 2 Summary — URL Shortener

## What We Did Today
Today we took the Day 1 foundation and made it secure and complete. The core work was in three areas:
- **Authentication** — signup and login with JWT tokens
- **Authorization** — protecting routes so only logged-in users can create URLs
- **Analytics** — tracking every click with device and browser data

We also hit and fixed a real-world route order bug that was blocking signup entirely.

---

## Project Structure (Updated)

```
backend/
  config/
    db.js
  controllers/
    auth.controller.js        ← NEW
    url.controller.js         ← UPDATED
  middleware/
    auth.middleware.js        ← NEW
    validate.middleware.js    ← NEW
  models/
    Click.js
    Url.js
    User.js
  routes/
    auth.routes.js            ← NEW
    url.routes.js             ← UPDATED
    redirect.routes.js        ← NEW
  validators/
    auth.validator.js         ← NEW
    url.validator.js          ← NEW
  utils/
    generateShortCode.js
  .env
  app.js                      ← UPDATED
  server.js
```

### New File Roles
| File | What it does |
|---|---|
| `routes/auth.routes.js` | Defines /signup and /login endpoints |
| `routes/redirect.routes.js` | Public short link redirect — no auth needed |
| `controllers/auth.controller.js` | Signup and login logic — hashing, JWT creation |
| `middleware/auth.middleware.js` | Verifies JWT on every protected request |
| `middleware/validate.middleware.js` | Runs Zod schema check before controller runs |
| `validators/auth.validator.js` | Zod schemas for signup and login input |
| `validators/url.validator.js` | Zod schema for creating a short URL |

### What Changed
| File | What changed |
|---|---|
| `app.js` | Fixed route order — auth first, protected second, public redirect last |
| `routes/url.routes.js` | Removed redirect, added analytics + delete endpoints |
| `controllers/url.controller.js` | Added getUserUrls, getUrlAnalytics, deleteUrl, fixed click tracking |

---

## Part 1 — Authentication

### Why do we need auth?
Without auth, anyone can create URLs, read everyone's links, or delete anyone's data.
Auth answers one question — **who are you?** Once we know that, we control what they can do.

---

### Signup Flow — `POST /api/auth/signup`

```
Client sends → { username, email, password }
       ↓
Zod validation — is email valid? password min 6 chars? username min 3?
       ↓ (fail → 400 with clear message)
Check DB — does this email already exist?
       ↓ (exists → 400 "User already exists")
bcrypt.hash(password, 10) — one-way hash the password
       ↓
User.create({ username, email, hashedPassword }) — save to MongoDB
       ↓
jwt.sign({ userId }, JWT_SECRET, { expiresIn: "2d" }) — create token
       ↓
Return → { message, token, user }
```

#### Why bcrypt?
We **never** store plain text passwords. If the database leaks, attackers read everything.

`bcrypt` is a one-way hashing function:
- `"mypassword123"` → `"$2b$10$N9qo8uLOickgx2ZMRZoMye..."`
- This **cannot be reversed**
- The `10` is salt rounds — how many times it scrambles. More = harder to crack, slower to compute. 10 is the industry standard
- To verify on login, bcrypt re-hashes what the user typed and compares the two hashes

#### Why JWT?
A JWT (JSON Web Token) has 3 parts separated by dots: `header.payload.signature`

- **Header** — algorithm used (HS256)
- **Payload** — data you stored: `{ userId, iat, exp }`
- **Signature** — header + payload encrypted with your `JWT_SECRET`

The server signs the token with a secret only it knows. When the token comes back later, the server re-verifies the signature. If it matches → genuine, not tampered with.

This is **stateless auth** — the server stores no sessions. The token itself carries all identity information. Every request is self-contained.

---

### Login Flow — `POST /api/auth/login`

```
Client sends → { email, password }
       ↓
Find user by email → not found? 401
       ↓
bcrypt.compare(password, user.password) → no match? 401
       ↓
jwt.sign({ userId }, JWT_SECRET) → new token
       ↓
Return → { message, token, user }
```

Login does not "create a session". It just issues a new signed token.

---

## Part 2 — Middleware

### What is middleware?
A function that runs **between** the request arriving and the controller running. Think of it as a checkpoint — every request passes through it. If it fails, it returns a response immediately and the controller never runs. If it passes, it calls `next()` and the chain continues.

```
Request → middleware 1 → middleware 2 → controller → response
                ↓ (if fail)
            return 400/401 immediately
```

### Auth Middleware

```js
// reads:  Authorization: Bearer eyJhbGci...
const token = authHeader.split(" ")[1]          // grab just the token part
const decoded = jwt.verify(token, JWT_SECRET)   // checks signature + expiry
req.user = decoded                              // { userId } now available everywhere
next()                                          // continue to controller
```

The critical line is `req.user = decoded`. This is how every controller knows which user made the request, without hitting the database again.

If `jwt.verify` fails for any reason (expired, wrong secret, malformed) → throws error → 401 returned → controller never runs.

### Validate Middleware

```js
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)
  if (!result.success) return res.status(400).json({ message: result.error.issues[0].message })
  next()
}
```

Takes a Zod schema, runs it on `req.body`. Invalid input → 400 with the exact error message. The controller only ever receives clean, validated data.

---

## Part 3 — The Route Order Bug

### What went wrong
Original `app.js` had routes in this order:

```js
app.use("/api/urls", urlRoutes);   // has authMiddleware on ALL routes inside
app.use("/", urlRoutes);           // ← catches EVERYTHING including /api/auth/signup
app.use("/api/auth", authRoutes);  // ← never reached
```

Express matches routes **top to bottom**. The `/` catch-all was swallowing `/api/auth/signup` before auth routes were even seen. Signup was hitting `authMiddleware`, had no token, and returned `"Authorization token missing"`.

### The fix

```js
app.use("/api/auth", authRoutes);   // 1st — public, no auth
app.use("/api/urls", urlRoutes);    // 2nd — protected
app.use("/", redirectRoutes);       // 3rd — public catch-all redirect
```

**Rule: always register specific routes before catch-alls. Auth routes must come first.**

The redirect was also split into its own file with no `authMiddleware` — because anyone clicking a short link should not need an account.

---

## Part 4 — URL Shortening & Analytics

### Create Short URL — `POST /api/urls`

```
Request arrives with token in Authorization header
       ↓
authMiddleware → verifies token → sets req.user.userId
       ↓
validate(createUrlSchema) → checks longUrl is a valid URL format
       ↓
dns.lookup(hostname) → does this domain actually exist on the internet?
       ↓ (fail → 400 "Invalid or unreachable URL")
generateShortCode() → 6 random chars from a-zA-Z0-9 (56 billion combinations)
       ↓
Check DB — does this shortCode already exist? Loop until unique
       ↓
Url.create({ longUrl, shortCode, userId: req.user.userId })
       ↓                          ↑ from JWT, NOT from req.body
Return → { shortCode, shortUrl }    user cannot fake this
```

### Redirect — `GET /:shortCode`

Public route — no auth. Anyone clicking a short link.

```
Browser visits http://localhost:3001/aB3xYz
       ↓
Find shortCode in DB → not found? 404
       ↓
Check expiresAt → past? 410 Gone "This link has expired"
       ↓
Url.findByIdAndUpdate → increment clickCount by 1
       ↓
Click.create({ urlId, userAgent, device, browser }) → save analytics
       ↓
res.redirect(url.longUrl) → 302, browser follows automatically
```

### Get All Your URLs — `GET /api/urls`

```js
Url.find({ userId: req.user.userId })
```

`userId` comes from the JWT. The DB query itself is scoped to your account — not a frontend filter, not a check after fetching. The wrong data is never even fetched.

### Analytics — `GET /api/urls/:id/analytics`

Two queries:

```js
// Query 1 — find URL AND verify ownership in one shot
const url = await Url.findOne({ _id: req.params.id, userId: req.user.userId })
// if null → 404 (they can't even tell if the URL exists)

// Query 2 — all clicks for that URL
const clicks = await Click.find({ urlId: url._id })
```

Then compute breakdowns with `reduce()`:
```js
{ totalClicks, deviceBreakdown, browserBreakdown, recentClicks: last 10 }
```

---

## Complete Request Flow (End to End)

Tracing `POST /api/urls` from Postman to MongoDB and back:

```
1. Postman sends:
   POST http://localhost:3001/api/urls
   Headers: { Authorization: "Bearer eyJ..." }
   Body: { "longUrl": "https://google.com" }

2. Express → app.js
   Does /api/urls match any registered route? Yes → urlRoutes

3. url.routes.js
   router.use(authMiddleware) runs first
   → splits "Bearer eyJ..." → takes the token
   → jwt.verify() checks signature + expiry
   → sets req.user = { userId: "69b316..." }
   → calls next()

4. url.routes.js
   validate(createUrlSchema) runs
   → zod checks longUrl is a valid URL
   → calls next()

5. url.controller.js → createShortUrl()
   → dns.lookup("google.com") ✅
   → generateShortCode() → "aB3xYz"
   → Url.create({ longUrl, shortCode, userId: "69b316..." })
   → saved to MongoDB

6. Response:
   { "shortCode": "aB3xYz", "shortUrl": "http://localhost:3001/aB3xYz" }
```

---

## Checkpoint Status

| # | Target | Status |
|---|---|---|
| 1 | Signup → get a token | ✅ done |
| 2 | Login → get a token | ✅ done |
| 3 | Create URLs only when logged in | ✅ done |
| 4 | userId saved with every URL | ✅ done |
| 5 | See only YOUR urls | ✅ done |
| 6 | Click analytics for one URL | ✅ done |
| 7 | Clicking short URL saves click data | ✅ done |
| 8 | Expired link shows proper error | ✅ done |
| 9 | Bad input rejected with clear messages | ✅ done |

---

## Mistakes Made and What I Learned

1. **Route order in app.js** — the `/` catch-all was swallowing `/api/auth/signup` before auth routes were registered. Lesson: specific routes before catch-alls, auth routes always first.

2. **authMiddleware on the redirect route** — the redirect is public. Anyone clicking a short link should not need a token. Lesson: think about who the actual user is for each route — logged-in users vs anonymous visitors.

3. **JWT malformed in Postman** — copy-pasting tokens manually introduced hidden characters. The token was valid, the transport was broken. Lesson: use Postman environment variables `{{token}}` to eliminate manual copy-paste.

4. **JWT_SECRET cached at module load** — storing `const JWT_SECRET = process.env.JWT_SECRET` at the top of a file runs once at startup, potentially before dotenv loads. Lesson: read `process.env` values at call time, not at import time — or ensure `require('dotenv').config()` runs before anything else in `server.js`.

---

## Key Concepts From Day 2

| Concept | What it means |
|---|---|
| Stateless auth | Server stores no sessions. JWT carries identity. Every request is self-contained. |
| Middleware chain | Functions run in order between request and controller. Each calls next() or rejects. |
| bcrypt | One-way password hash. Cannot reverse. Verify by re-hashing and comparing. |
| JWT | Signed token with payload. Server verifies signature — if it matches, content is trusted. |
| Route order | Express matches top to bottom. Catch-alls must come last. |
| Ownership check | Always filter DB queries by userId from JWT — never trust IDs from req.body. |
| Zod validation | Validate at the edge before any DB work. Fail fast with clear messages. |
| DNS lookup | Verify domain exists before saving — prevents storing dead links. |