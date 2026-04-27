import AsyncStorage from "@react-native-async-storage/async-storage";

interface Token {
  token: string;
}

const mockToken: Token = {
  token: "mockToken",
};

export class LoginService {
  static async login(email: string, password: string): Promise<string> {
    if (email === "test@example.com" && password === "password123") {
      return mockToken.token;
    }
    throw new Error("Invalid credentials.");
  }

  static async removeToken(): Promise<void> {
    await AsyncStorage.removeItem("token");
  }

  static async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem("token", token);
  }

  static async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem("token");
  }
}
