# Research: Full-Stack Todo Application

**Feature**: 001-fullstack-todo-app
**Date**: 2026-03-13
**Purpose**: Resolve all technical unknowns before design & contracts phase

---

## 1. Backend: better-sqlite3 vs sqlite3 (async)

**Decision**: Use `better-sqlite3` (synchronous API)

**Rationale**:
- `better-sqlite3` is 2–5× faster than the `sqlite3` async driver for typical workloads because it avoids the overhead of the libuv thread pool and callback serialization.
- Synchronous API is simpler to reason about in Express route handlers — no need for async/await wrappers around every DB call.
- For a single-user todo app with low concurrency, the synchronous blocking behavior is a non-issue.
- Well-maintained, excellent TypeScript type definitions (`@types/better-sqlite3`).
- In-memory mode (`:memory:`) makes testing trivial — no temp files to clean up.

**Alternatives considered**:
- `sqlite3` (async, callback-based): More complex API, slower for this use case, no benefit from async for a single-user app.
- `prisma` / `drizzle-orm`: ORM is overkill for a single-table CRUD app. Violates constitution principle V (Simplicity). Would add significant dependency weight.
- `knex`: Query builder is unnecessary for 4 simple SQL statements. Adds complexity without proportional benefit.

---

## 2. Backend: Schema Management

**Decision**: Inline `CREATE TABLE IF NOT EXISTS` in a `database.ts` init function, executed on server startup.

**Rationale**:
- Single table (`todos`), simple schema. Migration tooling (knex migrations, prisma migrate) is overkill.
- `CREATE TABLE IF NOT EXISTS` is idempotent and safe for restarts.
- Schema is version-controlled as code in `database.ts`.
- If the app grows to need migrations later, this can be refactored — YAGNI for now.

**Alternatives considered**:
- Migration files with a runner (e.g., `umzug`, `knex migrate`): Adds a dependency and operational complexity for a single-table app.
- SQL file loaded at startup: Marginally cleaner but adds a file I/O step; inline is simpler.

---

## 3. Backend: Connection Management

**Decision**: Singleton pattern — open one `Database` instance at module load, export it, close on process exit.

**Rationale**:
- `better-sqlite3` connections are lightweight and designed to be long-lived.
- SQLite supports only one writer at a time; a single connection avoids SQLITE_BUSY errors.
- Export the instance from `database.ts` so route handlers import it directly.
- Register `process.on('exit', () => db.close())` for clean shutdown.
- For tests, export a factory function `createDatabase(path)` that can create an in-memory instance.

**Alternatives considered**:
- Connection pool: Not applicable — SQLite is an embedded database, not a client-server DB.
- New connection per request: Wasteful and risks file locking issues.

---

## 4. Backend: TypeScript Configuration

**Decision**: Use `tsx` for development (fast transpile-and-run), `tsc` for type-checking only. No compilation to JS for dev.

**Rationale**:
- `tsx` (powered by esbuild) provides near-instant TypeScript execution without a build step.
- For production, the backend can be compiled with `tsc` to `dist/` or run directly with `tsx`.
- For a simple todo app, `tsx` in production is acceptable (negligible startup overhead).

**tsconfig.json for backend**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Alternatives considered**:
- `ts-node`: Slower startup than `tsx`, more configuration needed.
- Compile-first workflow (`tsc` then `node dist/`): Adds a build step to the dev loop; unnecessary for this scale.

---

## 5. Backend: Error Handling

**Decision**: Express error-handling middleware that catches all errors and returns consistent JSON error responses.

**Rationale**:
- All route handlers wrap DB operations in try/catch and call `next(error)`.
- Global error handler maps error types to HTTP status codes:
  - Validation errors → 400
  - Not found → 404
  - SQLite errors → 500
  - Unknown → 500
- Response format: `{ error: string }` — simple, consistent, easy for frontend to parse.

**Pattern**:
```typescript
// In route handler
try {
  const todo = db.prepare('SELECT ...').get(id);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  res.json(todo);
} catch (err) {
  next(err);
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
```

---

## 6. Backend: Testing Strategy

**Decision**: Use Vitest with in-memory SQLite databases for isolated, fast tests. Test Express routes via `supertest`.

**Rationale**:
- In-memory databases (`:memory:`) are created and destroyed per test — no file cleanup, no state leakage, sub-millisecond setup.
- `supertest` allows testing Express app instances without starting an HTTP server.
- Export a factory function `createApp(db)` from the Express setup module so tests can inject their own in-memory DB.

**Alternatives considered**:
- Test database file: Requires cleanup, risks test pollution.
- Mocking the database layer: Loses integration confidence; better to test against real SQLite.

---

## 7. Frontend: Vite Proxy Configuration

**Decision**: Configure Vite's `server.proxy` to forward `/api` requests to the Express backend on port 3001.

**Rationale**:
- Avoids CORS issues during development.
- Frontend code uses relative paths (`/api/todos`) in both dev and production.
- In production, a reverse proxy or the Express server itself can serve the built frontend.

**Configuration**:
```typescript
// vite.config.ts
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
},
```

---

## 8. Frontend: CSS Modules with TypeScript

**Decision**: Add a global type declaration file for CSS Module imports.

**Rationale**:
- TypeScript doesn't understand `.module.css` imports by default.
- A simple declaration file resolves all type errors.

**Implementation**:
```typescript
// src/types/css.d.ts
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
```

Vite already handles CSS Modules at build time — no additional plugin needed.

---

## 9. Frontend: JSX to TSX Migration

**Decision**: Migrate existing `.jsx` files to `.tsx`/`.ts` and add `tsconfig.json` at project root.

**Steps**:
1. Add `tsconfig.json` with React 19 + Vite-appropriate settings.
2. Rename `.jsx` → `.tsx`, `.js` → `.ts` (except config files).
3. Update `index.html` to reference `src/index.tsx`.
4. Rename `vite.config.js` → `vite.config.ts`.
5. Add type annotations incrementally — existing code is simple enough to type in one pass.

**tsconfig.json for frontend**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 10. Frontend: API Client Pattern

**Decision**: Thin `todoApi.ts` service module with typed fetch functions, consumed by a `useTodos` custom hook.

**Rationale**:
- Separates network concerns from component logic.
- `todoApi.ts` exports pure async functions: `fetchTodos()`, `createTodo(description)`, `toggleTodo(id)`, `deleteTodo(id)`.
- Each function handles response parsing and throws typed errors.
- `useTodos` hook manages state (todos, loading, error) and exposes action functions to components.
- Components never call fetch directly — they call hook-provided functions.

**Alternatives considered**:
- TanStack Query (react-query): Powerful but adds a dependency for 4 simple endpoints. Violates YAGNI. Can be adopted later if caching/refetching complexity grows.
- Redux / Zustand: Global state management is overkill for a single-screen app with one data type.

---

## 11. Frontend: Optimistic UI vs Wait-for-Server

**Decision**: Wait-for-server (non-optimistic) for all mutations, with loading indicators on individual actions.

**Rationale**:
- Simpler implementation — no rollback logic needed.
- The spec requires clear error messages when operations fail (FR-010). Wait-for-server naturally supports this: on error, the UI shows the error and the data remains unchanged.
- For a single-user, low-latency local app, server response times will be <100ms — the difference between optimistic and non-optimistic is imperceptible.
- Spec FR-014 requires preventing duplicate submissions — this is naturally enforced by disabling controls while a request is in flight.

**Alternatives considered**:
- Optimistic updates with rollback: More complex, risk of UI flicker on rollback. Not worth the complexity for a local-only app.

---

## 12. Frontend: Dev Script with Concurrently

**Decision**: Use `concurrently` to run Vite and Express from a single `npm run dev` command at the root.

**Configuration**:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "vite",
    "dev:backend": "tsx watch backend/src/index.ts"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

`tsx watch` provides automatic restart on backend file changes, similar to `nodemon` but built into `tsx`.

---

## 13. Accessibility: Semantic HTML for Todo List

**Decision**: Use `<ul>` with `<li>` elements, real `<input type="checkbox">` for completion, `<button>` for delete.

**Rationale**:
- `<ul>/<li>` is semantically correct for an unordered list of items (todos have no meaningful numeric order from the user's perspective, even though they're sorted by creation date).
- Real `<input type="checkbox">` provides native keyboard support (Space to toggle), screen reader announcement ("checkbox, checked/unchecked"), and form semantics for free.
- Each checkbox gets an associated `<label>` containing the todo description text.
- `<button>` for delete is keyboard-focusable and announced as an interactive element.

**Alternatives considered**:
- `<button aria-pressed>` for toggle: More work to replicate native checkbox behavior. Checkbox is simpler and more standard.
- `<ol>`: Implies a ranked/numbered list, which is misleading for todos.

---

## 14. Accessibility: Keyboard Navigation

**Decision**: Natural tab order through the form input, then each todo's checkbox and delete button.

**Rationale**:
- Tab moves through: input field → add button → first todo's checkbox → first todo's delete button → second todo's checkbox → etc.
- No custom keyboard handling needed — native HTML elements provide correct tab behavior.
- Focus management: after adding a todo, focus returns to the input field. After deleting, focus moves to the next item (or previous if last item was deleted).

---

## 15. Accessibility: Completed Todo Contrast

**Decision**: Use a muted text color that still meets 4.5:1 contrast ratio against the background, plus strikethrough as a secondary indicator.

**Rationale**:
- Constitution principle III requires color NOT be the sole means of conveying information. Strikethrough + color change = two indicators.
- Muted color example: `#767676` on white (`#FFFFFF`) gives exactly 4.54:1 — meets AA.
- The checkbox state (checked vs unchecked) provides a third, programmatic indicator.

---

## 16. Accessibility: Live Regions

**Decision**: Use an `aria-live="polite"` region for status announcements (todo added, deleted, errors).

**Rationale**:
- Screen readers won't automatically announce dynamic list changes.
- A visually hidden status region at the bottom of the page announces: "Todo added", "Todo deleted", "Error: could not save todo".
- `polite` (not `assertive`) so it doesn't interrupt the user's current activity.

---

## 17. Responsive Design: Breakpoints

**Decision**: Mobile-first approach with two breakpoints: 768px (tablet) and 1024px (desktop).

**Rationale**:
- Mobile-first CSS means the base styles target small screens (320px+).
- `@media (min-width: 768px)` adjusts padding and input sizing for tablets.
- `@media (min-width: 1024px)` constrains the content to a max-width (~640px) centered on screen.
- Media queries live inside each component's `.module.css` file — co-located with the component, per constitution principle I.

---

## 18. Form Input Accessibility

**Decision**: Visible `<label>` for the input, inline validation error announced via `aria-describedby`, submit via Enter key and explicit button.

**Implementation**:
```html
<form onSubmit={handleAdd}>
  <label htmlFor="new-todo">Add a new task</label>
  <input
    id="new-todo"
    type="text"
    maxLength={300}
    aria-describedby="input-error"
    aria-invalid={hasError}
  />
  <span id="input-error" role="alert">{errorMessage}</span>
  <button type="submit">Add</button>
</form>
```

**Rationale**:
- Visible label is better than placeholder-only (placeholder disappears on focus).
- `aria-describedby` links the error message to the input so screen readers announce it.
- `role="alert"` ensures the error message is announced immediately when it appears.
- `maxLength={300}` enforces the character limit in HTML (with JS validation as backup per FR-003).

