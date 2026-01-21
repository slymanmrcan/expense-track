#!/bin/sh
set -e

echo "📌 Prisma migration deploy çalıştırılıyor..."
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  npx prisma migrate deploy
else
  echo "📌 Migration bulunamadı, prisma db push çalıştırılıyor..."
  npx prisma db push
fi

echo "📌 Uygulama başlatılıyor..."
exec node server.js
