# Data Model: Full-Stack Todo Application

**Feature**: 001-fullstack-todo-app
**Date**: 2026-03-13
**Source**: [spec.md](./spec.md) Key Entities section + Functional Requirements

---

## Entities

### Todo

The single entity in the system. Represents a task the user wants to track.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `INTEGER` (SQLite) / `number` (TS) | Primary key, autoincrement | Unique identifier for the todo |
| `description` | `TEXT` (SQLite) / `string` (TS) | NOT NULL, 1–300 chars | User-provided task description (FR-003) |
| `completed` | `INTEGER` (SQLite: 0/1) / `boolean` (TS) | NOT NULL, default 0 | Completion status — false=active, true=completed (FR-004) |
| `createdAt` | `TEXT` (SQLite: ISO 8601) / `string` (TS) | NOT NULL, set on insert | Creation timestamp, auto-generated (FR-011) |

### SQLite Schema

```sql
CREATE TABLE IF NOT EXISTS todos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT    NOT NULL CHECK(length(description) >= 1 AND length(description) <= 300),
  completed   INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0, 1)),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

**Notes**:
- `CHECK` constraints enforce business rules at the database level as a safety net. The API layer performs validation first and returns user-friendly errors.
- `created_at` uses SQLite's `datetime('now')` which returns UTC in ISO 8601 format (`YYYY-MM-DD HH:MM:SS`).
- `AUTOINCREMENT` ensures IDs are never reused after deletion, which prevents potential confusion if the client caches old IDs.
- SQLite stores booleans as integers (0/1). The API layer converts to/from `boolean` for the frontend.

### TypeScript Interface (shared)

```typescript
// src/types/todo.ts (used by both frontend and API contract)

/** Todo as returned by the API (JSON over HTTP) */
export interface Todo {
  id: number;
  description: string;
  completed: boolean;
  createdAt: string; // ISO 8601 UTC timestamp
}

/** Payload for creating a new todo */
export interface CreateTodoInput {
  description: string; // 1–300 chars, trimmed, non-empty
}
```

---

## Validation Rules

| Rule | Source | Enforced At |
|------|--------|-------------|
| Description must be non-empty after trimming | FR-003 | Frontend (input), API (400 error), DB (CHECK constraint) |
| Description must be ≤ 300 characters | FR-003 | Frontend (`maxLength` + JS check), API (400 error), DB (CHECK constraint) |
| Completed must be boolean (0 or 1) | FR-004 | API (toggle endpoint controls this), DB (CHECK constraint) |
| ID must exist for toggle/delete operations | FR-004, FR-006 | API (404 if not found) |
| CreatedAt is system-generated, not user-editable | FR-011, Assumptions | API (ignores any client-provided value), DB (DEFAULT) |

---

## State Transitions

```text
┌─────────────┐   toggle    ┌─────────────┐
│   Active     │ ──────────→ │  Completed   │
│ completed=0  │ ←────────── │ completed=1  │
└─────────────┘   toggle    └─────────────┘
       │                            │
       │         delete             │         delete
       ▼                            ▼
┌─────────────┐             ┌─────────────┐
│  Deleted     │             │  Deleted     │
│ (row removed)│             │ (row removed)│
└─────────────┘             └─────────────┘
```

- **Active → Completed**: Toggle sets `completed = 1`. Visual change: strikethrough + muted color.
- **Completed → Active**: Toggle sets `completed = 0`. Visual change: returns to normal styling.
- **Active/Completed → Deleted**: Hard delete (`DELETE FROM todos WHERE id = ?`). Row is permanently removed. No soft-delete, no undo (per spec: "no confirmation dialog or undo step").

---

## Ordering

Todos are displayed **oldest first** (earliest created at top) per FR-001 and the clarification session.

```sql
SELECT * FROM todos ORDER BY created_at ASC, id ASC;
```

The secondary sort by `id` ensures deterministic ordering when multiple todos share the same second-precision timestamp.

---

## Data Flow

```text
User Action → Component → useTodos hook → todoApi service → HTTP → Express route → SQLite
                                                                         ↓
User sees ← Component ← useTodos hook ← todoApi service ← HTTP ← Express route ← SQLite
```

1. **Create**: User types description → `TodoInput` calls `addTodo(description)` → `POST /api/todos` → `INSERT INTO todos` → returns new Todo → prepended to state (but list re-sorted by createdAt).
2. **Read**: App mounts → `useTodos` calls `fetchTodos()` → `GET /api/todos` → `SELECT * FROM todos ORDER BY created_at ASC` → returns Todo[] → set state.
3. **Toggle**: User clicks checkbox → `TodoItem` calls `toggleTodo(id)` → `PATCH /api/todos/:id/toggle` → `UPDATE todos SET completed = NOT completed` → returns updated Todo → update in state.
4. **Delete**: User clicks delete → `TodoItem` calls `deleteTodo(id)` → `DELETE /api/todos/:id` → `DELETE FROM todos` → returns 204 → remove from state.

