const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../auth');

const router = express.Router();

// Apply auth middleware to all session routes so users only see their own data
router.use(authenticateToken);

// Get all sessions for the authenticated user
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT data FROM sessions WHERE user_id = ?');
    const rows = stmt.all(req.user.id);
    // Parse the JSON data back into objects for the frontend
    const sessions = rows.map(row => JSON.parse(row.data));
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Add or update a session
router.post('/', (req, res) => {
  const session = req.body;
  if (!session.id) return res.status(400).json({ error: 'Session ID is required' });

  try {
    const stmt = db.prepare(`
      INSERT INTO sessions (id, user_id, data) 
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET 
        user_id = excluded.user_id,
        data = excluded.data,
        updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(session.id.toString(), req.user.id, JSON.stringify(session));
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save session' });
  }
});

// Delete a session
router.delete('/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM sessions WHERE id = ? AND user_id = ?');
  const info = stmt.run(req.params.id, req.user.id);
  res.json({ success: info.changes > 0 });
});

module.exports = router;