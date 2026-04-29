import React, { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LoginService } from "../services/authService";
import {
  createTask,
  deleteTask,
  filterTasks,
  loadTasks,
  saveTasksToCache,
  sortTasks,
  updateTask,
} from "../services/taskService";
import { Task } from "../types/task";

interface HomeScreenProps {
  onLogout: () => Promise<void> | void;
}

type TaskFilter = "all" | "open" | "done";
type SortOrder = "none" | "asc" | "desc";

const HomeScreen = ({ onLogout }: HomeScreenProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState("");

  const [filter, setFilter] = useState<TaskFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeout = setTimeout(() => setSuccessMessage(null), 2000);
    return () => clearTimeout(timeout);
  }, [successMessage]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const loadedTasks = await loadTasks();
      setTasks(loadedTasks);
    } catch (requestError) {
      console.error("Error loading tasks", requestError);
      setError("Error loading tasks.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await LoginService.removeToken();
    await onLogout();
  };

  const handleCreateTask = async () => {
    const trimmedTitle = title.trim();

    if (trimmedTitle.length < 3) {
      setValidationError("Title must have at least 3 characters.");
      return;
    }

    const newTask = createTask(trimmedTitle);
    const updatedTasks = [newTask, ...tasks];

    setTasks(updatedTasks);
    await saveTasksToCache(updatedTasks);

    setTitle("");
    setValidationError(null);
    setSuccessMessage("Task created.");
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditedTitle(task.title);
    setValidationError(null);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditedTitle("");
    setValidationError(null);
  };

  const saveEditedTask = async (task: Task) => {
    const trimmedTitle = editedTitle.trim();

    if (trimmedTitle.length < 3) {
      setValidationError("Edited title must have at least 3 characters.");
      return;
    }

    await updateTask(task.id, trimmedTitle);

    const updatedTasks = tasks.map((currentTask) =>
      currentTask.id === task.id
        ? { ...currentTask, title: trimmedTitle }
        : currentTask,
    );

    setTasks(updatedTasks);
    await saveTasksToCache(updatedTasks);

    setEditingTaskId(null);
    setEditedTitle("");
    setValidationError(null);
    setSuccessMessage("Task updated.");
  };

  const handleDeleteTask = async (taskId: number) => {
    setLoading(true);
    setError(null);

    try {
      await deleteTask(taskId);

      const updatedTasks = tasks.filter((task) => task.id !== taskId);

      setTasks(updatedTasks);
      await saveTasksToCache(updatedTasks);
      setSuccessMessage("Task deleted.");
    } catch (deleteError) {
      console.error("Error deleting task", deleteError);
      setError("Error deleting task.");
    } finally {
      setLoading(false);
    }
  };

  const displayedTasks = sortTasks(filterTasks(tasks, filter), sortOrder);

  const renderTask = ({ item }: { item: Task }) => {
    const isEditing = editingTaskId === item.id;

    return (
      <View style={styles.taskItemContainer}>
        {isEditing ? (
          <>
            <TextInput
              style={styles.formInput}
              value={editedTitle}
              onChangeText={setEditedTitle}
              placeholder="Edit task title"
            />
            <View style={styles.buttonRow}>
              <Button title="Save" onPress={() => saveEditedTask(item)} />
              <Button title="Cancel" onPress={cancelEditing} />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskStatus}>
              {item.completed ? "Done" : "Open"}
            </Text>
            <View style={styles.buttonRow}>
              <Button title="Edit" onPress={() => startEditing(item)} />
              <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
                <Text style={styles.taskDeleteButton}>Delete</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logged in successfully</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.formInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Task title"
        />
        <Button
          title="Add task"
          onPress={handleCreateTask}
          disabled={loading}
        />
      </View>

      <View style={styles.filterSortContainer}>
        <Text style={styles.filterSortLabel}>Filter</Text>
        <View style={styles.filterSortButtons}>
          <TouchableOpacity onPress={() => setFilter("all")}>
            <Text style={styles.filterSortButton}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilter("open")}>
            <Text style={styles.filterSortButton}>Open</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilter("done")}>
            <Text style={styles.filterSortButton}>Done</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.filterSortLabel}>Sort</Text>
        <View style={styles.filterSortButtons}>
          <TouchableOpacity onPress={() => setSortOrder("none")}>
            <Text style={styles.filterSortButton}>None</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSortOrder("asc")}>
            <Text style={styles.filterSortButton}>Title A-Z</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSortOrder("desc")}>
            <Text style={styles.filterSortButton}>Title Z-A</Text>
          </TouchableOpacity>
        </View>
      </View>

      {validationError ? (
        <Text style={styles.validationError}>{validationError}</Text>
      ) : null}

      {loading ? <Text>Loading tasks...</Text> : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {successMessage ? (
        <Text style={styles.successMessage}>{successMessage}</Text>
      ) : null}

      {!loading && !error && displayedTasks.length === 0 ? (
        <Text>No tasks available</Text>
      ) : null}

      <FlatList
        data={displayedTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTask}
        style={styles.taskList}
        contentContainerStyle={styles.taskListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      <View style={styles.logoutContainer}>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  formContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  formInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "gray",
    marginRight: 8,
    paddingHorizontal: 8,
  },
  validationError: {
    color: "red",
    marginBottom: 8,
  },
  errorText: {
    color: "red",
    marginBottom: 8,
  },
  successMessage: {
    color: "green",
    marginBottom: 8,
  },
  filterSortContainer: {
    marginVertical: 12,
  },
  filterSortLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  filterSortButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  filterSortButton: {
    color: "blue",
    textDecorationLine: "underline",
    marginRight: 12,
    marginBottom: 4,
  },
  taskList: {
    flex: 1,
    marginTop: 12,
  },
  taskListContent: {
    paddingBottom: 24,
  },
  taskItemContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  taskStatus: {
    fontSize: 14,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  taskDeleteButton: {
    color: "red",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  logoutContainer: {
    marginTop: 12,
  },
});

export default HomeScreen;
