const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticateAdmin } = require('../auth');

const router = express.Router();

// Protect all user management routes with admin middleware
router.use(authenticateAdmin);

router.get('/', (req, res) => {
  const stmt = db.prepare('SELECT id, username, role, created_at FROM users');
  res.json(stmt.all());
});

router.post('/', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
    const info = stmt.run(username, hashedPassword, role || 'user');
    
    // Give them default settings
    const settingsStmt = db.prepare('INSERT INTO settings (user_id) VALUES (?)');
    settingsStmt.run(info.lastInsertRowid);
    
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists or invalid data' });
  }
});

router.put('/:id', async (req, res) => {
  const { password, role } = req.body;
  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare('UPDATE users SET password_hash = ?, role = ? WHERE id = ?');
      stmt.run(hashedPassword, role || 'user', req.params.id);
    } else {
      const stmt = db.prepare('UPDATE users SET role = ? WHERE id = ?');
      stmt.run(role || 'user', req.params.id);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;