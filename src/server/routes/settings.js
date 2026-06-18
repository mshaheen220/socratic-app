const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../auth');

const router = express.Router();

// Protect all settings routes
router.use(authenticateToken);

// Get user settings
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT theme, last_export FROM settings WHERE user_id = ?');
    const settings = stmt.get(req.user.id);
    res.json(settings || { theme: 'light', last_export: null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update user settings
router.put('/', (req, res) => {
  const { theme, last_export } = req.body;

  try {
    const stmt = db.prepare('UPDATE settings SET theme = ?, last_export = ? WHERE user_id = ?');
    const info = stmt.run(theme, last_export, req.user.id);
    res.json({ success: info.changes > 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;