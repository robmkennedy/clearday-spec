# API Contract: Full-Stack Todo Application

**Feature**: 001-fullstack-todo-app
**Date**: 2026-03-13
**Base URL**: `/api` (proxied via Vite in dev, served directly in production)
**Content-Type**: `application/json` (all request and response bodies)

---

## Overview

RESTful API for managing todos. Four endpoints covering full CRUD lifecycle.

| Method | Path | Description | Spec Ref |
|--------|------|-------------|----------|
| `GET` | `/api/todos` | List all todos | FR-001 |
| `POST` | `/api/todos` | Create a new todo | FR-002, FR-003 |
| `PATCH` | `/api/todos/:id/toggle` | Toggle completion status | FR-004 |
| `DELETE` | `/api/todos/:id` | Delete a todo permanently | FR-006 |

---

## Common Types

### Todo (response object)

```json
{
  "id": 1,
  "description": "Buy groceries",
  "completed": false,
  "createdAt": "2026-03-13T10:30:00Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Unique identifier (auto-generated) |
| `description` | `string` | Task description (1–300 chars) |
| `completed` | `boolean` | `true` if completed, `false` if active |
| `createdAt` | `string` | ISO 8601 UTC timestamp of creation |

### Error (response object)

```json
{
  "error": "Description is required"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `error` | `string` | Human-readable error message |

---

## Endpoints

### GET /api/todos

List all todos, ordered oldest first.

**Request**: No body, no query parameters.

**Response**:

| Status | Body | Condition |
|--------|------|-----------|
| `200 OK` | `Todo[]` | Always (empty array if no todos) |
| `500 Internal Server Error` | `Error` | Database failure |

**Example Response** (200):
```json
[
  {
    "id": 1,
    "description": "Buy groceries",
    "completed": false,
    "createdAt": "2026-03-13T10:30:00Z"
  },
  {
    "id": 2,
    "description": "Walk the dog",
    "completed": true,
    "createdAt": "2026-03-13T11:00:00Z"
  }
]
```

**Example Response** (200, empty):
```json
[]
```

**Spec mapping**: FR-001 (display all existing todos, ordered oldest first), FR-008 (frontend handles empty array as empty state).

---

### POST /api/todos

Create a new todo.

**Request Body**:
```json
{
  "description": "Buy groceries"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `description` | `string` | Yes | Non-empty after trimming, 1–300 characters |

**Response**:

| Status | Body | Condition |
|--------|------|-----------|
| `201 Created` | `Todo` | Successfully created |
| `400 Bad Request` | `Error` | Validation failure (empty, too long, missing field) |
| `500 Internal Server Error` | `Error` | Database failure |

**Example Response** (201):
```json
{
  "id": 3,
  "description": "Buy groceries",
  "completed": false,
  "createdAt": "2026-03-13T14:22:05Z"
}
```

**Example Response** (400 — empty description):
```json
{
  "error": "Description is required"
}
```

**Example Response** (400 — too long):
```json
{
  "error": "Description must be 300 characters or fewer"
}
```

**Validation rules**:
1. `description` field must be present in request body.
2. `description` is trimmed of leading/trailing whitespace.
3. After trimming, `description` must be at least 1 character.
4. After trimming, `description` must not exceed 300 characters.

**Spec mapping**: FR-002 (create todo), FR-003 (validation), FR-011 (creation timestamp auto-set).

---

### PATCH /api/todos/:id/toggle

Toggle the completion status of a todo (active ↔ completed).

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `number` | Todo ID |

**Request Body**: None.

**Response**:

| Status | Body | Condition |
|--------|------|-----------|
| `200 OK` | `Todo` | Successfully toggled |
| `404 Not Found` | `Error` | Todo with given ID does not exist |
| `500 Internal Server Error` | `Error` | Database failure |

**Example Response** (200):
```json
{
  "id": 1,
  "description": "Buy groceries",
  "completed": true,
  "createdAt": "2026-03-13T10:30:00Z"
}
```

**Example Response** (404):
```json
{
  "error": "Todo not found"
}
```

**Implementation note**: The server performs `UPDATE todos SET completed = NOT completed WHERE id = ?` and returns the updated row. The client does not send the desired state — the server toggles the current state. This prevents race conditions if two requests are in flight.

**Spec mapping**: FR-004 (toggle completion), FR-005 (visual distinction handled by frontend based on `completed` field).

---

### DELETE /api/todos/:id

Permanently delete a todo.

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `number` | Todo ID |

**Request Body**: None.

**Response**:

| Status | Body | Condition |
|--------|------|-----------|
| `204 No Content` | *(empty)* | Successfully deleted |
| `404 Not Found` | `Error` | Todo with given ID does not exist |
| `500 Internal Server Error` | `Error` | Database failure |

**Example Response** (404):
```json
{
  "error": "Todo not found"
}
```

**Spec mapping**: FR-006 (permanent delete, single click, no confirmation), FR-007 (persistence — deleted todo does not reappear on refresh).

---

## Cross-Cutting Concerns

### Error Handling (FR-010)

All error responses use the `Error` format (`{ "error": "..." }`). The frontend should:
1. Check `response.ok` on every fetch call.
2. If not OK, parse the JSON body and display the `error` field to the user.
3. If the response cannot be parsed (network error, non-JSON response), display a generic "Something went wrong. Please try again." message.

### CORS

Not required in development (Vite proxy handles `/api` forwarding). In production, if the frontend is served by a different origin than the API, CORS headers should be added. For the initial single-user deployment, the Express server will serve the built frontend static files, making CORS unnecessary.

### Request Deduplication (FR-014)

The API is stateless and does not enforce idempotency keys. Preventing duplicate submissions is the frontend's responsibility:
- Disable the "Add" button while a create request is in flight.
- Disable checkbox/delete controls on a specific todo while its toggle/delete request is in flight.

