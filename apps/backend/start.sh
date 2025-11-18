#!/bin/sh

echo "🚀 Starting SHTINDER Backend..."
echo "📝 Running database migrations..."

# Run Prisma migrations
npx prisma migrate deploy

if [ $? -ne 0 ]; then
  echo "❌ Migration failed!"
  exit 1
fi

echo "✅ Migrations completed successfully"
echo "🚀 Starting NestJS server..."

# Start the server
node dist/main.js

