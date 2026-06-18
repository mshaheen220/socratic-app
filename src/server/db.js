const Database = require('better-sqlite3');
const path = require('path');

// Initialize SQLite database
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Enforce strict Foreign Key constraints
db.pragma('foreign_keys = ON');

// Create tables without using separate migration scripts
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    user_id INTEGER PRIMARY KEY,
    theme TEXT DEFAULT 'light',
    last_export DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Seamless migration to add role to existing databases
try {
  db.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`);
} catch (err) {
  // Column already exists, safe to ignore
}

// Ensure the very first user created (you) gets admin rights automatically
try {
  db.exec(`UPDATE users SET role = 'admin' WHERE id = 1 AND role = 'user'`);
} catch (err) {
  // This will fail if the users table is empty, which is safe to ignore.
}

module.exports = db;