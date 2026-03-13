# Tasks: Full-Stack Todo Application

**Input**: Design documents from `/specs/001-fullstack-todo-app/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.md ✅, quickstart.md ✅

**Tests**: Included — plan.md constitution principle II ("Test-Driven Quality") requires every component and API route to ship with behavioral tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: TypeScript migration, project configuration, backend initialization

- [X] T001 Install TypeScript, concurrently, and type definition packages in root package.json (`npm install --save-dev typescript concurrently @types/react @types/react-dom`)
- [X] T002 [P] Create frontend tsconfig.json at project root with React 19 + Vite settings per research.md section 9
- [X] T003 [P] Create tsconfig.node.json at project root for Vite config file (target ES2022, module ESNext)
- [X] T004 [P] Create CSS Module type declaration in src/types/css.d.ts (`declare module '*.module.css'`)
- [X] T005 [P] Initialize backend/package.json with dependencies: express, better-sqlite3, cors; devDependencies: typescript, tsx, vitest, supertest, @types/express, @types/better-sqlite3, @types/cors, @types/supertest
- [X] T006 [P] Create backend/tsconfig.json per research.md section 4 (target ES2022, strict, moduleResolution bundler)
- [X] T007 Rename vite.config.js → vite.config.ts; add /api proxy to localhost:3001 per research.md section 7; update Vitest setupFiles path to ./src/setupTests.ts
- [X] T008 Migrate existing source files to TypeScript: rename src/index.jsx → src/index.tsx, src/App.jsx → src/components/App/App.tsx (move to component directory), src/App.css → src/components/App/App.module.css, src/setupTests.js → src/setupTests.ts; update index.html script src to /src/index.tsx; delete src/App.test.jsx and src/logo.svg (no longer needed)
- [X] T009 [P] Create shared TypeScript types in src/types/todo.ts: Todo interface and CreateTodoInput interface per data-model.md
- [X] T010 [P] Install and configure ESLint in root: install eslint, @eslint/js, typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh; create eslint.config.js with TypeScript + React rules; add `lint` script to root package.json (`eslint . --ext ts,tsx`)
- [X] T011 Update root package.json scripts: `dev` (concurrently runs dev:frontend + dev:backend), `dev:frontend` (vite), `dev:backend` (tsx watch backend/src/index.ts), `test` (vitest run), `test:watch` (vitest), `lint` (eslint)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend core infrastructure and frontend service layer that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T012 Create SQLite database module in backend/src/database.ts: singleton connection, CREATE TABLE IF NOT EXISTS todos schema per data-model.md, createDatabase factory for tests (in-memory :memory:), process.on('exit') cleanup
- [X] T013 [P] Create error handling middleware in backend/src/middleware/errors.ts: global Express error handler returning `{ error: string }` JSON per contracts/api.md
- [X] T014 Create Express app factory and server entry point in backend/src/index.ts: createApp(db) factory function, JSON body parser, mount todo routes at /api/todos, attach error middleware, listen on port 3001
- [X] T015 Create frontend API client service in src/services/todoApi.ts: base fetch wrapper with response.ok checking and JSON error parsing, export fetchTodos/createTodo/toggleTodo/deleteTodo function signatures per contracts/api.md
- [X] T016 Create useTodos custom hook shell in src/hooks/useTodos.ts: todos/loading/error state, useEffect to fetch on mount, return state and action function placeholders

**Checkpoint**: Foundation ready — backend serves on :3001, frontend proxies /api, service layer scaffolded. User story implementation can now begin.

---

## Phase 3: User Story 1 — View All Todos (Priority: P1) 🎯 MVP

**Goal**: User opens the app and sees all existing todos (or empty state, or loading indicator, or error message). This is the foundational read path.

**Independent Test**: Open the app → verify all persisted todos appear in a list with description and completion status; verify empty state when no todos exist; verify loading spinner during fetch; verify error message on server failure.

### Tests for User Story 1

> **Write these tests FIRST — ensure they FAIL before implementation**

- [X] T017 [P] [US1] Write database initialization tests in backend/tests/database.test.ts: verify table creation, schema constraints (description NOT NULL, length 1–300, completed default 0, created_at auto-set)
- [X] T018 [P] [US1] Write GET /api/todos route tests in backend/tests/routes/todos.test.ts: 200 with empty array, 200 with seeded todos ordered by created_at ASC, response shape matches Todo interface
- [X] T019 [P] [US1] Write LoadingSpinner component tests in src/components/LoadingSpinner/LoadingSpinner.test.tsx: renders spinner, accessible aria-label="Loading"
- [X] T020 [P] [US1] Write ErrorMessage component tests in src/components/ErrorMessage/ErrorMessage.test.tsx: renders error string, retry button fires callback, role="alert"
- [X] T021 [P] [US1] Write EmptyState component tests in src/components/EmptyState/EmptyState.test.tsx: renders encouragement message
- [X] T022 [P] [US1] Write TodoItem component tests (read-only) in src/components/TodoItem/TodoItem.test.tsx: renders description, displays completed status visually, uses semantic `<li>` element
- [X] T023 [P] [US1] Write TodoList component tests in src/components/TodoList/TodoList.test.tsx: renders list of todos, empty array renders nothing, passes correct props to TodoItem
- [X] T024 [P] [US1] Write App integration tests in src/components/App/App.test.tsx: mock todoApi, verify loading → loaded → display flow, verify error state with retry, verify empty state

### Implementation for User Story 1

- [X] T025 [US1] Implement GET /api/todos route handler in backend/src/routes/todos.ts: SELECT * FROM todos ORDER BY created_at ASC, id ASC; map SQLite rows to Todo JSON (completed int→boolean, created_at→camelCase createdAt)
- [X] T026 [P] [US1] Create LoadingSpinner component in src/components/LoadingSpinner/LoadingSpinner.tsx and src/components/LoadingSpinner/LoadingSpinner.module.css: accessible spinner with aria-label="Loading"
- [X] T027 [P] [US1] Create ErrorMessage component in src/components/ErrorMessage/ErrorMessage.tsx and src/components/ErrorMessage/ErrorMessage.module.css: display error string with retry button, role="alert"
- [X] T028 [P] [US1] Create EmptyState component in src/components/EmptyState/EmptyState.tsx and src/components/EmptyState/EmptyState.module.css: friendly message encouraging user to add a todo
- [X] T029 [US1] Create TodoItem component (read-only display) in src/components/TodoItem/TodoItem.tsx and src/components/TodoItem/TodoItem.module.css: render description, display completed status visually, use semantic `<li>` element
- [X] T030 [US1] Create TodoList component in src/components/TodoList/TodoList.tsx and src/components/TodoList/TodoList.module.css: render `<ul>` of TodoItem components, pass todo data via props
- [X] T031 [US1] Wire fetchTodos into useTodos hook and todoApi service in src/hooks/useTodos.ts and src/services/todoApi.ts: implement fetchTodos() fetch call, useEffect calls on mount, set todos/loading/error state
- [X] T032 [US1] Integrate TodoList, LoadingSpinner, ErrorMessage, EmptyState into App in src/components/App/App.tsx and src/components/App/App.module.css: call useTodos(), conditionally render loading/error/empty/list states

**Checkpoint**: User Story 1 is fully functional — user can view todos, see empty state, loading indicator, and error messages. MVP read path complete.

---

## Phase 4: User Story 2 — Add a New Todo (Priority: P1)

**Goal**: User types a description, submits it, and the new todo appears in the list. Validation prevents empty/too-long descriptions. Input preserved on error.

**Independent Test**: Enter a description → submit → verify new todo appears in the list with active status; submit empty → verify validation error; refresh page → verify persistence.

### Tests for User Story 2

- [X] T033 [P] [US2] Write POST /api/todos route tests in backend/tests/routes/todos.test.ts: 201 with valid description, 400 for empty/whitespace-only description, 400 for description >300 chars, response shape matches Todo interface, trimming behavior
- [X] T034 [P] [US2] Write TodoInput component tests in src/components/TodoInput/TodoInput.test.tsx: form submission calls onAdd with trimmed description, empty submission shows validation error, maxLength enforcement, input cleared after success, input preserved after error

### Implementation for User Story 2

- [X] T035 [US2] Implement POST /api/todos route handler with validation in backend/src/routes/todos.ts: trim description, validate 1–300 chars, INSERT INTO todos, return 201 with created Todo
- [X] T036 [US2] Create TodoInput component in src/components/TodoInput/TodoInput.tsx and src/components/TodoInput/TodoInput.module.css: form with visible `<label>`, text input (maxLength=300), submit button, inline validation error with aria-describedby and role="alert", Enter key submission
- [X] T037 [US2] Wire addTodo into useTodos hook and todoApi service in src/hooks/useTodos.ts and src/services/todoApi.ts: implement createTodo() POST call, addTodo action appends to state and re-sorts, handle errors (preserve input)
- [X] T038 [US2] Integrate TodoInput into App component in src/components/App/App.tsx: render above TodoList, pass addTodo from useTodos hook

**Checkpoint**: User Stories 1 AND 2 are complete — user can view existing todos and add new ones. Full read+write MVP.

---

## Phase 5: User Story 3 — Complete a Todo (Priority: P2)

**Goal**: User clicks a checkbox to toggle a todo between active and completed. Completed todos show strikethrough + muted color. Status persists across refreshes.

**Independent Test**: Click a todo's checkbox → verify visual change (strikethrough + muted); click again → verify it reverts; refresh → verify state persisted.

### Tests for User Story 3

- [X] T039 [P] [US3] Write PATCH /api/todos/:id/toggle route tests in backend/tests/routes/todos.test.ts: 200 toggles completed 0→1, 200 toggles completed 1→0, 404 for nonexistent id, response shape matches Todo interface
- [X] T040 [P] [US3] Write TodoItem toggle tests in src/components/TodoItem/TodoItem.test.tsx: checkbox toggle calls onToggle with todo id, completed styling applied (strikethrough + muted), uncompleted styling reverts, checkbox reflects completed state

### Implementation for User Story 3

- [X] T041 [US3] Implement PATCH /api/todos/:id/toggle route handler in backend/src/routes/todos.ts: UPDATE todos SET completed = NOT completed WHERE id = ?, return 404 if not found, return updated Todo
- [X] T042 [US3] Wire toggleTodo into useTodos hook and todoApi service in src/hooks/useTodos.ts and src/services/todoApi.ts: implement toggleTodo() PATCH call, update specific todo in state, revert on error
- [X] T043 [US3] Add checkbox toggle UI and completed styling to TodoItem in src/components/TodoItem/TodoItem.tsx and src/components/TodoItem/TodoItem.module.css: real `<input type="checkbox">` with `<label>`, strikethrough + muted color (#767676) for completed per research.md section 15, call onToggle prop

**Checkpoint**: User Stories 1–3 are complete — user can view, add, and toggle completion of todos.

---

## Phase 6: User Story 4 — Delete a Todo (Priority: P2)

**Goal**: User clicks a delete button to permanently remove a todo — no confirmation dialog. Deletion persists across refreshes.

**Independent Test**: Click a todo's delete button → verify todo disappears immediately with no confirmation; refresh → verify it does not reappear.

### Tests for User Story 4

- [X] T044 [P] [US4] Write DELETE /api/todos/:id route tests in backend/tests/routes/todos.test.ts: 204 for successful delete, 404 for nonexistent id, todo no longer returned by GET after delete
- [X] T045 [P] [US4] Write TodoItem delete tests in src/components/TodoItem/TodoItem.test.tsx: delete button calls onDelete with todo id, delete button has accessible aria-label="Delete {description}", single-click triggers delete (no confirmation)

### Implementation for User Story 4

- [X] T046 [US4] Implement DELETE /api/todos/:id route handler in backend/src/routes/todos.ts: DELETE FROM todos WHERE id = ?, return 404 if not found, return 204 No Content
- [X] T047 [US4] Wire deleteTodo into useTodos hook and todoApi service in src/hooks/useTodos.ts and src/services/todoApi.ts: implement deleteTodo() DELETE call, remove todo from state, restore on error
- [X] T048 [US4] Add delete button to TodoItem in src/components/TodoItem/TodoItem.tsx and src/components/TodoItem/TodoItem.module.css: accessible `<button>` with aria-label="Delete {description}", call onDelete prop

**Checkpoint**: User Stories 1–4 are complete — full CRUD functionality is working.

---

## Phase 7: User Story 5 — Responsive Cross-Device Experience (Priority: P3)

**Goal**: Application layout adapts gracefully across mobile (320px+), tablet (768px+), and desktop (1024px+) viewports. All interactions remain functional at every size.

**Independent Test**: Resize viewport to 320px, 768px, and 1024px+ and verify all CRUD interactions work, layout adapts, touch targets are comfortable, content is constrained on desktop (~640px max-width).

### Implementation for User Story 5

- [X] T049 [P] [US5] Add mobile-first responsive base and desktop max-width constraint to App in src/components/App/App.module.css: center content, max-width ~640px at ≥1024px
- [X] T050 [P] [US5] Add responsive styles to TodoInput in src/components/TodoInput/TodoInput.module.css: comfortable tap targets on mobile, adjusted padding/sizing at 768px+ breakpoint
- [X] T051 [P] [US5] Add responsive styles to TodoItem and TodoList in src/components/TodoItem/TodoItem.module.css and src/components/TodoList/TodoList.module.css: readable text, comfortable checkbox/button tap targets on mobile, adjusted spacing at breakpoints
- [X] T052 [US5] Test responsive layout across 320px, 768px, and 1024px+ viewports — verify all interactions and visual hierarchy

**Checkpoint**: All 5 user stories complete — the app is a fully functional, responsive full-stack todo application.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility refinements, UX hardening, final validation

- [X] T053 Add aria-live="polite" status region for screen reader announcements (todo added/deleted/error) in src/components/App/App.tsx
- [X] T054 Implement keyboard focus management in src/components/App/App.tsx and src/components/TodoItem/TodoItem.tsx: return focus to input after adding a todo, move focus to next/previous item after deleting
- [X] T055 Add request deduplication — disable submit button and todo action controls while in-flight (FR-014) in src/hooks/useTodos.ts, src/components/TodoInput/TodoInput.tsx, and src/components/TodoItem/TodoItem.tsx
- [X] T056 Run ESLint across entire project (`npm run lint`) and resolve all warnings/errors
- [X] T057 Run quickstart.md validation — start dev servers (`npm run dev`), create a todo, toggle completion, delete a todo, refresh page and verify persistence, test at mobile viewport

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**
- **User Story 1 (Phase 3)**: Depends on Phase 2 — first story to implement
- **User Story 2 (Phase 4)**: Depends on Phase 2 — can run in parallel with US1 but shares App.tsx
- **User Story 3 (Phase 5)**: Depends on Phase 2 — shares TodoItem.tsx with US1
- **User Story 4 (Phase 6)**: Depends on Phase 2 — shares TodoItem.tsx with US1/US3
- **User Story 5 (Phase 7)**: Depends on Phases 3–6 (styles the components built in those phases)
- **Polish (Phase 8)**: Depends on all user stories being complete

### Recommended Sequential Order (single developer)

```
Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (US4) → Phase 7 (US5) → Phase 8
```

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories — builds the read path and all display components
- **US2 (P1)**: Independent of US1 at the backend level; at the frontend level, benefits from App.tsx integration done in US1
- **US3 (P2)**: Extends TodoItem built in US1 (adds checkbox); independent backend endpoint
- **US4 (P2)**: Extends TodoItem built in US1/US3 (adds delete button); independent backend endpoint
- **US5 (P3)**: Styles components from US1–US4; depends on all component markup being finalized

### Within Each User Story

1. Tests written FIRST — must FAIL before implementation
2. Backend route tests before backend implementation
3. Frontend component tests before component implementation
4. API client + hook wiring before component integration
5. Component implementation before App integration
6. Story checkpoint before moving to next priority

### Parallel Opportunities

**Phase 1** (after T001 installs deps):
```
T002, T003, T004, T005, T006 — all create independent config files
T009, T010 — independent type file and ESLint config
```

**Phase 2** (after T012 creates database):
```
T013, T015 — error middleware and API client are independent files
```

**Phase 3** (within US1):
```
T017–T024 — all test files can be written in parallel
T026, T027, T028 — LoadingSpinner, ErrorMessage, EmptyState are independent components
```

**Phase 4** (within US2):
```
T033, T034 — backend route tests and frontend component tests are independent
```

**Phase 5** (within US3):
```
T039, T040 — backend route tests and frontend toggle tests are independent
```

**Phase 6** (within US4):
```
T044, T045 — backend route tests and frontend delete tests are independent
```

**Phase 7** (all responsive tasks):
```
T049, T050, T051 — each component's CSS is an independent file
```

---

## Parallel Example: User Story 1

```bash
# Step 1: Write ALL tests in parallel (tests FIRST)
Task T017: "Write database initialization tests in backend/tests/database.test.ts"
Task T018: "Write GET /api/todos route tests in backend/tests/routes/todos.test.ts"
Task T019: "Write LoadingSpinner component tests"
Task T020: "Write ErrorMessage component tests"
Task T021: "Write EmptyState component tests"
Task T022: "Write TodoItem component tests (read-only)"
Task T023: "Write TodoList component tests"
Task T024: "Write App integration tests"

# Step 2: Implement backend route
Task T025: "Implement GET /api/todos route handler in backend/src/routes/todos.ts"

# Step 3: Build display components in parallel
Task T026: "Create LoadingSpinner component"
Task T027: "Create ErrorMessage component"
Task T028: "Create EmptyState component"

# Step 4: Build list components (sequential — TodoItem before TodoList)
Task T029: "Create TodoItem component"
Task T030: "Create TodoList component"

# Step 5: Wire service layer and integrate
Task T031: "Wire fetchTodos into useTodos hook and todoApi service"
Task T032: "Integrate into App component"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (TypeScript migration, configs, backend init)
2. Complete Phase 2: Foundational (database, server, service layer)
3. Complete Phase 3: User Story 1 — View All Todos
4. **STOP and VALIDATE**: Seed database manually, open app, verify list displays
5. Delivers value: user can see all their todos

### Incremental Delivery

1. Setup + Foundational → Project infrastructure ready
2. **Add US1** → View todos → Test independently → **Read-only MVP** 🎯
3. **Add US2** → Add todos → Test independently → **Read+Write MVP**
4. **Add US3** → Toggle completion → Test independently → **Core workflow complete**
5. **Add US4** → Delete todos → Test independently → **Full CRUD**
6. **Add US5** → Responsive design → Test independently → **Cross-device ready**
7. Polish → Accessibility, deduplication, integration tests → **Production ready**

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (view) + User Story 2 (add) — these share App.tsx
   - Developer B: Backend routes for US3 + US4 (toggle + delete endpoints)
3. After US1 components exist:
   - Developer B: US3 + US4 frontend (extends TodoItem)
   - Developer A: US5 responsive styles
4. Both: Polish phase

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Backend route file (backend/src/routes/todos.ts) grows incrementally per story
- useTodos hook (src/hooks/useTodos.ts) and todoApi (src/services/todoApi.ts) grow incrementally per story
- TodoItem component grows incrementally: read-only (US1) → checkbox (US3) → delete button (US4)
- TodoItem tests grow incrementally: read-only assertions (US1) → toggle assertions (US3) → delete assertions (US4)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- `npm run dev` starts both servers; `npm test` runs frontend tests; `cd backend && npm test` runs backend tests
- `npm run lint` validates ESLint compliance (constitution requirement)

