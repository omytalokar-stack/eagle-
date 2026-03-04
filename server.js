import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import webpush from 'web-push';
import { Server } from 'socket.io';

// Import passport configuration (Google OAuth removed; serialize/deserialize only)
import './passport-config.js';

// Import models
import Booking from './models/Booking.js';
import User from './models/User.js';

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://eagle-high-end-digital-solutions.vercel.app';

// warn about missing critical env vars but don't crash
if (!process.env.SESSION_SECRET) {
  console.warn('⚠️ SESSION_SECRET is not set; using default insecure secret');
  process.env.SESSION_SECRET = 'defaultsecret';
}
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
  console.warn('⚠️ No MongoDB URI provided in env; server will attempt to start but database calls will fail.');
}


// Initialize Gemini AI
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eagle-designs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1920, height: 1080, crop: 'limit' }]
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// ============ MIDDLEWARE SETUP (BEFORE START) ============
app.use(cors({
  origin: ['https://eagle-high-end-digital-solutions.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection options
mongoose.set('bufferCommands', true);

// Middleware: block requests until mongoose is ready (skip for health/auth)
app.use((req, res, next) => {
  if (req.path.includes('/api/health') || req.path.includes('/api/auth')) {
    return next();
  }
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  next();
});

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user && req.user.email === process.env.ADMIN_EMAIL) {
    req.user.isAdmin = true;
    return next();
  }
  return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
};

// ============ WEB PUSH SETUP ============
const vapidPublic = process.env.VAPID_PUBLIC_KEY;
const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
if (!vapidPublic || !vapidPrivate) {
  const keys = webpush.generateVAPIDKeys();
  console.warn('⚠️  VAPID keys generated. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in env for persistence.');
  process.env.VAPID_PUBLIC_KEY = keys.publicKey;
  process.env.VAPID_PRIVATE_KEY = keys.privateKey;
}
webpush.setVapidDetails('mailto:' + (process.env.ADMIN_EMAIL || 'admin@localhost'), process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

// In-memory push subscriptions store
const pushSubscriptions = [];

// ============ WEB PUSH ROUTES ============
app.get('/api/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

app.post('/api/push/subscribe', express.json(), (req, res) => {
  try {
    const sub = req.body;
    if (!sub || !sub.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
    if (!pushSubscriptions.find(s => s.endpoint === sub.endpoint)) {
      pushSubscriptions.push(sub);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Subscribe error', err);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

app.post('/api/push/notify', isAdmin, express.json(), async (req, res) => {
  const { title = 'EAGLE', body = 'You have a new message', url = '/' } = req.body || {};
  const payload = JSON.stringify({ title, body, url });
  const results = [];
  await Promise.all(pushSubscriptions.map(async (sub) => {
    try {
      await webpush.sendNotification(sub, payload);
      results.push({ endpoint: sub.endpoint, status: 'ok' });
    } catch (err) {
      console.error('Push send failed');
      results.push({ endpoint: sub.endpoint, status: 'failed' });
    }
  }));
  res.json({ success: true, results });
});

// ============ AUTH ROUTES ============
// Google OAuth routes removed (using email/password auth later)
// app.get('/api/auth/google',
//   passport.authenticate('google', { scope: ['profile', 'email'] })
// );
//
// app.get('/api/auth/google/callback',
//   passport.authenticate('google', { 
//     failureRedirect: `${FRONTEND_URL}?login=failed`,
//     session: true
//   }),
//   (req, res) => {
//     try {
//       if (req.user && req.user.email === process.env.ADMIN_EMAIL) {
//         req.user.isAdmin = true;
//       }
//       res.redirect(FRONTEND_URL);
//     } catch (error) {
//       console.error('Callback redirect error:', error);
//       res.redirect(`${FRONTEND_URL}?login=error`);
//     }
//   }
// );

app.get('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    req.session.destroy((destroyErr) => {
      if (destroyErr) console.error('Session destroy error:', destroyErr);
      res.clearCookie('connect.sid', { path: '/', httpOnly: true, sameSite: 'lax' });
      res.json({ message: 'Logged out successfully' });
    });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (req.isAuthenticated() && req.user) {
    const userData = {
      id: req.user._id || req.user.googleId,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture,
      isAdmin: req.user.email === process.env.ADMIN_EMAIL
    };
    res.json(userData);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.get('/api/auth/status', (req, res) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (req.isAuthenticated() && req.user) {
    return res.json({
      isLoggedIn: true,
      user: req.user,
      isAdmin: req.user.email === adminEmail
    });
  }
  return res.json({
    isLoggedIn: false,
    user: null,
    isAdmin: false
  });
});

app.get('/api/auth/check', requireAuth, (req, res) => {
  res.json({ authenticated: true });
});

// ============ PUBLIC ROUTES ============
app.post('/api/mission-brief', upload.array('designImages', 10), async (req, res) => {
  try {
    const {
      name, email, phone, projectType, techStack, numPages,
      calculatedPrice, websiteCopy, extraFeatures, githubOption,
      vercelOption, domainConfig, vision, targetAudience, target_audience
    } = req.body;

    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    const booking = new Booking({
      name, email, phone, projectType,
      techStack: Array.isArray(techStack) ? techStack : (techStack ? [techStack] : []),
      numPages: numPages ? parseInt(numPages) : null,
      calculatedPrice: calculatedPrice ? parseFloat(calculatedPrice) : null,
      designImageUrls: imageUrls,
      websiteCopy, extraFeatures, githubOption, vercelOption,
      domainConfig: domainConfig === 'true' || domainConfig === true,
      vision, targetAudience: req.body.targetAudience || req.body.target_audience || ''
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Mission brief submitted successfully',
      bookingId: booking._id
    });
  } catch (error) {
    console.error('Error creating mission brief:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit mission brief',
      details: error.message
    });
  }
});

// ============ ADMIN ROUTES ============
app.get('/api/admin/secret-key', isAdmin, (req, res) => {
  res.json({ secretKey: process.env.ADMIN_SECRET_KEY || 'omy13456' });
});

app.get('/api/admin/bookings', isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).select('-__v');
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings',
      details: error.message
    });
  }
});

// ============ AI CHAT ROUTE (PUBLIC) ============
app.get('/api/chat/:sessionId', (req, res) => {
  // simple stub returning empty history (not persisted yet)
  res.json([]);
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, settings } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    if (!process.env.GOOGLE_GENAI_API_KEY) {
      return res.status(500).json({ success: false, error: 'Gemini API key not configured' });
    }

    const prompt = `You are EAGLE AI, assistant for EAGLE—high-end frontend dev agency by Om Talokar.
Om is expert in React, Next.js, high-performance UI.
Site status: ${settings?.site_status || 'Available'}.
Answer professionally and concisely.
User says: ${message}`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });

    const text = response.text || "I'm having trouble connecting. Please try again.";

    res.json({ success: true, text });
  } catch (error) {
    console.error('Error in chat route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate response',
      details: error.message
    });
  }
});

// ============ MANUAL CHAT ROUTE (PUBLIC) ============
app.post('/api/manual-chat', async (req, res) => {
  try {
    const { message, sessionId, senderName = 'User' } = req.body;

    if (!message || !message.trim() || !sessionId) {
      return res.status(400).json({ success: false, error: 'Message and sessionId required' });
    }

    // Store message in DB (future: use Mongoose model)
    res.json({
      success: true,
      message: 'Message received by admin',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in manual-chat route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message',
      details: error.message
    });
  }
});

// ============ UTILITY ROUTES ============
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// ============ START SERVER ============
const start = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (mongoUri) {
      try {
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('✅ MongoDB Connected Successfully');
      } catch (dbErr) {
        console.error('⚠️ MongoDB connection failed:', dbErr.message);
        console.warn('Continuing to run server without DB connection (degraded mode)');
      }
    } else {
      console.warn('⚠️ Skipping MongoDB connection because URI is missing');
    }

    const serverPort = PORT;
    const server = app.listen(serverPort, () => {
      console.log(`🚀 Server running on port ${serverPort}`);
      console.log(`🌐 Frontend: ${FRONTEND_URL}`);
    });
    
    // Initialize Socket.io with CORS
    const io = new Server(server, {
      cors: {
        origin: ['https://eagle-high-end-digital-solutions.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
        credentials: true,
        methods: ['GET', 'POST']
      }
    });

    // Store active sessions
    const activeSessions = new Map();

    // Socket.io event handlers
    io.on('connection', (socket) => {
      console.log(`📱 Client connected: ${socket.id}`);

      // Join session
      socket.on('join_session', (sessionId) => {
        socket.join(sessionId);
        activeSessions.set(socket.id, sessionId);
        console.log(`✅ Client ${socket.id} joined session ${sessionId}`);
        io.to(sessionId).emit('user_joined', { sessionId, clientId: socket.id });
      });

      // Receive message from user
      socket.on('send_message', (data) => {
        const sessionId = activeSessions.get(socket.id);
        if (sessionId) {
          io.to(sessionId).emit('new_message', {
            text: data.message,
            sender: 'USER',
            timestamp: new Date(),
            sessionId
          });
          console.log(`💬 Message from ${socket.id}: ${data.message}`);
        }
      });

      // Admin sends reply
      socket.on('admin_reply', (data) => {
        io.to(data.sessionId).emit('new_message', {
          text: data.message,
          sender: 'FOUNDER',
          timestamp: new Date(),
          sessionId: data.sessionId
        });
        console.log(`💬 Admin reply: ${data.message}`);
      });

      // Disconnect
      socket.on('disconnect', () => {
        const sessionId = activeSessions.get(socket.id);
        activeSessions.delete(socket.id);
        console.log(`❌ Client disconnected: ${socket.id}`);
        if (sessionId) {
          io.to(sessionId).emit('user_left', { sessionId, clientId: socket.id });
        }
      });

      // Error handling
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${serverPort} in use, trying next port`);
        const altPort = serverPort + 1;
        app.listen(altPort, () => console.log(`🚀 Server running on port ${altPort}`))
           .on('error', e => console.error('Still cannot start server:', e));
      } else {
        console.error('Server error:', err);
      }
    });
  } catch (error) {
    console.error('❌ Connection Failed:', error.message);
    process.exit(1);
  }
};

// ensure start is defined then call
if (typeof start === 'function') {
  start();
} else {
  console.error('start() is not defined');
}

