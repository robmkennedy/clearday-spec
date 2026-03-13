import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SCHEMA = `
CREATE TABLE IF NOT EXISTS todos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT    NOT NULL CHECK(length(description) >= 1 AND length(description) <= 300),
  completed   INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0, 1)),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
`;

export function createDatabase(dbPath: string = ':memory:'): Database.Database {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(SCHEMA);
  return db;
}

// Default singleton for production use
let defaultDb: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!defaultDb) {
    const dataDir = path.join(__dirname, '..', 'data');
    const dbPath = path.join(dataDir, 'todos.db');
    defaultDb = createDatabase(dbPath);
  }
  return defaultDb;
}

process.on('exit', () => {
  defaultDb?.close();
});

