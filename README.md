# Thikana

Thikana is a comprehensive property rental marketplace designed for Tenants, Landlords, and Admins.

## Tech Stack
- Framework: Next.js (App Router)
- Database: SQLite (via Prisma ORM)
- Authentication: Custom JWT-based with bcrypt
- Styling: Custom CSS Modules
- UI Components: Custom design system
- Validation: Zod

## Local Setup

### 1. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
Ensure `JWT_SECRET` is set (must be at least 32 characters in production).

### 2. Database Setup & Initialization
```bash
npm install
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Apply migrations to create dev.db
npm run db:seed      # Seed synthetic dev data
```

### 3. Development
Start the development server:
```bash
npm run dev
```

### 4. Production Build & Start
```bash
npm run build
npm run start
```

### 5. Testing
```bash
npm run test         # Run Vitest test suite
npm run typecheck    # Strict TypeScript checking
npm run lint         # ESLint checking
```

## Backup & Restore Notes
For the MVP, Thikana uses **SQLite**.
- **Location**: The database is stored locally in the file `dev.db` at the root of the project.
- **Backup**: To back up the database, simply copy the `dev.db` file to a secure location (e.g. `cp dev.db /backup/dev-$(date +%F).db`).
- **Restore**: To restore, replace the `dev.db` file with a backup copy and restart the application.
- **Exclusion**: Ensure `dev.db` is never committed to version control. It is already included in `.gitignore`.

## Production Deployment Documentation

### SQLite Operational Limitation
Keep SQLite for the current MVP. However, MVP deployment should preferably use a deployment model where the SQLite database has reliable persistent storage and a single-writer/single-instance operational model.
- **Do not deploy SQLite on ephemeral storage.**
- **Do not recommend a serverless setup that destroys the database between invocations.**

### Future Migration Note
**Current**: SQLite + Prisma
**Future scale**: PostgreSQL + Prisma

Migration should happen when:
- concurrent writes increase
- multiple app instances are required
- platform traffic grows significantly

### Production Health Check
The application provides a minimal health check endpoint at `GET /api/health` to verify that the application and database are running without revealing internal details.

### Production Admin Account
**Do NOT seed an admin account automatically in production.** 
To create the first production admin securely:
1. Start the production application and ensure no default admin is seeded.
2. Sign up normally as a new user via the UI.
3. Use a secure remote shell (or Prisma Studio via a secure tunnel) to manually escalate that specific user's role:
   ```bash
   npx prisma studio
   ```
   Or via Node script locally connected to the production volume:
   ```typescript
   await prisma.user.update({
     where: { email: 'your-email@example.com' },
     data: { role: 'ADMIN', status: 'ACTIVE' }
   });
   ```
Never expose admin credentials in the README, source code, seed files, or frontend.

## CI Readiness
The project includes commands compatible with basic CI workflows. Ensure CI checks for:
- `npm ci`
- `npm run db:generate`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
