import type { Todo, CreateTodoInput } from '../types/todo';

const BASE_URL = '/api/todos';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'Something went wrong. Please try again.';
    try {
      const body = await response.json();
      if (body.error) {
        errorMessage = body.error;
      }
    } catch {
      // Non-JSON response, use generic message
    }
    throw new Error(errorMessage);
  }
  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch(BASE_URL);
  return handleResponse<Todo[]>(response);
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleResponse<Todo>(response);
}

export async function toggleTodo(id: number): Promise<Todo> {
  const response = await fetch(`${BASE_URL}/${id}/toggle`, {
    method: 'PATCH',
  });
  return handleResponse<Todo>(response);
}

export async function deleteTodo(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<void>(response);
}

