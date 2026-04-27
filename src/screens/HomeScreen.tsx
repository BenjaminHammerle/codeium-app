import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { LoginService } from "../services/authService";

interface HomeScreenProps {
  onLogout: () => Promise<void>;
}

const HomeScreen = ({ onLogout }: HomeScreenProps) => {
  const handleLogout = async () => {
    await LoginService.removeToken();
    await onLogout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logged in successfully</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default HomeScreen;
