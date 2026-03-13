# Day 3 Summary — URL Shortener

## What We Did Today
Today we built the entire frontend and connected it to the backend we built on Day 1 and Day 2. We also redesigned the user flow to be conversion-first — user experiences the product before being asked to login. On top of that we planned 6 new features ready to build on Day 4.

---

## What We Built

- React + Vite frontend from scratch
- Tailwind CSS setup and design system
- Full auth flow — signup, login, token persistence across refresh
- Home page inspired by tinyurl.com
- Profile page with user card + all links
- Analytics page per link
- Conversion-first flow — shorten first, auth later
- Pending URL flow — URL saved to sessionStorage, auto-created after login
- Protected routes — unauthenticated users bounced to login
- QR code, share, copy buttons on each link card

---

## Final Folder Structure

```
frontend/
  src/
    api/
      auth.api.js         — signup, login API calls
      url.api.js          — create, getAll, delete, analytics API calls
    components/
      Navbar.jsx          — logo, login/signup or username/logout
      ProtectedRoute.jsx  — redirects to /login if no token
    context/
      AuthContext.jsx     — global token + user state, login(), logout()
    hooks/
      useUrls.js          — fetch, create, delete URLs with loading/error state
    pages/
      Home.jsx            — landing page with shorten form
      Login.jsx           — login form with pending URL handling
      Signup.jsx          — signup form with pending URL handling
      Profile.jsx         — user card + all links + actions
      Analytics.jsx       — click breakdown for one URL
    utils/
      token.js            — getToken, setToken, removeToken (localStorage)
    App.jsx               — route definitions
    main.jsx              — entry point, wraps app with BrowserRouter + AuthProvider
    index.css             — tailwind directives
  .env                    — VITE_API_BASE_URL
  tailwind.config.js
  vite.config.js
```

---

## Part 1 — React Concepts Used

### Controlled Inputs
In React, form inputs are controlled — React state drives the value, not the DOM.

```jsx
const [email, setEmail] = useState("");

<input
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

Every keystroke → onChange fires → state updates → React re-renders input. You always have the current value in state, ready for when the form submits.

### useEffect
Runs side effects — things that happen outside of rendering, like API calls.

```js
useEffect(() => {
  fetchUrls();
}, []);  // empty [] = run once on mount
```

Empty dependency array means it runs once when the component first mounts. This is how the profile page automatically loads your URLs when you open it.

### Custom Hooks
A function that starts with `use` and contains React state logic. Separates data logic from UI.

```js
// instead of all this living inside Profile.jsx
const { urls, loading, error, handleCreateUrl, handleDeleteUrl } = useUrls();
```

`useUrls` handles all the API calls, loading state, error state. The page just calls it and gets back what it needs. Clean separation.

### Context
Global state that any component can read without prop drilling.

```
Without context:  App → Dashboard → URLCard → button (passing token 3 levels down)
With context:     button calls useAuth() and gets token directly
```

### useState with initializer function
```js
const [user, setUser] = useState(() => {
  const saved = localStorage.getItem("user");
  return saved ? JSON.parse(saved) : null;
});
```

The function only runs once on mount. This is how the user stays logged in after a page refresh — we read from localStorage immediately when the component initializes.

---

## Part 2 — The Conversion-First Flow

### Why
Standard flow: user hits signup wall before seeing any value → many users leave.
Conversion-first: user experiences the product first → much higher chance they sign up.

This is the same pattern used by Notion, Figma, and most modern SaaS products.

### How it works

```
Home page — user pastes URL, clicks Shorten
      ↓
Check: is there a token?
      ↓ NO
Save longUrl to sessionStorage
Navigate to /login
      ↓
User logs in / signs up
      ↓
Login page checks sessionStorage for pendingUrl
      ↓ found
createUrl(pendingUrl) — creates the URL automatically
sessionStorage.removeItem("pendingUrl") — clean up
Navigate to /profile
      ↓
User lands on profile with their first link already created
```

### Why sessionStorage and not localStorage
`sessionStorage` clears when the browser tab closes. This is the right choice for temporary in-progress data — if the user abandons the signup, the pending URL disappears naturally. `localStorage` would persist it forever which would be confusing if they came back days later.

---

## Part 3 — Auth Flow with Token Persistence

### The problem with only React state
```
User logs in → token saved in React state
User refreshes page → React state resets → token gone → logged out
```

### The solution — localStorage + React state together

```js
// on login — save to BOTH
const login = (token, user) => {
  setToken(token);                              // localStorage — survives refresh
  setTokenState(token);                         // React state — triggers re-render
  localStorage.setItem("user", JSON.stringify(user));
  setUser(user);
};

// on mount — read from localStorage to initialize state
const [token, setTokenState] = useState(getToken());
const [user, setUser] = useState(() => {
  const saved = localStorage.getItem("user");
  return saved ? JSON.parse(saved) : null;
});
```

Two layers — localStorage for persistence, React state for reactivity. Both are needed.

---

## Part 4 — Protected Routes

```jsx
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};
```

The `replace` on Navigate means the protected URL gets replaced in browser history — not pushed on top. So pressing back after being redirected to login does not send the user back to the protected page they were just bounced from.

Usage in App.jsx:
```jsx
<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>
```

---

## Part 5 — Design System (Tailwind)

Consistent classes used across every page:

| Element | Classes |
|---|---|
| Page background | `min-h-screen bg-gray-50` |
| Card | `bg-white rounded-xl border border-gray-100 shadow-sm p-6` |
| Primary button | `bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors` |
| Secondary button | `border border-gray-200 hover:bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg` |
| Danger action | `text-gray-400 hover:text-red-500 transition-colors` |
| Input | `w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500` |
| Muted label | `text-xs font-medium text-gray-600` |
| Section heading | `text-xs font-semibold text-gray-500 uppercase tracking-wide` |
| Max width layout | `max-w-2xl mx-auto px-4` |

### Why a design system
Every page uses the same classes for the same elements. Changing one decision — like the border radius on cards — means changing one class string in your head, not hunting through 5 files. Consistency also makes the UI feel professional without extra effort.

---

## Part 6 — Complete User Flow (End to End)

```
1. User lands on / (Home)
   → sees shorten form

2. Pastes a URL → clicks Shorten
   → no token → URL saved to sessionStorage → redirected to /login

3. User logs in
   → token + user saved to localStorage
   → pendingUrl found in sessionStorage
   → URL created automatically
   → redirected to /profile

4. Profile page loads
   → useUrls hook runs → GET /api/urls with token
   → shows profile card (avatar from initials, username, email, link count)
   → shows all URLs with shortUrl, longUrl truncated, click count

5. User clicks Copy → clipboard updated → "Copied!" for 2 seconds
6. User clicks Analytics → /analytics/:id
   → GET /api/urls/:id/analytics
   → shows total clicks, device breakdown, browser breakdown, recent clicks

7. User opens short link in incognito
   → GET /:shortCode (public, no auth)
   → click count incremented
   → Click document saved
   → redirected to longUrl

8. User refreshes /profile
   → token read from localStorage → stays logged in
   → user object read from localStorage → username shows in navbar

9. User clicks Logout
   → token + user removed from localStorage
   → React state cleared
   → redirected to /
```

---

## Commit History

```
init: project setup with express, mongodb and folder structure
feat: add user auth with jwt, bcrypt signup and login
feat: add url shortening with short code generation and redirect
feat: add click tracking with device and browser analytics
fix: separate redirect route, fix auth middleware blocking public routes
feat: add protected routes, get user urls and analytics endpoint
feat: add zod validation on auth and url creation routes
feat: setup react vite frontend with react router and auth context
feat: add login and signup pages with token persistence
feat: add dashboard with url list, copy and delete
feat: add analytics page with click, device and browser breakdown
refactor: redesign flow - home page first, profile replaces dashboard
feat: add tailwind, minimalist ui inspired by tinyurl
```

---

## Mistakes Made and What I Learned

1. **Array of objects inside JSX** — defining an array with `{}` objects directly inside JSX confuses the parser because `{}` and `>` are JSX syntax characters. Lesson: define arrays and objects above the return statement as plain JS variables, then reference them inside JSX.

2. **Tailwind version conflict** — `@tailwindcss/vite` required a newer version of Vite than the project had. Lesson: check peer dependency compatibility before installing. Tailwind v3 with `autoprefixer` and `postcss` is more stable with standard Vite setups.

3. **User state resetting on refresh** — only persisting the token to localStorage but not the user object meant username showed as `undefined` in the navbar after refresh. Lesson: anything that needs to survive a page refresh must live in localStorage, not just React state.

4. **`<a` tag corruption** — a copy-paste error removed the opening `<a` from an anchor tag leaving just the attributes floating in JSX. Lesson: when you get a cascade of JSX parser errors all pointing to the same block, look for a missing opening or closing tag first.

---

## Key Concepts From Day 3

| Concept | What it means |
|---|---|
| Controlled inputs | React state drives input value. onChange updates state on every keystroke. |
| useEffect | Runs after render. Empty [] = run once on mount. Used for initial data fetch. |
| Custom hooks | Extract state logic out of components. Page gets clean data, hook handles the mess. |
| Context | Global state. Any component reads it directly. No prop drilling. |
| sessionStorage | Tab-scoped temporary storage. Cleared when tab closes. Good for in-progress flows. |
| localStorage | Persistent storage. Survives refresh and browser close. Good for token + user. |
| Protected routes | Wrapper component that checks auth before rendering. Redirects if no token. |
| Conversion-first | Let users experience product value before asking them to sign up. |
| navigator.clipboard | Built-in browser API for copy to clipboard. No library needed. |
| navigator.share | Built-in browser share sheet on mobile. Falls back to clipboard on desktop. |

---

## Day 4 Plan — Features to Build

| Feature | What changes |
|---|---|
| Rate limiting | `express-rate-limit` on auth and URL creation routes |
| Custom aliases | Optional alias input on Home page, already supported in backend |
| Link expiry | Optional date picker on Home page, `expiresAt` saved to DB |
| QR code | `qrcode.react` on Profile page, modal with download option |
| Share button | `navigator.share` on mobile, clipboard fallback on desktop |
| Input validation | Frontend checks before API call + backend Zod schema updates |