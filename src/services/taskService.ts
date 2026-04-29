import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task } from "../types/task";

const TASKS_CACHE_KEY = "@task_cache";

const normalizeTask = (task: unknown): Task | null => {
  if (!task || typeof task !== "object") {
    return null;
  }

  const rawTask = task as Partial<Task>;

  if (rawTask.id === undefined || rawTask.title === undefined) {
    return null;
  }

  return {
    id: Number(rawTask.id),
    title: String(rawTask.title),
    completed: Boolean(rawTask.completed),
  };
};

const normalizeTasks = (tasks: unknown): Task[] => {
  if (!Array.isArray(tasks)) {
    return [];
  }

  return tasks.map(normalizeTask).filter((task): task is Task => task !== null);
};

export const loadTasksFromCache = async (): Promise<Task[]> => {
  const cachedData = await AsyncStorage.getItem(TASKS_CACHE_KEY);

  if (!cachedData) {
    return [];
  }

  try {
    return normalizeTasks(JSON.parse(cachedData));
  } catch {
    return [];
  }
};

const loadTasks = async (): Promise<Task[]> => {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos");

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  const data = await response.json();
  return normalizeTasks(data).slice(0, 10);
};

export const saveTasksToCache = async (tasks: Task[]): Promise<void> => {
  const cachedTasks = await loadTasksFromCache();

  if (cachedTasks.length > 0) {
    return cachedTasks;
  }

  const apiTasks = await loadTasksFromApi();
  await saveTasksToCache(apiTasks);

  return apiTasks;
};

export const filterTasks = (
  tasks: Task[],
  filter: "all" | "open" | "done",
): Task[] => {
  if (filter === "open") {
    return tasks.filter((task) => !task.completed);
  }

  if (filter === "done") {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
};

export const sortTasks = (
  tasks: Task[],
  sortOrder: "none" | "asc" | "desc",
): Task[] => {
  if (sortOrder === "asc") {
    return [...tasks].sort((a, b) => a.title.localeCompare(b.title));
  }

  if (sortOrder === "desc") {
    return [...tasks].sort((a, b) => b.title.localeCompare(a.title));
  }

  return tasks;
};

export const createTask = (title: string): Task => {
  return {
    id: Date.now(),
    title: title.trim(),
    completed: false,
  };
};

export const updateTask = async (
  id: number,
  title: string,
): Promise<Task | null> => {
  const trimmedTitle = task.title.trim();

  if (trimmedTitle.length < 3) {
    setValidationError("Edited title must have at least 3 characters.");
    return;
  }

  await taskService.updateTask(task.id, trimmedTitle);

  setTasks((currentTasks) =>
    currentTasks.map((currentTask) =>
      currentTask.id === task.id
        ? { ...currentTask, title: trimmedTitle }
        : currentTask,
    ),
  );

  await taskService.saveTasksToCache(tasks);

  setEditingTaskId(null);
  setEditedTitle("");
  setValidationError(null);
};

export const deleteTask = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/todos/${id}`,
      {
        method: "DELETE",
      },
    );

    return response.ok;
  } catch {
    return false;
  }
};
