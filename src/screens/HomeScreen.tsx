import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState("");

  const [filter, setFilter] = useState<TaskFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

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
    setError(null);
    setSuccessMessage(null);

    if (title.length < 3) {
      setError("Title must have at least 3 characters.");
      return;
    }

    setIsCreating(true);
    try {
      const newTask = createTask(title.trim());
      const updatedTasks = [...tasks, newTask];
      await saveTasksToCache(updatedTasks);
      setTasks(updatedTasks);
      setTitle("");
      setSuccessMessage("Task created.");
    } catch (error) {
      console.error("Error creating task", error);
      setError("Error creating task.");
    } finally {
      setIsCreating(false);
    }
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

  const saveEditedTask = async (taskId: number) => {
    setError(null);
    setSuccessMessage(null);

    if (editedTitle.length < 3) {
      setValidationError("Edited title must have at least 3 characters.");
      return;
    }

    setIsUpdating(true);
    try {
      const trimmedTitle = editedTitle.trim();
      await updateTask(taskId, trimmedTitle);
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, title: trimmedTitle } : task,
      );
      setTasks(updatedTasks);
      setEditingTaskId(null);
      setEditedTitle("");
      setValidationError(null);
      setSuccessMessage("Task updated.");
    } catch (error) {
      console.error("Error updating task", error);
      setError("Error updating task.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateTask = async (taskId: number, title: string) => {
    setIsUpdating(true);
    setError(null);

    try {
      await updateTask(taskId, title);
      setSuccessMessage("Task updated.");
      setIsUpdating(false);
      await loadTasks();
    } catch (error) {
      console.error("Error updating task", error);
      setError("Error updating task.");
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    setError(null);
    setSuccessMessage(null);

    setIsDeleting(true);
    try {
      await deleteTask(taskId);
      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(updatedTasks);
      setSuccessMessage("Task deleted.");
    } catch (error) {
      console.error("Error deleting task", error);
      setError("Error deleting task.");
    } finally {
      setIsDeleting(false);
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
              <Button
                title="Edit"
                onPress={() => startEditing(item)}
                disabled={isUpdating || editingTaskId === item.id}
              >
                {isUpdating && editingTaskId === item.id ? (
                  <ActivityIndicator />
                ) : null}
              </Button>
              <Button
                title="Delete"
                onPress={() => handleDeleteTask(item.id)}
                disabled={isDeleting || editingTaskId === item.id}
              >
                {isDeleting && editingTaskId === item.id ? (
                  <ActivityIndicator />
                ) : null}
              </Button>
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
          title="Create Task"
          onPress={() => handleCreateTask(title)}
          disabled={isCreating}
        >
          {isCreating ? <ActivityIndicator /> : null}
        </Button>
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
