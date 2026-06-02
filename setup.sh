#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "============================================="
echo "  UNOX / HermesOS Cockpit Setup Wizard       "
echo "============================================="

# 1. Environment variables setup
if [ ! -f .env.local ]; then
  echo "[-] Creating .env.local from .env.example..."
  cp .env.example .env.local
  # Generate a random nextauth secret
  RAND_SECRET=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
  # Replace in-place
  sed -i "s/change-me-to-a-secure-random-key/$RAND_SECRET/g" .env.local
  echo "[+] Created .env.local with a fresh NextAuth secret."
else
  echo "[+] .env.local already exists. Skipping copy."
fi

# Load database url from .env.local or fallback
export DATABASE_URL=$(grep "^DATABASE_URL=" .env.local | cut -d'=' -f2- | tr -d '"' | tr -d "'")
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:./dev.db"
fi

# 2. Install dependencies
echo "[-] Installing node modules..."
npm install

# 3. Generate Prisma client
echo "[-] Generating Prisma client..."
npx prisma generate

# 4. Apply migrations (creates an initial migration on a fresh DB)
echo "[-] Applying Prisma migrations to $DATABASE_URL..."
if [ -d "prisma/migrations" ] && [ -n "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  npx prisma migrate deploy
else
  echo "[-] No migration history found. Creating the initial migration..."
  npx prisma migrate dev --name init --skip-seed
fi

echo "============================================="
echo "[+] Setup completed successfully!"
echo "    Start the development server with:"
echo "    npm run dev"
echo "============================================="
