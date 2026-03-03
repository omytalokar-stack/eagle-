# Google Cloud Console Setup - OAuth Redirect URI

## Error Fix: redirect_uri_mismatch

Agar aapko `Error 400: redirect_uri_mismatch` aa raha hai, to yeh steps follow karo:

## Step 1: Google Cloud Console mein jao

1. **Google Cloud Console** kholo: https://console.cloud.google.com/
2. Apna project select karo
3. Left sidebar se **"APIs & Services"** → **"Credentials"** pe click karo

## Step 2: OAuth 2.0 Client ID ko edit karo

1. **"OAuth 2.0 Client IDs"** section mein apna client ID dhundho
2. Client ID pe click karo (ya edit icon)

## Step 3: Authorized redirect URIs add karo

**"Authorized redirect URIs"** section mein yeh **EXACT URL** add karo:

```
http://localhost:5000/api/auth/google/callback
```

### Important Points:
- ✅ **EXACT** match hona chahiye (no trailing slash)
- ✅ `http://` use karo (not `https://`)
- ✅ Port `5000` hona chahiye
- ✅ Path `/api/auth/google/callback` hona chahiye

## Step 4: Save karo

1. **"SAVE"** button pe click karo
2. 2-3 minutes wait karo (Google ko update hone mein time lagta hai)

## Step 5: Backend restart karo

Backend server ko restart karo:
```powershell
# Stop current server (Ctrl+C)
# Then restart:
node server.js
```

## Complete List of URLs to Add (if needed):

Agar multiple environments use kar rahe ho, to yeh URLs add kar sakte ho:

```
http://localhost:5000/api/auth/google/callback
http://127.0.0.1:5000/api/auth/google/callback
```

## Verification:

1. Browser mein `http://localhost:3000` kholo
2. "Login" button pe click karo
3. Google sign-in page aana chahiye (error nahi aana chahiye)

## Troubleshooting:

Agar abhi bhi error aaye:
1. ✅ Check karo ki `.env` file mein `GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback` hai
2. ✅ Backend server port 5000 pe chal raha hai
3. ✅ Google Cloud Console mein URL exactly match karta hai
4. ✅ 2-3 minutes wait karo after saving in Google Cloud Console
