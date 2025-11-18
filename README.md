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

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Start PostgreSQL database:**
```bash
docker-compose up -d
```

3. **Set up environment variables:**

Backend (`apps/backend/.env`):
```env
DATABASE_URL="postgresql://shtinder:shtinder_password@localhost:5432/shtinder_db"
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
NEXT_PUBLIC_API_URL=http://localhost:3001
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

## Features

- ✅ User authentication (Email/Password + Google OAuth)
- ✅ Swipe deck with card animations
- ✅ Match system
- ✅ Real-time chat with WebSockets
- ✅ Photo uploads to S3
- ✅ Admin dashboard with full visibility
- ✅ User blocking system
- ✅ Distance-based discovery
- ✅ Preference filtering

## Admin Access

After seeding, you can login with admin accounts:
- Email: admin1@shtinder.com
- Email: admin2@shtinder.com
- Email: admin3@shtinder.com
- Password: password123

## License

MIT

