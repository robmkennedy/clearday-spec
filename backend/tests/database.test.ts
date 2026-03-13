import { describe, it, expect } from 'vitest';
import { createDatabase } from '../src/database.js';

describe('Database initialization', () => {
  it('should create the todos table', () => {
    const db = createDatabase();
    const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='todos'").get() as { name: string } | undefined;
    expect(tableInfo).toBeDefined();
    expect(tableInfo!.name).toBe('todos');
    db.close();
  });

  it('should have correct schema columns', () => {
    const db = createDatabase();
    const columns = db.prepare('PRAGMA table_info(todos)').all() as Array<{ name: string; type: string; notnull: number; dflt_value: string | null }>;
    const columnNames = columns.map(c => c.name);
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('description');
    expect(columnNames).toContain('completed');
    expect(columnNames).toContain('created_at');
    db.close();
  });

  it('should enforce NOT NULL on description', () => {
    const db = createDatabase();
    expect(() => {
      db.prepare('INSERT INTO todos (description) VALUES (NULL)').run();
    }).toThrow();
    db.close();
  });

  it('should enforce description length >= 1', () => {
    const db = createDatabase();
    expect(() => {
      db.prepare("INSERT INTO todos (description) VALUES ('')").run();
    }).toThrow();
    db.close();
  });

  it('should enforce description length <= 300', () => {
    const db = createDatabase();
    const longDescription = 'a'.repeat(301);
    expect(() => {
      db.prepare('INSERT INTO todos (description) VALUES (?)').run(longDescription);
    }).toThrow();
    db.close();
  });

  it('should allow description of exactly 300 chars', () => {
    const db = createDatabase();
    const maxDescription = 'a'.repeat(300);
    const result = db.prepare('INSERT INTO todos (description) VALUES (?)').run(maxDescription);
    expect(result.changes).toBe(1);
    db.close();
  });

  it('should default completed to 0', () => {
    const db = createDatabase();
    db.prepare("INSERT INTO todos (description) VALUES ('Test')").run();
    const todo = db.prepare('SELECT completed FROM todos WHERE id = 1').get() as { completed: number };
    expect(todo.completed).toBe(0);
    db.close();
  });

  it('should auto-set created_at', () => {
    const db = createDatabase();
    db.prepare("INSERT INTO todos (description) VALUES ('Test')").run();
    const todo = db.prepare('SELECT created_at FROM todos WHERE id = 1').get() as { created_at: string };
    expect(todo.created_at).toBeDefined();
    expect(todo.created_at).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    db.close();
  });

  it('should enforce completed is 0 or 1', () => {
    const db = createDatabase();
    expect(() => {
      db.prepare("INSERT INTO todos (description, completed) VALUES ('Test', 2)").run();
    }).toThrow();
    db.close();
  });
});

