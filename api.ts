import type { ITask } from "./types/tasks";

const baseUrl = "http://localhost:3001";

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "t_" + Math.random().toString(36).slice(2, 10);

export const getAllTodos = async (): Promise<ITask[]> => {
  const res = await fetch(`${baseUrl}/tasks?_sort=createdAt&_order=desc`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GET /tasks failed: ${res.status}`);
  return res.json();
};

export const addNewTodo = async (
  title: string,
  description?: string,
): Promise<ITask> => {
  const now = new Date().toISOString();
  const newTask: ITask = {
    id: genId(),
    title,
    description: description?.trim() || undefined,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
  const res = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTask),
  });
  if (!res.ok) throw new Error(`POST /tasks failed: ${res.status}`);
  return res.json();
};

export const updateTodo = async (
  id: string,
  updates: Partial<ITask>,
): Promise<ITask> => {
  const res = await fetch(`${baseUrl}/tasks/${id}`, {
    method: "PATCH", // 用 PATCH，避免 PUT 覆盖丢字段
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...updates, updatedAt: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(`PATCH /tasks/${id} failed: ${res.status}`);
  return res.json();
};

export const deleteTodo = async (id: string): Promise<void> => {
  const res = await fetch(`${baseUrl}/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`DELETE /tasks/${id} failed: ${res.status}`);
};
