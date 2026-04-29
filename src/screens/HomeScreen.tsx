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
  loadTasks,
  updateTask,
} from "../services/taskService";
import { Task } from "../types/task";

interface HomeScreenProps {
  onLogout: () => Promise<void> | void;
}

const HomeScreen = ({ onLogout }: HomeScreenProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState("");

  const [filter, setFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<string | null>(null);

  const handleFilter = (filter: string | null) => {
    setFilter(filter);
  };

  const handleSort = (sort: string | null) => {
    setSort(sort);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const loadedTasks = await loadTasks();
      setTasks(loadedTasks);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load tasks",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await LoginService.removeToken();
    await onLogout();
  };

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Perform your refresh logic here
    // ...
    setRefreshing(false);
  };

  const filteredTasks = filter
    ? tasks.filter((task) => {
        if (filter === "open") {
          return !task.completed;
        } else if (filter === "completed") {
          return task.completed;
        }
        return true;
      })
    : tasks;

  const sortedTasks = sort
    ? filteredTasks.slice().sort((a, b) => {
        if (sort === "asc") {
          return a.title.localeCompare(b.title);
        } else {
          return b.title.localeCompare(a.title);
        }
      })
    : filteredTasks;

  const displayedTasks = filter || sort ? sortedTasks : tasks;

  const handleCreateTask = () => {
    const trimmedTitle = title.trim();

    if (trimmedTitle.length < 3) {
      setValidationError("Title must have at least 3 characters.");
      return;
    }

    const newTask = createTask(trimmedTitle);
    setTasks((currentTasks) => [newTask, ...currentTasks]);
    setTitle("");
    setValidationError(null);
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

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id
          ? { ...currentTask, title: trimmedTitle }
          : currentTask,
      ),
    );

    setEditingTaskId(null);
    setEditedTitle("");
    setValidationError(null);
  };

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
            <Button title="Edit" onPress={() => startEditing(item)} />
            <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
              <Text style={styles.taskDeleteButton}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  const handleDeleteTask = async (taskId: number) => {
    setLoading(true);
    setError(null);

    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((task) => task.id !== taskId));
      setSuccessMessage("Task deleted successfully");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  useEffect(() => {
    if (successMessage) {
      const timeout = setTimeout(() => setSuccessMessage(null), 2000);
      return () => clearTimeout(timeout);
    }
  }, [successMessage]);

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
        <View style={styles.filterSortRow}>
          <Text style={styles.filterSortLabel}>Filter:</Text>
          <View style={styles.filterSortButtons}>
            <TouchableOpacity onPress={() => handleFilter("open")}>
              <Text style={styles.filterSortButton}>Open</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleFilter("completed")}>
              <Text style={styles.filterSortButton}>Completed</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleFilter(null)}>
              <Text style={styles.filterSortButton}>All</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.filterSortRow}>
          <Text style={styles.filterSortLabel}>Sort by:</Text>
          <View style={styles.filterSortButtons}>
            <TouchableOpacity onPress={() => handleSort("asc")}>
              <Text style={styles.filterSortButton}>Title (asc)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort("desc")}>
              <Text style={styles.filterSortButton}>Title (desc)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {validationError ? (
        <Text style={styles.validationError}>{validationError}</Text>
      ) : null}

      {loading ? <Text>Loading tasks...</Text> : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!loading && !error && tasks.length === 0 ? (
        <Text>No tasks available</Text>
      ) : null}

      <FlatList
        data={displayedTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTask}
        style={styles.taskList}
        contentContainerStyle={styles.taskListContent}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      <Text style={styles.successMessage}>{successMessage}</Text>
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
    gap: 8,
  },
  logoutContainer: {
    marginTop: 12,
  },
  taskDeleteButton: {
    color: "red",
    fontSize: 16,
    marginTop: 8,
    textDecorationLine: "underline",
    cursor: "pointer",
  },
});

export default HomeScreen;
