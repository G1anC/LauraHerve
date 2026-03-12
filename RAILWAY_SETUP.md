# Railway Deployment Setup

## Required Environment Variables

### Frontend Service

**CRITICAL**: These variables MUST be set in Railway Dashboard → Service Settings → Variables

1. **`VITE_API_URL`** (Required at BUILD TIME)
   - Example: `https://your-backend.up.railway.app`
   - This is the URL of your backend API
   - ⚠️ **Must be set as a Railway variable, NOT in .env files**
   - Vite inlines this at build time

### Backend Service

Set these in Railway Dashboard → Backend Service → Variables:

1. **`ENCRYPTION_SECRET`** - Min 32 characters for JWT signing
2. **`DATABASE_URL`** - PostgreSQL connection string
3. **`MINIO_ENDPOINT`** - S3/MinIO endpoint URL
4. **`MINIO_ROOT_USER`** - S3 access key
5. **`MINIO_ROOT_PASSWORD`** - S3 secret key
6. **`MINIO_BUCKET_NAME`** - S3 bucket name
7. **`MINIO_PUBLIC_URL`** - Public URL for S3 assets
8. **`TRUSTED_ORIGINS`** - Comma-separated allowed origins (include frontend URL)
9. **`PORT`** - Usually 3001 (or Railway auto-assigns)
10. **`NODE_ENV`** - Set to `production`

### Backoffice Service

Same as Frontend:

1. **`VITE_API_URL`** - Backend API URL (same as frontend)

## How to Set Variables in Railway

1. Go to Railway Dashboard
2. Select your project
3. Click on the service (frontend/backend/backoffice)
4. Go to "Variables" tab
5. Click "New Variable"
6. Add each variable with its value

## Build Arguments

The Dockerfiles are configured to accept `VITE_API_URL` as a build argument. Railway automatically passes environment variables as build arguments when using Dockerfiles.

## Troubleshooting

### Frontend returns 500 with "undefined"
- **Cause**: `VITE_API_URL` is not set in Railway
- **Fix**: Add `VITE_API_URL` to Railway Variables for the frontend service

### Backend fails to start
- **Cause**: Missing required environment variables
- **Fix**: Ensure all backend variables listed above are set

### CORS errors
- **Cause**: Frontend URL not in `TRUSTED_ORIGINS`
- **Fix**: Add frontend Railway URL to `TRUSTED_ORIGINS` (comma-separated if multiple)
