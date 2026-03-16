import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const DB_PATH =
  process.env.AUTH_DB_PATH || path.join(process.cwd(), "data", "auth.db");

// Ensure directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    migrate(_db);
  }
  return _db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      email         TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      email_verified INTEGER DEFAULT 0,
      created_at    TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tokens (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type       TEXT NOT NULL,
      token      TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      used       INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens(token);
    CREATE INDEX IF NOT EXISTS idx_tokens_user_type ON tokens(user_id, type);
  `);
}
