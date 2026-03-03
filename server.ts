import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database('eagle.db');

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT,
    tech_stack TEXT
  );

  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    project_type TEXT,
    tech_stack TEXT,
    num_pages INTEGER,
    estimated_total REAL,
    target_audience TEXT,
    vision TEXT,
    design_refs TEXT,
    website_copy TEXT,
    extra_features TEXT,
    github_option TEXT,
    vercel_option TEXT,
    domain_config INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    text TEXT NOT NULL,
    is_bot INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Default settings
  INSERT OR IGNORE INTO settings (key, value) VALUES ('hero_headline', 'EAGLE: WE BUILD HIGH-END DIGITAL WEAPONS');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('hero_subtext', 'We build high-performance digital weapons for brands that refuse to be average. Performance, aesthetics, and pure speed.');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('site_status', 'Available');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('is_manual_chat', 'false');
`);

// migration: ensure new columns exist for target audience and vision
try {
  db.prepare("ALTER TABLE inquiries ADD COLUMN target_audience TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE inquiries ADD COLUMN vision TEXT").run();
} catch (e) {}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(express.json());

  // Socket.io Logic
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_session', (sessionId) => {
      socket.join(sessionId);
      console.log(`User joined session: ${sessionId}`);
    });

    socket.on('send_message', (data) => {
      // data: { session_id, sender, text, is_bot }
      const { session_id, sender, text, is_bot } = data;
      db.prepare('INSERT INTO chat_messages (session_id, sender, text, is_bot) VALUES (?, ?, ?, ?)').run(session_id, sender, text, is_bot ? 1 : 0);
      
      // Broadcast to everyone in the session (user and admin)
      io.to(session_id).emit('new_message', data);
      
      // Also notify admin of new activity if it's from a user
      if (!is_bot) {
        io.emit('admin_notification', { type: 'chat', session_id });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  // Settings Routes
  app.get('/api/settings', (req, res) => {
    const settings = db.prepare('SELECT * FROM settings').all();
    const settingsObj = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsObj);
  });

  app.post('/api/settings', (req, res) => {
    const { settings } = req.body;
    const update = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    const transaction = db.transaction((items) => {
      for (const [key, value] of Object.entries(items)) {
        update.run(key, value);
      }
    });
    transaction(settings);
    
    // Notify all clients if site status changed
    if (settings.site_status) {
      io.emit('status_update', settings.site_status);
    }
    
    res.json({ status: 'ok' });
  });

  // API Routes
  app.get('/api/projects', (req, res) => {
    const projects = db.prepare('SELECT * FROM projects ORDER BY id DESC').all();
    res.json(projects);
  });

  app.post('/api/projects', (req, res) => {
    const { title, description, image_url, category, tech_stack } = req.body;
    const info = db.prepare('INSERT INTO projects (title, description, image_url, category, tech_stack) VALUES (?, ?, ?, ?, ?)').run(title, description, image_url, category, tech_stack);
    res.json({ id: info.lastInsertRowid });
  });

  app.get('/api/inquiries', (req, res) => {
    const inquiries = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all();
    res.json(inquiries);
  });

  app.post('/api/inquiries', (req, res) => {
    const { 
      name, email, phone, project_type, tech_stack, num_pages, 
      estimated_total, target_audience, vision, design_refs, website_copy, extra_features, 
      github_option, vercel_option, domain_config 
    } = req.body;
    
    const info = db.prepare(`
      INSERT INTO inquiries (
        name, email, phone, project_type, tech_stack, num_pages, 
        estimated_total, target_audience, vision, design_refs, website_copy, extra_features, 
        github_option, vercel_option, domain_config
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name, email, phone, project_type, 
      Array.isArray(tech_stack) ? tech_stack.join(', ') : tech_stack, 
      num_pages, estimated_total, target_audience, vision,
      Array.isArray(design_refs) ? JSON.stringify(design_refs) : design_refs, 
      website_copy, extra_features, 
      github_option, vercel_option, 
      domain_config ? 1 : 0
    );
    res.json({ id: info.lastInsertRowid });
  });

  app.get('/api/chat/sessions', (req, res) => {
    const sessions = db.prepare('SELECT DISTINCT session_id FROM chat_messages ORDER BY timestamp DESC').all();
    res.json(sessions);
  });

  app.get('/api/chat/:sessionId', (req, res) => {
    const messages = db.prepare('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY timestamp ASC').all(req.params.sessionId);
    res.json(messages);
  });

  app.post('/api/chat', (req, res) => {
    const { session_id, sender, text, is_bot } = req.body;
    const info = db.prepare('INSERT INTO chat_messages (session_id, sender, text, is_bot) VALUES (?, ?, ?, ?)').run(session_id, sender, text, is_bot ? 1 : 0);
    res.json({ id: info.lastInsertRowid });
  });

  // Favicon route to prevent 404
  app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`EAGLE Server running on http://localhost:${PORT}`);
  });
}

startServer();
