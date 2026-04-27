import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { LoginService } from "../services/authService";

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen = ({ onLoginSuccess }: LoginScreenProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setErrorMessage("Please enter your email and password.");
        return;
      }

      const token = await LoginService.login(email, password);
      setSuccessMessage("Login successful!");
      await LoginService.saveToken(token);
      onLoginSuccess();
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password:</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={handleLogin} />
        {errorMessage && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}
        {successMessage && (
          <Text style={styles.successMessage}>{successMessage}</Text>
        )}
      </View>
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
  inputContainer: {
    width: "80%",
    marginBottom: 10,
  },
  label: {
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
  },
  buttonContainer: {
    width: "80%",
    marginTop: 20,
  },
  errorMessage: {
    color: "red",
    marginTop: 5,
  },
  successMessage: {
    color: "green",
    marginTop: 5,
  },
});

export default LoginScreen;
