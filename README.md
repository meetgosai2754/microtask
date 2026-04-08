# Microtask MVP Platform

A full-stack web application where users earn money by completing microtasks, taking surveys, and participating in partner offers from DoorDash and Rakuten.

## Features Let's you...
- Register and Login securely contextually using NextAuth.
- View and complete available microtasks.
- Accrue points (100 points = $1).
- Redeem points for PayPal or Gift Cards instantly when reaching the $5 minimum threshold (500 pts).
- The platform deducts a 10% commission fee mock handled via Stripe on payouts.
- Administrators can create new tasks and approve layouts.

## Running Locally

1. Install dependencies: `npm install`
2. Start the local server: `npm run dev`
3. Access `http://localhost:3000`
4. Register a new user.
5. SQLite Database can be viewed using: `npx prisma studio`

> **Note**: To login as an admin, register an account normally. Then run `npx prisma studio` from the command line, double-click your newly registered user, and change their `role` from "USER" to "ADMIN". Refresh the page to access the Admin Panel.

## Deployment to Vercel (Public URL)

For MVP, this project is using SQLite for maximum portability. However, Vercel's serverless environment deletes local SQLite files between executions. **To deploy this properly to production**, you must switch the Prisma provider to Postgres:

1. Create a free PostgreSQL database on [Supabase](https://supabase.com/) or [Vercel Storage](https://vercel.com/storage/postgres).
2. Update `prisma/schema.prisma` from `provider = "sqlite"` to `provider = "postgresql"`.
3. Push your repository to GitHub.
4. Go to [Vercel](https://vercel.com/new), import your repository, and add the `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` environment variables.
5. Deploy! Vercel will give you a public URL automatically.
