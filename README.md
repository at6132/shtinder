# SHTINDER - Tinder Clone

A full-stack dating application built with Next.js 14, NestJS, PostgreSQL, and WebSockets.

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- TanStack Query (data fetching)
- Framer Motion (animations)
- React Hook Form + Zod (validation)

### Backend
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- WebSockets (Socket.io)
- JWT Authentication
- AWS S3 (image uploads)

## Project Structure

```
/shtinder/
  /apps/
    /frontend/     # Next.js 14 app
    /backend/      # NestJS API
  /packages/
    /ui/          # Shared UI components
    /types/       # Shared TypeScript types
```

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- AWS S3 bucket (for image uploads)
- Google OAuth credentials (for Google login)

### Setup

1. **Install dependencies:**

You can install dependencies in two ways:

**Option A: Install from root (recommended for monorepo):**
```bash
npm install
```

**Option B: Install in each app separately:**
```bash
# Install backend dependencies
cd apps/backend
npm install
cd ../..

# Install frontend dependencies
cd apps/frontend
npm install
cd ../..
```

2. **Start PostgreSQL database:**
```bash
docker-compose up -d
```

3. **Set up environment variables:**

Backend (`apps/backend/.env`):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shtinder_db"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
PORT=3001
```

Frontend (`apps/frontend/.env.local`):
```env
# Local development
NEXT_PUBLIC_API_URL=http://localhost:3001

# Production (set this to your Railway backend URL)
# NEXT_PUBLIC_API_URL=https://your-backend.railway.app

NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

4. **Set up database:**
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

5. **Start development servers:**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

## Deployment to Railway

### Backend Deployment

1. **Create a new Railway project** and connect your GitHub repository

2. **Add PostgreSQL service:**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway will provide a `DATABASE_URL` automatically

3. **Configure environment variables** in Railway:
   ```
   DATABASE_URL=<provided-by-railway>
   JWT_SECRET=<generate-strong-random-string>
   JWT_REFRESH_SECRET=<generate-strong-random-string>
   AWS_ACCESS_KEY_ID=<your-aws-key>
   AWS_SECRET_ACCESS_KEY=<your-aws-secret>
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=<your-bucket-name>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.vercel.app,https://your-frontend-domain.railway.app
   ```

4. **Set root directory:**
   - In Railway settings, set root directory to `apps/backend`

5. **Set build command:**
   ```
   npm install && npm run build
   ```

6. **Set start command:**
   ```
   npm run start:prod
   ```

7. **Run database migrations:**
   - In Railway, add a one-off command:
   ```
   npx prisma migrate deploy
   ```

### Frontend Deployment (Vercel recommended)

1. **Connect your GitHub repository** to Vercel

2. **Set root directory** to `apps/frontend`

3. **Configure environment variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>
   ```

4. **Build settings:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Important Notes for Production

- **CORS Configuration:** Make sure `CORS_ORIGIN` in backend includes your frontend domain
- **Database:** Railway provides PostgreSQL automatically - use the provided `DATABASE_URL`
- **Image Storage:** Ensure AWS S3 bucket is configured and accessible
- **Admin Password:** The admin dashboard password is `Taub6132` (set in code)
- **HTTPS:** Railway and Vercel provide HTTPS automatically

5. **Start development servers:**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

## Features

- ✅ User authentication (Email/Password + Google OAuth)
- ✅ Swipe deck with card animations
- ✅ Match system
- ✅ Real-time chat with WebSockets
- ✅ Photo uploads to S3
- ✅ Admin dashboard with full visibility
- ✅ User blocking system
- ✅ Simple gender-based discovery (guys see girls, girls see guys)
- ✅ Unlimited swiping
- ✅ Undo last swipe functionality

## Admin Access

After seeding, you can login with admin accounts:
- Email: admin1@shtinder.com
- Email: admin2@shtinder.com
- Email: admin3@shtinder.com
- Password: password123

**Admin Dashboard Password:** `Taub6132`

## Deployment to Railway

### Backend Deployment

1. **Create a new Railway project** and connect your GitHub repository

2. **Add PostgreSQL service:**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway will provide a `DATABASE_URL` automatically

3. **Set root directory:**
   - In Railway settings → Settings → Root Directory: `apps/backend`

4. **Configure environment variables** in Railway:
   ```
   DATABASE_URL=<provided-by-railway-postgres>
   JWT_SECRET=<generate-strong-random-string>
   JWT_REFRESH_SECRET=<generate-strong-random-string>
   AWS_ACCESS_KEY_ID=<your-aws-key>
   AWS_SECRET_ACCESS_KEY=<your-aws-secret>
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=<your-bucket-name>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.vercel.app,https://your-frontend-domain.railway.app
   ```

5. **Build and Deploy:**
   - Railway will automatically detect the Node.js project
   - Build command: `npm install && npm run build && npx prisma generate`
   - Start command: `npm run start:prod`

6. **Run database migrations:**
   - In Railway, go to your backend service → Deployments → New Deploy
   - Or use Railway CLI: `railway run npx prisma migrate deploy`

### Frontend Deployment (Vercel recommended)

1. **Connect your GitHub repository** to Vercel

2. **Set root directory:**
   - Settings → General → Root Directory: `apps/frontend`

3. **Configure environment variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>
   ```

4. **Build settings:**
   - Framework Preset: Next.js
   - Build Command: `npm run build` (Vercel auto-detects)
   - Output Directory: `.next`

### Important Notes for Production

- **CORS Configuration:** Make sure `CORS_ORIGIN` in backend includes your frontend domain (comma-separated for multiple)
- **Database:** Railway provides PostgreSQL automatically - use the provided `DATABASE_URL`
- **Image Storage:** Ensure AWS S3 bucket is configured with proper CORS and public access
- **Admin Password:** The admin dashboard password is `Taub6132` (set in code)
- **HTTPS:** Railway and Vercel provide HTTPS automatically
- **Port:** Railway sets `PORT` automatically - backend listens on `0.0.0.0` to accept connections

## License

MIT


