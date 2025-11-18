# Cloudinary Setup Guide for SHTINDER

Cloudinary is **MUCH simpler** than AWS S3 - no buckets, no IAM users, no policies!

## Step 1: Sign Up for Cloudinary (Free)

1. Go to [Cloudinary.com](https://cloudinary.com/)
2. Click **"Sign Up for Free"**
3. Fill out the form (email, password, name)
4. Verify your email

## Step 2: Get Your Credentials

After signing up, you'll be taken to your dashboard. You'll see:

- **Cloud name** (e.g., `dxyz123abc`)
- **API Key** (e.g., `123456789012345`)
- **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz`)

**These are all on the dashboard homepage!** No need to create users or policies.

## Step 3: Add Environment Variables to Railway

Go to Railway → Backend Service → Variables and add:

```
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

**That's it!** Just copy-paste the 3 values from your Cloudinary dashboard.

## Step 4: Redeploy Backend

After adding the environment variables, redeploy your backend service.

## That's It! 🎉

Cloudinary automatically:
- ✅ Stores your images
- ✅ Optimizes them (compression, format conversion)
- ✅ Serves them via CDN (fast worldwide)
- ✅ Handles public URLs
- ✅ No bucket configuration needed
- ✅ No IAM setup needed

## Free Tier Limits

- **25 GB storage**
- **25 GB bandwidth/month**
- Perfect for getting started!

## Testing

Once deployed, try uploading a photo through your app. The image will:
1. Upload to Cloudinary automatically
2. Be optimized and compressed
3. Return a public URL
4. Display in your app instantly

## Why Cloudinary is Better Than S3

| Feature | AWS S3 | Cloudinary |
|---------|--------|------------|
| Setup Time | 30+ minutes | 2 minutes |
| Configuration | Buckets, IAM, Policies | Just 3 env vars |
| Image Optimization | Manual | Automatic |
| CDN | Separate setup | Built-in |
| Free Tier | 5GB storage | 25GB storage + 25GB bandwidth |

Cloudinary is perfect for image uploads! 🚀

