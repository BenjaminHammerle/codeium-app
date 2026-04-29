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

export const filterTasks = (tasks: Task[], filter: string | null): Task[] => {
  if (filter === "open") {
    return tasks.filter((task) => !task.completed);
  } else if (filter === "completed") {
    return tasks.filter((task) => task.completed);
  }
  return tasks;
};

export const sortTasks = (tasks: Task[], sort: string | null): Task[] => {
  if (sort === "asc") {
    return tasks.slice().sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === "desc") {
    return tasks.slice().sort((a, b) => b.title.localeCompare(a.title));
  }
  return tasks;
};

export const createTask = (title: string): Task => {
  return {
    id: Date.now(),
    title,
    completed: false,
  };
};

export const updateTask = async (id: number, title: string): Promise<void> => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/todos/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update task");
  }
};

export const deleteTask = async (id: number) => {
  try {
    await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
      method: "DELETE",
    });
    return true;
  } catch (error) {
    return false;
  }
};
