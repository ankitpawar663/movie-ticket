# IMovies - Cinema Ticket Booking (MERN)

React (Vite) + Express + MongoDB/Mongoose. Browse movies, pick showtimes, choose seats, book demo tickets, manage bookings, admin dashboard.
**Bookings are demo only - no real payment is processed.**

## Prerequisites
Node.js 18+ (LTS). In development, the API uses a temporary in-memory MongoDB when `MONGO_URI` is unset; set `MONGO_URI` in `server/.env` to use a local MongoDB or MongoDB Atlas for persistent data.

## Setup
```bash
npm install                 # root (concurrently)
npm run install:all         # installs root, server and client deps
cp server/.env.example server/.env   # optionally set MONGO_URI for persistent data
cp client/.env.example client/.env
npm run seed                # demo movies, cinemas, shows, users
npm run dev                 # API http://localhost:5000  |  Web http://localhost:5173
```
Other scripts: `npm test` (server tests), `npm run build` (client production build).

## Demo credentials (created by the seed script)
- Admin: admin@imovies.com / Admin@123
- User: user@imovies.com / User@1234

## Features
Movie search/filter/sort, movie details with showtimes by date, interactive seat map, demo checkout, ticket page (print-friendly), booking history with cancellation (up to 2h before show), admin stats + movie add/delete + booking list, JWT auth, role checks, rate-limited auth, Helmet, CORS.

## Security & auth approach
Bearer JWT (7 days) stored in localStorage; bcryptjs password hashing; roles enforced on the server (the role field from clients is ignored); ObjectId validation; regex-escaped search; admin payloads strip protected fields (e.g. `bookedSeats`).

## Seat-booking consistency
`Show.bookedSeats` is updated with one atomic `updateOne({bookedSeats: {$nin: seats}}, {$push})`. If it matches nothing, the booking is rejected with HTTP 409. If creating the Booking document fails afterwards, the seats are pulled back. Cancelling releases seats. Works on standalone MongoDB (no transactions needed). No temporary seat holds are implemented.

## API summary (all JSON `{success,message,data}`)
- Auth: POST /api/auth/register, POST /api/auth/login, GET/PUT /api/auth/me
- Catalog: GET /api/movies?q&genre&language&status&sort, GET /api/movies/:id, GET /api/cinemas, GET /api/shows?movieId&date, GET /api/shows/:id
- Bookings (auth): POST /api/bookings {showId,seats[]}, GET /api/bookings/mine, GET /api/bookings/:ref, POST /api/bookings/:ref/cancel
- Admin: GET /api/admin/stats|bookings|users; POST/PUT/DELETE /api/admin/movies|cinemas|shows

## Testing status
`server/tests/api.test.js` (Jest + Supertest + mongodb-memory-server) covers login rejection, auth, admin authorization, role mass-assignment, concurrent same-seat booking (exactly one succeeds), invalid seats, ownership and cancel/re-book. **These tests and the client build were NOT executed when this archive was generated** (no network access to install packages); only `node --check` syntax checks of the server files were run. Run `npm test` and `npm run build` locally; mongodb-memory-server downloads a MongoDB binary on first run.

## Known limitations
No payment, QR codes, temporary seat holds, cinema/show admin UI (cinemas and shows have admin API endpoints; use the API or seed script), user admin UI, pagination, or full SRS/report documents. Poster images use generated gradient fallbacks unless a `posterUrl` is set.
