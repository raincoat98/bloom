import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

export function openDb(dataDir = process.env.DATA_DIR) {
  const dir = dataDir || path.join(process.cwd(), 'data');
  fs.mkdirSync(dir, { recursive: true });
  const db = new Database(path.join(dir, 'bloom.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cycles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      last_period_date TEXT NOT NULL,
      cycle_length INTEGER NOT NULL,
      period_length INTEGER NOT NULL,
      saved_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (user_id, last_period_date)
    );

    CREATE INDEX IF NOT EXISTS idx_cycles_user_saved ON cycles(user_id, saved_at);
  `);
  return db;
}