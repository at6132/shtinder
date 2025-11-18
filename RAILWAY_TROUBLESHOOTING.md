# Railway Deployment Troubleshooting

## Error: Cannot find module '/app/dist/main'

This error occurs when the build output isn't found. Here's how to fix it:

### Solution 1: Verify Root Directory

1. Go to your **Backend Service** in Railway
2. Click **Settings** → **Root Directory**
3. Make sure it's set to: `apps/backend`
4. Save and redeploy

### Solution 2: Check Build Logs

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Check the **Build Logs** to see if the build completed successfully
4. Look for errors like:
   - `npm ERR!` messages
   - TypeScript compilation errors
   - Missing dependencies

### Solution 3: Manual Build Verification

If the build is failing, you can test it locally:

```bash
cd apps/backend
npm install
npm run build
ls -la dist/  # Should show dist/main.js
```

If this works locally but not on Railway, the issue is likely:
- Missing environment variables
- Different Node.js version
- Build cache issues

### Solution 4: Clear Build Cache

1. In Railway, go to your backend service
2. Click **Settings** → **Clear Build Cache**
3. Redeploy

### Solution 5: Verify Build Command

The build command should be:
```
npm ci && npm run build && npx prisma generate
```

Make sure:
- `npm ci` completes successfully (installs dependencies)
- `npm run build` completes successfully (creates dist folder)
- `npx prisma generate` completes successfully (generates Prisma client)

### Solution 6: Check Package.json Scripts

Verify your `apps/backend/package.json` has:
```json
{
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main"
  }
}
```

### Solution 7: Use Railway CLI to Debug

Install Railway CLI and check the build:

```bash
railway login
railway link
railway run npm run build
railway run ls -la dist/
```

### Solution 8: Alternative Start Command

If the issue persists, try changing the start command in Railway:

Instead of: `npm run start:prod`
Use: `node dist/main.js`

Or add a check script:

```json
{
  "scripts": {
    "start:prod": "node -e \"require('fs').accessSync('dist/main.js'); require('./dist/main.js')\""
  }
}
```

### Common Issues:

1. **Root Directory Not Set**: Railway runs from repo root, not `apps/backend`
2. **Build Fails Silently**: Check build logs for errors
3. **Prisma Generate Fails**: Missing DATABASE_URL or Prisma schema issues
4. **Node Version Mismatch**: Railway might use different Node version
5. **Missing Dependencies**: Some dependencies might not be in package.json

### Quick Fix Checklist:

- [ ] Root directory set to `apps/backend`
- [ ] Build logs show successful completion
- [ ] `dist/main.js` exists after build
- [ ] All environment variables are set
- [ ] Node.js version is compatible (18+)
- [ ] No TypeScript errors in build logs
- [ ] Prisma generate completes successfully

