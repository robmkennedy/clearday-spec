import express from 'express';
import cors from 'cors';
import type Database from 'better-sqlite3';
import { createTodoRouter } from './routes/todos.js';
import { errorHandler } from './middleware/errors.js';
export function createApp(db: Database.Database) {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/todos', createTodoRouter(db));
  app.use(errorHandler);
  return app;
}
