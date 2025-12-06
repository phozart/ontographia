import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'app.db');

function ensureDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','editor','viewer')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_login_at TEXT,
      login_count INTEGER DEFAULT 0
    );
  `);
}

let instance;

export function getDb() {
  if (instance) return instance;
  ensureDir();
  try {
    instance = new Database(DB_PATH);
    initSchema(instance);
  } catch (err) {
    console.error('Failed to open DB at', DB_PATH, 'falling back to in-memory DB', err);
    instance = new Database(':memory:');
    initSchema(instance);
  }
  return instance;
}
