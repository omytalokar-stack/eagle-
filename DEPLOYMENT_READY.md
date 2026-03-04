# GitHub Push & Deployment Checklist

## Before Pushing to GitHub

### Code Review
- [ ] All `localhost:5000` hardcoded URLs replaced with env variables
- [ ] CORS origin updated to Vercel frontend URL (or callback function)
- [ ] MongoDB connection doesn't crash server on failure
- [ ] Service Worker caching strategy verified
- [ ] manifest.json is valid JSON
- [ ] Socket.io CORS aligned with frontend

### Local Testing
```bash
# Backend
npm install
npm start
# Test: curl http://localhost:5000/api/health

# Frontend
npm run dev
# Test: http://localhost:5173
# Check browser console for errors
# Test chat connection works
```

### Environment Files
- [ ] `.env` configured with production URLs
- [ ] `.env.production` exists or Vercel env vars set
- [ ] VAPID keys generated and stored
- [ ] Database credentials verified
- [ ] No sensitive keys in code (all in .env)

## Deployment Commands

### 1. Push Backend to GitHub

```bash
cd eagle---high-end-digital-solutions
git status  # Review changes

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: Update backend CORS, fix DB connection, add web push & Socket.io for Vercel frontend"

# Push to main branch
git push origin main

# Note: Render will auto-redeploy after push if webhook is configured
```

### 2. Push Frontend to GitHub (Same repo if monorepo, or separate)

```bash
git add .
git commit -m "feat: Add floating chat button, update API base URL to production, setup complete PWA with manifest & service worker"
git push origin main

# Vercel auto-deploys on push
```

### 3. Update Environment Variables on Render

1. Go to: https://dashboard.render.com
2. Select your backend service
3. Settings → Environment Variables → Update:
   ```
   FRONTEND_URL=https://your-vercel-frontend-url.vercel.app
   VITE_API_BASE_URL=https://eagle-cr29.onrender.com
   VAPID_PUBLIC_KEY=(from terminal output or .env)
   VAPID_PRIVATE_KEY=(from terminal output or .env)
   MONGODB_URI=(your connection string)
   GOOGLE_GENAI_API_KEY=(your key)
   ADMIN_EMAIL=(your email)
   ADMIN_SECRET_KEY=(secure key)
   ```
4. Click "Save"
5. Service will redeploy automatically

### 4. Update Environment Variables on Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables → Add:
   ```
   VITE_API_BASE_URL=https://eagle-cr29.onrender.com
   ```
4. Save
5. Redeploy manually or push new commit

## Verification Checklist

### Backend (Render)
- [ ] Visit https://eagle-cr29.onrender.com/api/health → Returns `{ status: 'ok', timestamp: ... }`
- [ ] Logs show "MongoDB Connected" or warning if URI missing (doesn't crash)
- [ ] Socket.io CORS logs show successful connections from frontend

### Frontend (Vercel)
- [ ] Domain loads without CORS errors
- [ ] Chat button visible on Hero section (Electric Lime, pulsing)
- [ ] Click chat button → Opens /chat-live
- [ ] Chat sends/receives messages in real-time
- [ ] Notification permission prompt shows
- [ ] DevTools → Application → Manifest loads successfully

### PWA Features
- [ ] Add to Home Screen available on mobile
- [ ] Offline mode works (try disabling network)
- [ ] Web push notification displays when admin sends message
- [ ] Service Worker registered (DevTools → Application → Service Workers)

### API Integration
- [ ] Mission Brief form submits to production backend
- [ ] Admin dashboard connects and shows bookings
- [ ] Auth works (login/logout functional)

## Git Workflow

```bash
# Check status
git status

# See what changed
git diff

# Stage files
git add .

# Commit
git commit -m "Clear, descriptive message in present tense"

# Push
git push origin main

# Verify on GitHub
# Check Render & Vercel dashboards for auto-deploy status
```

## If Deployment Fails

### Backend Issues
1. Check Render logs: Dashboard → Service → Logs
2. Check environment variables are set
3. Verify MongoDB connection string is correct
4. Look for CORS policy errors

### Frontend Issues
1. Check Vercel logs: Dashboard → Project → Deployments
2. Verify build succeeded (no TypeScript errors)
3. Check environment variables set in Vercel
4. Test API connectivity in console

### API Connection Issues
```javascript
// In browser console:
fetch('https://eagle-cr29.onrender.com/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

## Production URLs

- **Backend API**: https://eagle-cr29.onrender.com
- **Frontend**: https://your-domain.vercel.app (update with actual)
- **Admin Chat**: https://your-domain.vercel.app/admin-lock
- **Live Chat**: https://your-domain.vercel.app/chat-live

## Post-Deployment Monitoring

1. Monitor uptime on Render & Vercel dashboards
2. Check database growth
3. Review WebSocket connections
4. Test push notifications periodically
5. Monitor for API errors in Render logs

---
**Status**: Ready for production deployment
**Estimated Deployment Time**: 5-10 minutes
**Rollback**: Push previous commit or select previous deployment on Render/Vercel
