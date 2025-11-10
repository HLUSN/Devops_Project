// Entry point for backend server
require('dotenv').config();
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')

const app = express()

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',  // Development
      'http://frontend:3000',   // Docker
      'http://127.0.0.1:3000'  // Alternative localhost
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions))
app.use(express.json());

const mongoose = require('mongoose');

// Fast-fail DB connection settings to avoid hanging when Mongo is unavailable
const mongoURI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/mydatabase';
const mongooseOptions = {
  // try to connect for up to 5 seconds
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
};

let dbConnected = false;
mongoose.connect(mongoURI, mongooseOptions)
  .then(() => {
    dbConnected = true;
    console.log('✅ Connected to MongoDB')
  })
  .catch(err => {
    dbConnected = false;
    console.log('❌ MongoDB error (will use in-memory fallback):', err && err.message ? err.message : err);
  });

mongoose.connection.on('disconnected', () => {
  dbConnected = false;
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  dbConnected = true;
  console.log('🔁 MongoDB reconnected');
});

// User model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user','admin'], default: 'user' }
});
const User = mongoose.model('User', userSchema);

// Tip (safety entry) model
const tipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
}, { timestamps: true });
const Tip = mongoose.model('Tip', tipSchema);

// JWT / auth helpers
// Security removed for a basic (dev) app: authentication/authorization are no-ops.
const ADMIN_KEY = process.env.ADMIN_KEY || 'dev_admin_key';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

// No-op authenticator: allows all requests for a simplified/demo app.
function authenticateToken(req, res, next) {
  // intentionally bypass authentication
  return next();
}

// No-op admin check: allows all admin actions in this simplified app.
function requireAdmin(req, res, next) {
  return next();
}

// Delete admin endpoint
app.post('/delete-admin', authenticateToken, requireAdmin, async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ success: false, message: 'Username required' });
  }
  const deleted = await User.deleteOne({ username });
  if (deleted.deletedCount > 0) {
    res.json({ success: true, message: 'Admin deleted' });
  } else {
    res.status(404).json({ success: false, message: 'Admin not found' });
  }
});

// In-memory fallback cache for tips when DB is unavailable
const tipsCache = [];

// --- AUTH ROUTES (JWT) ---
// Register
app.post('/register',
  body('username').isLength({ min: 3 }),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    
    const { username, password } = req.body;
    console.log('Registering user:', username, 'with password:', password); // Debug log
    
    try {
      const existing = await User.findOne({ username });
      if (existing) {
        console.log('Username already exists'); // Debug log
        return res.status(409).json({ success: false, message: 'Username already exists' });
      }
      
      // In the simplified app we store the password plaintext (no hashing)
      const role = 'user';
      const user = await User.create({ username, password, role });
      console.log('User created successfully'); // Debug log
      
      return res.json({ success: true, user: { username: user.username, role: user.role } });
    } catch (err) {
      console.log('Registration error:', err); // Debug log
      return res.status(500).json({ success: false, message: 'Error registering user' });
    }
  }
);

// Login
app.post('/login',
  body('username').exists(),
  body('password').exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    
    const { username, password } = req.body;
    console.log('Login attempt for username:', username); // Debug log
    
    try {
      const user = await User.findOne({ username });
      console.log('User found:', user ? 'yes' : 'no'); // Debug log
      
      if (!user) {
        console.log('User not found'); // Debug log
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      console.log('Stored password:', user.password); // Debug log
      console.log('Provided password:', password); // Debug log
      
      // Fix: Check if passwords match (plaintext comparison)
      if (password === user.password) {
        // Return a placeholder token so frontend can continue to use auth flow
        const token = 'no-auth-token';
        return res.json({ 
          success: true, 
          token, 
          user: { username: user.username, role: user.role } 
        });
      } else {
        console.log('Password mismatch'); // Debug log
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } catch (err) {
      console.log('Login error:', err); // Debug log
      return res.status(500).json({ success: false, message: 'Error logging in' });
    }
  }
);

// --- TIPS API (prefixed) ---
// Get all tips (public)
app.get('/api/tips', async (req, res) => {
  try {
    if (dbConnected) {
      const tips = await Tip.find().sort({ createdAt: -1 });
      return res.json({ success: true, tips });
    }
    return res.json({ success: true, tips: tipsCache.slice().reverse() });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching tips' });
  }
});

// Get single tip (public)
app.get('/api/tips/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (dbConnected) {
      const tip = await Tip.findById(id);
      if (!tip) return res.status(404).json({ success: false, message: 'Tip not found' });
      return res.json({ success: true, tip });
    }
    const tip = tipsCache.find(t => t._id === id);
    if (!tip) return res.status(404).json({ success: false, message: 'Tip not found' });
    return res.json({ success: true, tip });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching tip' });
  }
});

// Create tip (admin only)
app.post('/api/tips', authenticateToken, requireAdmin,
  body('title').isLength({ min: 3 }),
  body('content').isLength({ min: 10 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const { title, content } = req.body;
      if (dbConnected) {
        const tip = await Tip.create({ title, content });
        return res.json({ success: true, tip });
      }
      const tip = { _id: String(Date.now()), title, content, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      tipsCache.push(tip);
      return res.json({ success: true, tip, fallback: true });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Error creating tip' });
    }
  }
);

// Update tip (admin only)
app.put('/api/tips/:id', authenticateToken, requireAdmin,
  body('title').optional().isLength({ min: 3 }),
  body('content').optional().isLength({ min: 10 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      if (dbConnected) {
        const updated = await Tip.findByIdAndUpdate(id, { title, content }, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Tip not found' });
        return res.json({ success: true, tip: updated });
      }
      const idx = tipsCache.findIndex(t => t._id === id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Tip not found in fallback cache' });
      tipsCache[idx] = { ...tipsCache[idx], title: title || tipsCache[idx].title, content: content || tipsCache[idx].content, updatedAt: new Date().toISOString() };
      return res.json({ success: true, tip: tipsCache[idx], fallback: true });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Error updating tip' });
    }
  }
);

// Delete tip (admin only)
app.delete('/api/tips/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (dbConnected) {
      const deleted = await Tip.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Tip not found' });
      return res.json({ success: true, message: 'Tip deleted' });
    }
    const idx = tipsCache.findIndex(t => t._id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Tip not found in fallback cache' });
    tipsCache.splice(idx, 1);
    return res.json({ success: true, message: 'Tip deleted (fallback)' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error deleting tip' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

app.listen(4000, () => {
  console.log('listening for requests on port 4000')
})