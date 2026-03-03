import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from './models/User.js';

// Serialize user for session - ALWAYS use googleId (string) to avoid ObjectId cast errors
passport.serializeUser((user, done) => {
  done(null, user.googleId);
});

// Deserialize user from session - lookup by googleId, not _id
passport.deserializeUser(async (id, done) => {
  try {
    // Handle both old sessions (ObjectId) and new sessions (googleId string)
    let user = null;
    
    // First try to find by googleId (string) - this is the new way
    if (typeof id === 'string' && !id.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a googleId string (not an ObjectId)
      user = await User.findOne({ googleId: id });
    } else {
      // It might be an old session with ObjectId, try to find by _id first
      try {
        const mongoose = (await import('mongoose')).default;
        if (mongoose.Types.ObjectId.isValid(id)) {
          user = await User.findById(id);
        }
      } catch (e) {
        // If findById fails, try googleId
        user = await User.findOne({ googleId: id });
      }
    }
    
    if (!user) {
      // If user not found, try one more time with googleId
      user = await User.findOne({ googleId: id });
    }
    
    done(null, user);
  } catch (error) {
    console.error('Deserialize user error:', error);
    // Don't fail - return null so user can login again
    done(null, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find user by googleId
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Update user info if exists
          user.name = profile.displayName;
          user.picture = profile.photos[0]?.value || '';
          user.isAdmin = profile.emails[0].value === process.env.ADMIN_EMAIL;
          await user.save();
        } else {
          // Create new user with Google email and ID
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            picture: profile.photos[0]?.value || '',
            isAdmin: profile.emails[0].value === process.env.ADMIN_EMAIL
          });
        }

        return done(null, user);
      } catch (error) {
        console.error('Passport callback error:', error);
        return done(error, null);
      }
    }
  )
);

export default passport;
