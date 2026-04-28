import React, { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { LoginService } from "../services/authService";
import { getTasks, loadTasks, saveTasks } from "../services/taskService";
import { Task } from "../types/task";

interface HomeScreenProps {
  onLogout: () => Promise<void>;
}

const HomeScreen = ({ onLogout }: HomeScreenProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks().then((loadedTasks) => {
      setTasks(loadedTasks);
    });
  }, []);

  const handleLogout = async () => {
    await LoginService.removeToken();
    await onLogout();
  };

  const handleFetchTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await getTasks();
      await saveTasks(fetchedTasks);
      setTasks(fetchedTasks);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logged in successfully</Text>
      <Button title="Logout" onPress={handleLogout} />
      <View style={styles.taskListContainer}>
        {loading && <Text>Loading...</Text>}
        {error && <Text>{error}</Text>}
        {!loading && !error && (
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
          />
        )}
        <Button title="Fetch Tasks" onPress={handleFetchTasks} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  taskListContainer: {
    width: "100%",
    marginBottom: 20,
  },
  taskItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  taskStatus: {
    fontSize: 14,
  },
});

export default HomeScreen;
