const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { generateToken } = require('../auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Make the first user an admin automatically if the database was just created
    const { count } = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const role = count === 0 ? 'admin' : 'user';

    const stmt = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
    const info = stmt.run(username, hashedPassword, role);

    // Initialize default settings for the new user
    const settingsStmt = db.prepare('INSERT INTO settings (user_id) VALUES (?)');
    settingsStmt.run(info.lastInsertRowid);

    const token = generateToken({ id: info.lastInsertRowid, username, role });
    res.json({ token, username, role });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  const user = stmt.get(username);

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user);
  res.json({ token, username, role: user.role });
});

module.exports = router;