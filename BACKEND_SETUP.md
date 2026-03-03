# EAGLE Backend Setup Guide

## Overview

This backend provides:
- Google OAuth 2.0 authentication with session management
- Admin access control based on email
- Cloudinary integration for image uploads
- MongoDB database for storing mission briefs/bookings
- Protected admin routes

## Files Created

1. **server.js** - Main Express server with all routes
2. **passport-config.js** - Google OAuth configuration
3. **models/Booking.js** - Mongoose schema for mission briefs
4. **ENV_VARIABLES.md** - Complete list of required environment variables

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory (see ENV_VARIABLES.md for all variables)

3. Start the backend server:
```bash
npm run start:backend
```

## API Routes

### Public Routes

- `POST /api/mission-brief` - Submit a mission brief with design images
  - Accepts multipart/form-data with `designImages` field (array of files)
  - Returns booking ID on success

- `GET /api/auth/google` - Initiate Google OAuth login
- `GET /api/auth/google/callback` - OAuth callback (handled by Passport)
- `GET /api/auth/logout` - Logout current user
- `GET /api/auth/me` - Get current authenticated user info (includes `isAdmin` flag)

### Protected Routes (Admin Only)

- `GET /api/admin/bookings` - Get all mission briefs/bookings
  - Requires authentication and admin email match

## Authentication Flow

1. User visits `/api/auth/google`
2. Redirected to Google for authentication
3. After successful login, redirected to frontend
4. Frontend can check `/api/auth/me` to get user info including `isAdmin`
5. If `isAdmin: true`, show admin links/buttons

## Admin Middleware

The `isAdmin` middleware checks:
1. User is authenticated (`req.isAuthenticated()`)
2. User email matches `ADMIN_EMAIL` from `.env`
3. Sets `req.user.isAdmin = true` if conditions are met

## Frontend Integration

To check if user is admin on the frontend:

```javascript
// After login, check user status
const response = await fetch('/api/auth/me', { credentials: 'include' });
const user = await response.json();

if (user.isAdmin) {
  // Show admin links/buttons
} else {
  // Hide admin links/buttons
}
```

## Important Notes

1. **Fix your .env file:**
   - Change `GOOGLE_CLIENT_=` to `GOOGLE_CLIENT_ID=`
   - Remove space in `MONGO_URI= mongodb+...` → `MONGO_URI=mongodb+...`

2. **Google OAuth Setup:**
   - Add authorized redirect URI in Google Cloud Console: `http://localhost:5000/api/auth/google/callback`
   - For production, update to your production URL

3. **MongoDB:**
   - Ensure your MongoDB IP whitelist includes your server IP (152.56.10.109/32)
   - Connection string should not have spaces

4. **Cloudinary:**
   - Images are uploaded to `eagle-designs` folder
   - Max file size: 10MB
   - Supported formats: jpg, jpeg, png, gif, webp

## Testing

1. Test public route:
```bash
curl -X POST http://localhost:5000/api/mission-brief \
  -F "name=Test User" \
  -F "email=test@example.com" \
  -F "calculatedPrice=1000" \
  -F "designImages=@image1.jpg"
```

2. Test auth status:
```bash
curl http://localhost:5000/api/auth/me
```

3. Test admin route (requires login):
```bash
curl http://localhost:5000/api/admin/bookings \
  -H "Cookie: connect.sid=YOUR_SESSION_ID"
```
