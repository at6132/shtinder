# AWS S3 Setup Guide for SHTINDER

## Step 1: Create an S3 Bucket

1. Go to [AWS Console](https://console.aws.amazon.com/s3/)
2. Click **"Create bucket"**
3. Configure:
   - **Bucket name**: `shtinder-photos` (or your preferred name, must be globally unique)
   - **Region**: Choose closest to your users (e.g., `us-east-1`, `us-west-2`)
   - **Block Public Access**: **UNCHECK** "Block all public access" (we need public-read for images)
   - **Bucket Versioning**: Disable (optional)
   - **Default encryption**: Enable (optional but recommended)
4. Click **"Create bucket"**

## Step 2: Configure Bucket for Public Access

1. Go to your bucket → **Permissions** tab
2. Under **"Block public access"**, click **"Edit"**
3. **UNCHECK** all 4 boxes:
   - ✅ Block public access to buckets and objects granted through new access control lists (ACLs)
   - ✅ Block public access to buckets and objects granted through any access control lists (ACLs)
   - ✅ Block public access to buckets and objects granted through new public bucket or access point policies
   - ✅ Block public access to buckets and objects granted through any public bucket or access point policies
4. Click **"Save changes"** and confirm

## Step 3: Set Bucket Policy for Public Read

1. Still in **Permissions** tab → **Bucket policy**
2. Click **"Edit"** and paste this policy (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

3. Replace `YOUR-BUCKET-NAME` with your actual bucket name
4. Click **"Save changes"**

## Step 4: Create IAM User for S3 Access

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click **"Users"** → **"Create user"**
3. **User name**: `shtinder-s3-uploader`
4. Click **"Next"**
5. Under **"Set permissions"**, select **"Attach policies directly"**
6. Search and select: **`AmazonS3FullAccess`** (or create a custom policy with only PutObject, DeleteObject, GetObject)
7. Click **"Next"** → **"Create user"**

## Step 5: Create Access Keys

1. Click on the user you just created
2. Go to **"Security credentials"** tab
3. Scroll to **"Access keys"** section
4. Click **"Create access key"**
5. Select **"Application running outside AWS"**
6. Click **"Next"** → **"Create access key"**
7. **IMPORTANT**: Copy both:
   - **Access key ID**
   - **Secret access key** (you can only see this once!)

## Step 6: Add Environment Variables to Railway

Go to Railway → Backend Service → Variables and add:

```
AWS_ACCESS_KEY_ID=your-access-key-id-here
AWS_SECRET_ACCESS_KEY=your-secret-access-key-here
AWS_REGION=us-east-1
AWS_S3_BUCKET=shtinder-photos
```

**Replace:**
- `your-access-key-id-here` with your actual Access Key ID
- `your-secret-access-key-here` with your actual Secret Access Key
- `us-east-1` with your bucket's region (e.g., `us-west-2`, `eu-west-1`)
- `shtinder-photos` with your actual bucket name

## Step 7: Redeploy Backend

After adding the environment variables, redeploy your backend service in Railway.

## Testing

Once deployed, try uploading a photo through your app. The image should:
1. Upload to S3
2. Be publicly accessible via the returned URL
3. Display in your app

## Security Notes

- ✅ The bucket policy only allows **public read** (GetObject), not write
- ✅ Only your backend (with IAM credentials) can upload/delete
- ✅ Consider adding CORS configuration if you need direct browser uploads
- ⚠️ Keep your AWS credentials secret - never commit them to git!

## Optional: Add CORS Configuration

If you want to allow direct browser uploads (not implemented yet):

1. Go to your bucket → **Permissions** → **Cross-origin resource sharing (CORS)**
2. Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://shtinder-production.up.railway.app"],
    "ExposeHeaders": []
  }
]
```

Replace the AllowedOrigins with your frontend URL.

