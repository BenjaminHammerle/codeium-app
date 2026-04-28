import { Task } from "../types/task";

export const loadTasks = async (): Promise<Task[]> => {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos");

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  return data.slice(0, 10).map((task) => ({
    id: Number(task.id),
    title: String(task.title),
    completed: Boolean(task.completed),
  }));
};

export const createTask = (title: string): Task => {
  return {
    id: Date.now(),
    title,
    completed: false,
  };
};
