import React, { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LoginService } from "../services/authService";
import { createTask, loadTasks } from "../services/taskService";
import { Task } from "../types/task";

interface HomeScreenProps {
  onLogout: () => Promise<void> | void;
}

const HomeScreen = ({ onLogout }: HomeScreenProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedTasks = await loadTasks();
      setTasks(fetchedTasks);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to fetch tasks",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await LoginService.removeToken();
    await onLogout();
  };

  const handleAddTask = () => {
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
        <Button title="Add task" onPress={handleAddTask} disabled={loading} />
      </View>

      {validationError ? (
        <Text style={styles.validationError}>{validationError}</Text>
      ) : null}

      {loading ? <Text>Loading tasks...</Text> : null}

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={fetchTasks} />
        </View>
      ) : null}

      {!loading && !error && tasks.length === 0 ? (
        <Text>No tasks available</Text>
      ) : null}

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItemContainer}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskStatus}>
              {item.completed ? "Done" : "Open"}
            </Text>
          </View>
        )}
        style={styles.taskList}
        contentContainerStyle={styles.taskListContent}
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
  errorContainer: {
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
  },
  logoutContainer: {
    marginTop: 12,
  },
});

export default HomeScreen;
