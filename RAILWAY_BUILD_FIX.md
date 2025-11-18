# Railway Build Fix - dist/main not found

## Problem
The build completes but `dist/main.js` doesn't exist when trying to start.

## Root Cause
The build might be:
1. Running from wrong directory (not `apps/backend`)
2. Failing silently
3. Not creating dist folder

## Solution Steps

### Step 1: Check Build Logs
1. Go to Railway → Your Backend Service
2. Click **"Build Logs"** tab
3. Look for:
   - `npm run build` output
   - Any TypeScript errors
   - Whether `dist/` folder was created

### Step 2: Verify Root Directory
1. Go to **Settings** → **Root Directory**
2. Must be exactly: `apps/backend` (no trailing slash)
3. Save and redeploy

### Step 3: Check Build Command Output
The build command now includes `ls -la dist/` at the end to verify the folder exists.

Look in build logs for:
```
ls -la dist/
```

This should show:
- `main.js` file exists
- Other compiled files

### Step 4: If Build Logs Show Errors

**TypeScript Errors:**
- Check for missing types: `npm install --save-dev @types/node`
- Check for syntax errors in source files

**Missing Dependencies:**
- Verify all dependencies are in `package.json`
- Check if any peer dependencies are missing

**Prisma Errors:**
- Verify `DATABASE_URL` is set (even if not used during build)
- Check if Prisma schema is valid

### Step 5: Manual Build Test

If build logs don't show errors but dist/ still missing:

1. In Railway, go to **Deployments** → **Run Command**
2. Run: `npm run build`
3. Check output for errors
4. Run: `ls -la dist/`
5. Verify `main.js` exists

### Step 6: Alternative Start Command

If dist folder exists but start still fails, try:

In Railway settings, change **Start Command** to:
```
node dist/main.js
```

Instead of:
```
npm run start:prod
```

### Step 7: Clear Everything and Rebuild

1. **Settings** → **Clear Build Cache**
2. **Settings** → Verify **Root Directory** is `apps/backend`
3. **Redeploy**

## Updated Files

- `apps/backend/railway.json` - Added `ls -la dist/` to build command
- `apps/backend/package.json` - Changed `start:prod` to use `.js` extension
- `apps/backend/nixpacks.toml` - Updated with verification step

## What to Look For in Build Logs

✅ **Good signs:**
```
> nest build
...
Creating dist/...
Compiling...
...
Build complete
```

✅ **After build, should see:**
```
ls -la dist/
total XX
-rw-r--r-- main.js
-rw-r--r-- main.js.map
...
```

❌ **Bad signs:**
```
Error: Cannot find module...
TypeError: ...
Compilation failed
```

## Next Steps After Fix

Once build succeeds:
1. Verify deployment starts
2. Check deploy logs for: `🚀 Backend running on port 3001`
3. Run migrations: `npx prisma migrate deploy`

