#!/bin/bash

echo "🔧 Setting up CORS fix for social authentication..."
echo ""

echo "✅ Step 1: Verify environment variables are set"
grep -E "NEXT_PUBLIC_APP_URL|NEXT_PUBLIC_FRONTEND_URL" .env
echo ""

echo "⚠️  Step 2: Clear Next.js cache"
rm -rf .next
echo "Cache cleared!"
echo ""

echo "📝 Step 3: Ready to restart dev server"
echo "Run: pnpm dev"
echo ""

echo "🌐 After server starts, test at: http://localhost:3001/login"
echo ""

echo "📋 Checklist:"
echo "  ☐ Dev server stopped (Ctrl+C)"
echo "  ☐ .next folder deleted"
echo "  ☐ pnpm dev executed"
echo "  ☐ Browser cache cleared (F12 → Application → Cookies)"
echo "  ☐ Test login with Google/GitHub"
echo ""

echo "❓ If still failing:"
echo "  1. Check DevTools Console (F12) for errors"
echo "  2. Check Network tab for CORS errors"
echo "  3. Verify environment variables are loaded in terminal output"
