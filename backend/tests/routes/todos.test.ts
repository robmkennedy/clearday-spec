import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createDatabase } from '../../src/database.js';
import { createApp } from '../../src/app.js';

// Helper to create a fresh app with in-memory DB
function setup() {
  const db = createDatabase();
  const app = createApp(db);
  return { db, app };
}

describe('GET /api/todos', () => {
  it('should return 200 with empty array when no todos exist', async () => {
    const { app } = setup();
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should return 200 with seeded todos ordered by created_at ASC', async () => {
    const { db, app } = setup();
    db.prepare("INSERT INTO todos (description, created_at) VALUES ('First', '2026-01-01 00:00:00')").run();
    db.prepare("INSERT INTO todos (description, created_at) VALUES ('Second', '2026-01-02 00:00:00')").run();
    db.prepare("INSERT INTO todos (description, created_at) VALUES ('Third', '2026-01-03 00:00:00')").run();

    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0].description).toBe('First');
    expect(res.body[1].description).toBe('Second');
    expect(res.body[2].description).toBe('Third');
  });

  it('should return correct response shape matching Todo interface', async () => {
    const { db, app } = setup();
    db.prepare("INSERT INTO todos (description) VALUES ('Test todo')").run();

    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    const todo = res.body[0];
    expect(todo).toHaveProperty('id');
    expect(todo).toHaveProperty('description');
    expect(todo).toHaveProperty('completed');
    expect(todo).toHaveProperty('createdAt');
    expect(typeof todo.id).toBe('number');
    expect(typeof todo.description).toBe('string');
    expect(typeof todo.completed).toBe('boolean');
    expect(typeof todo.createdAt).toBe('string');
  });

  it('should convert completed integer to boolean', async () => {
    const { db, app } = setup();
    db.prepare("INSERT INTO todos (description, completed) VALUES ('Active', 0)").run();
    db.prepare("INSERT INTO todos (description, completed) VALUES ('Done', 1)").run();

    const res = await request(app).get('/api/todos');
    expect(res.body[0].completed).toBe(false);
    expect(res.body[1].completed).toBe(true);
  });
});

describe('POST /api/todos', () => {
  it('should return 201 with valid description', async () => {
    const { app } = setup();
    const res = await request(app)
      .post('/api/todos')
      .send({ description: 'New todo' });
    expect(res.status).toBe(201);
    expect(res.body.description).toBe('New todo');
    expect(res.body.completed).toBe(false);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('createdAt');
  });

  it('should return 400 for empty description', async () => {
    const { app } = setup();
    const res = await request(app)
      .post('/api/todos')
      .send({ description: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Description is required');
  });

  it('should return 400 for whitespace-only description', async () => {
    const { app } = setup();
    const res = await request(app)
      .post('/api/todos')
      .send({ description: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Description is required');
  });

  it('should return 400 for description > 300 chars', async () => {
    const { app } = setup();
    const res = await request(app)
      .post('/api/todos')
      .send({ description: 'a'.repeat(301) });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Description must be 300 characters or fewer');
  });

  it('should trim description whitespace', async () => {
    const { app } = setup();
    const res = await request(app)
      .post('/api/todos')
      .send({ description: '  Buy groceries  ' });
    expect(res.status).toBe(201);
    expect(res.body.description).toBe('Buy groceries');
  });

  it('should return 400 when description field is missing', async () => {
    const { app } = setup();
    const res = await request(app)
      .post('/api/todos')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Description is required');
  });
});

describe('PATCH /api/todos/:id/toggle', () => {
  it('should toggle completed 0 → 1', async () => {
    const { db, app } = setup();
    db.prepare("INSERT INTO todos (description) VALUES ('Test')").run();

    const res = await request(app).patch('/api/todos/1/toggle');
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('should toggle completed 1 → 0', async () => {
    const { db, app } = setup();
    db.prepare("INSERT INTO todos (description, completed) VALUES ('Test', 1)").run();

    const res = await request(app).patch('/api/todos/1/toggle');
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(false);
  });

  it('should return 404 for nonexistent id', async () => {
    const { app } = setup();
    const res = await request(app).patch('/api/todos/999/toggle');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Todo not found');
  });

  it('should return correct response shape', async () => {
    const { db, app } = setup();
    db.prepare("INSERT INTO todos (description) VALUES ('Test')").run();

    const res = await request(app).patch('/api/todos/1/toggle');
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('description');
    expect(res.body).toHaveProperty('completed');
    expect(res.body).toHaveProperty('createdAt');
  });
});

describe('DELETE /api/todos/:id', () => {
  it('should return 204 for successful delete', async () => {
    const { db, app } = setup();
    db.prepare("INSERT INTO todos (description) VALUES ('Test')").run();

    const res = await request(app).delete('/api/todos/1');
    expect(res.status).toBe(204);
  });

  it('should return 404 for nonexistent id', async () => {
    const { app } = setup();
    const res = await request(app).delete('/api/todos/999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Todo not found');
  });

  it('should not return deleted todo in GET after delete', async () => {
    const { db, app } = setup();
    db.prepare("INSERT INTO todos (description) VALUES ('Test')").run();

    await request(app).delete('/api/todos/1');
    const res = await request(app).get('/api/todos');
    expect(res.body).toEqual([]);
  });
});





