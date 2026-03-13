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

