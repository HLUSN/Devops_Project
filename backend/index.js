// ...existing code...
// ...existing code...
const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json());

const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase';
mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.log('❌ MongoDB error:', err));

// User model
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model('User', userSchema);

// Delete admin endpoint
app.post('/delete-admin', async (req, res) => {
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

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'Username already exists' });
  }
  const newUser = await User.create({ username, password });
  res.json({ success: true, message: 'Signup successful', user: { username: newUser.username } });
});

app.get('/', (req, res) => {
  res.json([
    {
      "id":"1",
      "title":"Book Review: The Name of the Wind"
    },
    {
      "id":"2",
      "title":"Game Review: Pokemon Brillian Diamond"
    },
    {
      "id":"3",
      "title":"Show Review: Alice in Borderland"
    }
  ])
})

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && user.password === password) {
    res.json({ success: true, message: 'Login successful', user: { username: user.username } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.listen(4000, () => {
  console.log('listening for requests on port 4000')
})