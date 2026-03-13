import { Router } from 'express';
import type Database from 'better-sqlite3';

interface TodoRow {
  id: number;
  description: string;
  completed: number;
  created_at: string;
}

function mapRow(row: TodoRow) {
  return {
    id: row.id,
    description: row.description,
    completed: row.completed === 1,
    createdAt: row.created_at,
  };
}

export function createTodoRouter(db: Database.Database): Router {
  const router = Router();

  // GET /api/todos — list all todos
  router.get('/', (req, res, next) => {
    try {
      const rows = db.prepare('SELECT * FROM todos ORDER BY created_at ASC, id ASC').all() as TodoRow[];
      res.json(rows.map(mapRow));
    } catch (err) {
      next(err);
    }
  });

  // POST /api/todos — create a new todo
  router.post('/', (req, res, next) => {
    try {
      const rawDescription = req.body?.description;
      if (!rawDescription || typeof rawDescription !== 'string') {
        res.status(400).json({ error: 'Description is required' });
        return;
      }

      const description = rawDescription.trim();
      if (description.length === 0) {
        res.status(400).json({ error: 'Description is required' });
        return;
      }
      if (description.length > 300) {
        res.status(400).json({ error: 'Description must be 300 characters or fewer' });
        return;
      }

      const result = db.prepare('INSERT INTO todos (description) VALUES (?)').run(description);
      const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid) as TodoRow;
      res.status(201).json(mapRow(todo));
    } catch (err) {
      next(err);
    }
  });

  // PATCH /api/todos/:id/toggle — toggle completion status
  router.patch('/:id/toggle', (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id) as TodoRow | undefined;
      if (!existing) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }

      db.prepare('UPDATE todos SET completed = NOT completed WHERE id = ?').run(id);
      const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(id) as TodoRow;
      res.json(mapRow(updated));
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/todos/:id — permanently delete a todo
  router.delete('/:id', (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id) as TodoRow | undefined;
      if (!existing) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }

      db.prepare('DELETE FROM todos WHERE id = ?').run(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
}



