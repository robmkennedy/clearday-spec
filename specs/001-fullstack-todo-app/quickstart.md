# Quickstart: Full-Stack Todo Application

**Feature**: 001-fullstack-todo-app
**Date**: 2026-03-13

---

## Prerequisites

- **Node.js**: 20+ (LTS recommended)
- **npm**: 10+ (ships with Node.js 20)
- **Git**: For branch management

---

## Initial Setup

### 1. Switch to feature branch

```bash
git checkout 001-fullstack-todo-app
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend && npm install && cd ..
```

### 4. TypeScript migration (if not yet done)

The existing project has `.jsx` files that need to be migrated to `.tsx`. This is tracked as a task in the implementation plan. After migration:

```bash
# Verify TypeScript compilation
npx tsc --noEmit           # Frontend
cd backend && npx tsc --noEmit && cd ..  # Backend
```

---

## Development

### Start both frontend and backend

```bash
npm run dev
```

This uses `concurrently` to run:
- **Vite dev server** on `http://localhost:3000` (frontend)
- **Express API server** on `http://localhost:3001` (backend)

Vite proxies `/api/*` requests to the Express server automatically.

### Start individually

```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

---

## Testing

### Run all tests

```bash
# Frontend tests (Vitest + React Testing Library)
npm test

# Backend tests (Vitest + supertest)
cd backend && npm test && cd ..
```

### Watch mode

```bash
# Frontend
npm run test:watch

# Backend
cd backend && npm run test:watch && cd ..
```

---

## Build for Production

### Build frontend

```bash
npm run build
# Output: build/ directory (static files)
```

### Run production server

The Express server can serve the built frontend in production:

```bash
cd backend && npm start
# Serves API on /api/* and static frontend on /*
# Access at http://localhost:3001
```

---

## Project Structure Overview

```
clearday-spec/
├── backend/                 # Express + SQLite API server
│   ├── src/
│   │   ├── index.ts         # Server entry point (port 3001)
│   │   ├── database.ts      # SQLite connection & schema
│   │   ├── routes/todos.ts  # CRUD route handlers
│   │   └── middleware/       # Error handling
│   ├── tests/               # Backend tests
│   ├── package.json
│   └── tsconfig.json
├── src/                     # React frontend
│   ├── components/          # UI components (PascalCase dirs)
│   ├── services/todoApi.ts  # API client
│   ├── hooks/useTodos.ts    # State management hook
│   ├── types/todo.ts        # Shared TypeScript types
│   └── index.tsx            # App entry point
├── vite.config.ts           # Vite + Vitest configuration
├── tsconfig.json            # Frontend TypeScript config
└── package.json             # Frontend deps + root scripts
```

---

## Key Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build + dev server + proxy + Vitest |
| `tsconfig.json` | Frontend TypeScript settings |
| `backend/tsconfig.json` | Backend TypeScript settings |
| `package.json` | Frontend deps + root scripts (`dev`, `build`, `test`) |
| `backend/package.json` | Backend deps + scripts |

---

## Database

SQLite database file is auto-created at `backend/data/todos.db` on first server start. No manual setup required.

- **Reset database**: Delete `backend/data/todos.db` and restart the server.
- **Tests**: Use in-memory SQLite (`:memory:`) — no file created.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/todos` | List all todos (oldest first) |
| `POST` | `/api/todos` | Create a todo (`{ "description": "..." }`) |
| `PATCH` | `/api/todos/:id/toggle` | Toggle completion |
| `DELETE` | `/api/todos/:id` | Delete permanently |

Full API documentation: [contracts/api.md](./contracts/api.md)

---

## New Dependencies to Install

### Frontend (root package.json)

```bash
npm install typescript concurrently --save-dev
npm install @types/react @types/react-dom --save-dev
```

### Backend (backend/package.json)

```bash
cd backend
npm init -y
npm install express better-sqlite3 cors
npm install --save-dev typescript tsx vitest supertest @types/express @types/better-sqlite3 @types/cors @types/supertest
```

