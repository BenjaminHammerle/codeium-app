import AsyncStorage from "@react-native-async-storage/async-storage";

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface TaskResponse {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

const API_URL = "https://jsonplaceholder.typicode.com/todos";

export async function getTasks(): Promise<Task[]> {
  try {
    const response = await fetch(`${API_URL}?_limit=10`);
    const tasks = await response.json();
    return tasks.map((task: TaskResponse) => ({
      id: task.id,
      title: task.title,
      completed: task.completed,
    }));
  } catch (error) {
    throw new Error("Failed to fetch tasks");
  }
}

export async function saveTasks(tasks: Task[]) {
  try {
    const serializedTasks = JSON.stringify(tasks);
    await AsyncStorage.setItem("tasks", serializedTasks);
  } catch (error) {
    throw new Error("Failed to save tasks");
  }
}

export async function loadTasks(): Promise<Task[]> {
  try {
    const serializedTasks = await AsyncStorage.getItem("tasks");
    if (serializedTasks !== null) {
      return JSON.parse(serializedTasks);
    }
    return [];
  } catch (error) {
    throw new Error("Failed to load tasks");
  }
}
