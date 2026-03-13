#!/bin/bash

MINIO_ENDPOINT="${MINIO_ENDPOINT:-http://127.0.0.1:9000}"
MINIO_USER="${MINIO_ROOT_USER:-minioadmin}"
MINIO_PASSWORD="${MINIO_ROOT_PASSWORD:-minioadmin}"
MINIO_BUCKET="${MINIO_BUCKET_NAME:-laura-herve-gallery}"

ALIAS_NAME="minio-cors-setup"

echo "🔧 Setting up MinIO CORS configuration..."
echo "   Endpoint: $MINIO_ENDPOINT"
echo "   Bucket: $MINIO_BUCKET"

mc alias set "$ALIAS_NAME" "$MINIO_ENDPOINT" "$MINIO_USER" "$MINIO_PASSWORD"

if [ $? -ne 0 ]; then
  echo "❌ Failed to connect to MinIO"
  exit 1
fi

if ! mc ls "$ALIAS_NAME/$MINIO_BUCKET" > /dev/null 2>&1; then
  echo "📦 Creating bucket $MINIO_BUCKET..."
  mc mb "$ALIAS_NAME/$MINIO_BUCKET"
fi

echo "🌐 Configuring CORS for bucket $MINIO_BUCKET..."

cat > /tmp/cors-config.json <<EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag", "Content-Length"]
    }
  ]
}
EOF

mc cors set /tmp/cors-config.json "$ALIAS_NAME/$MINIO_BUCKET"

if [ $? -eq 0 ]; then
  echo "✅ CORS configured successfully!"
  echo ""
  echo "📋 Current CORS configuration:"
  mc cors get "$ALIAS_NAME/$MINIO_BUCKET"
else
  echo "❌ Failed to set CORS configuration"
  exit 1
fi

echo ""
echo "📂 Setting bucket policy to allow public reads and presigned uploads..."

cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": ["*"]},
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::$MINIO_BUCKET/*"]
    },
    {
      "Effect": "Allow",
      "Principal": {"AWS": ["*"]},
      "Action": ["s3:PutObject"],
      "Resource": ["arn:aws:s3:::$MINIO_BUCKET/*"]
    }
  ]
}
EOF

mc policy set-json /tmp/bucket-policy.json "$ALIAS_NAME/$MINIO_BUCKET"

if [ $? -eq 0 ]; then
  echo "✅ Bucket policy configured successfully!"
else
  echo "⚠️  Failed to set bucket policy (might need manual configuration)"
fi

rm /tmp/cors-config.json /tmp/bucket-policy.json

echo ""
echo "🎉 MinIO setup complete!"
echo ""
echo "📝 For Railway production, run this command with your production MinIO URL:"
echo "   MINIO_ENDPOINT=https://your-minio.railway.app ./scripts/setup-minio-cors.sh"
