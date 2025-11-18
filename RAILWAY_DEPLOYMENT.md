# Railway Deployment Guide

This guide will help you deploy SHTINDER to Railway with 3 services:
1. **PostgreSQL Database**
2. **Backend API** (NestJS)
3. **Frontend** (Next.js)

## Step-by-Step Deployment

### 1. Create Railway Project

1. Go to [Railway](https://railway.app) and create a new project
2. Connect your GitHub repository

### 2. Add PostgreSQL Database Service

1. Click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will automatically create a PostgreSQL database
3. **Copy the `DATABASE_URL`** from the PostgreSQL service variables (you'll need this for the backend)

### 3. Add Backend Service

1. Click **"New"** → **"GitHub Repo"** → Select your repository
2. In the service settings:
   - **Root Directory:** Set to `apps/backend`
   - Railway will auto-detect the `railway.json` config

3. **Add Environment Variables:**
   ```
   DATABASE_URL=<paste-from-postgres-service>
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
   CORS_ORIGIN=https://your-frontend-domain.railway.app
   ```

4. **Generate JWT Secrets:**
   ```bash
   # Run these commands to generate secure secrets:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Run twice to get JWT_SECRET and JWT_REFRESH_SECRET
   ```

5. **Run Database Migrations:**
   - After the first deployment, go to the backend service
   - Click **"Deployments"** → **"..."** → **"Run Command"**
   - Run: `npx prisma migrate deploy`
   - Or use Railway CLI: `railway run npx prisma migrate deploy`

6. **Get Backend URL:**
   - After deployment, Railway will provide a public URL
   - Example: `https://your-backend-production.up.railway.app`
   - **Copy this URL** - you'll need it for the frontend

### 4. Add Frontend Service

1. Click **"New"** → **"GitHub Repo"** → Select your repository (same repo)
2. In the service settings:
   - **Root Directory:** Set to `apps/frontend`
   - Railway will auto-detect the `railway.json` config

3. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-production.up.railway.app
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>
   NODE_ENV=production
   ```

4. **Update Backend CORS:**
   - Go back to backend service environment variables
   - Update `CORS_ORIGIN` to include your frontend URL:
   ```
   CORS_ORIGIN=https://your-frontend-production.up.railway.app
   ```

### 5. Deploy and Verify

1. **Backend:**
   - Railway will automatically build and deploy
   - Check logs to ensure it started successfully
   - Verify the API is accessible at the Railway URL

2. **Frontend:**
   - Railway will automatically build and deploy
   - Check logs to ensure build completed
   - Visit the frontend URL to verify it's working

3. **Database:**
   - Verify connection in backend logs
   - Run migrations if needed

## Important Notes

### Database Migrations

After first deployment, you **must** run migrations:
```bash
railway run npx prisma migrate deploy
```

Or in Railway dashboard:
- Backend service → Deployments → Run Command → `npx prisma migrate deploy`

### Environment Variables Checklist

**Backend:**
- ✅ `DATABASE_URL` (from PostgreSQL service)
- ✅ `JWT_SECRET` (generate strong random string)
- ✅ `JWT_REFRESH_SECRET` (generate strong random string)
- ✅ `AWS_ACCESS_KEY_ID`
- ✅ `AWS_SECRET_ACCESS_KEY`
- ✅ `AWS_REGION`
- ✅ `AWS_S3_BUCKET`
- ✅ `GOOGLE_CLIENT_ID` (optional)
- ✅ `GOOGLE_CLIENT_SECRET` (optional)
- ✅ `PORT` (Railway sets this automatically, but 3001 is default)
- ✅ `NODE_ENV=production`
- ✅ `CORS_ORIGIN` (frontend URL)

**Frontend:**
- ✅ `NEXT_PUBLIC_API_URL` (backend Railway URL)
- ✅ `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (optional)
- ✅ `NODE_ENV=production`

### Troubleshooting

**Backend won't start:**
- Check logs for errors
- Verify `DATABASE_URL` is correct
- Ensure migrations have run
- Check all environment variables are set

**Frontend can't connect to backend:**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend `CORS_ORIGIN` includes frontend URL
- Ensure backend is running and accessible

**Database connection errors:**
- Verify `DATABASE_URL` from PostgreSQL service
- Check if database is running
- Ensure migrations have been applied

**Build failures:**
- Check Railway logs for specific errors
- Verify all dependencies are in `package.json`
- Ensure root directories are set correctly

## Custom Domains (Optional)

1. In each service, go to **Settings** → **Networking**
2. Add your custom domain
3. Railway will provide DNS records to configure

## Monitoring

- Check **Metrics** tab for each service
- Monitor **Logs** for errors
- Set up **Alerts** if needed

## Admin Access

After deployment:
- Admin password: `Taub6132`
- Admin emails: `admin1@shtinder.com`, `admin2@shtinder.com`, `admin3@shtinder.com`
- Admin password: `password123`

