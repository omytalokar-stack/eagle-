# Environment Variables Required for EAGLE Backend

Create a `.env` file in the root directory with the following variables:

```env
# Server Config
PORT=5000
SESSION_SECRET=eagle_ultra_secret_123
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database_name?retryWrites=true&w=majority

# Google Auth (From Google Cloud Console)
# Get these from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
ADMIN_EMAIL=your_admin_email@gmail.com

# Cloudinary (From Cloudinary Dashboard)
# Get these from: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Notes:

1. **SESSION_SECRET**: Use a strong, random string for production
2. **MONGO_URI**: Your MongoDB connection string (remove any spaces after the `=` sign)
3. **GOOGLE_CLIENT_ID**: Should end with `.apps.googleusercontent.com`
4. **ADMIN_EMAIL**: The email address that will have admin access
5. **FRONTEND_URL**: The URL where your frontend is hosted (for CORS and OAuth redirects)

## Your Current Values (to fix):

- Fix `GOOGLE_CLIENT_=` → should be `GOOGLE_CLIENT_ID=`
- Remove space in `MONGO_URI= mongodb+...` → should be `MONGO_URI=mongodb+...`
