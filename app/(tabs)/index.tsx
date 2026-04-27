import { useState } from "react";
import HomeScreen from "../../src/screens/HomeScreen";
import LoginScreen from "../../src/screens/LoginScreen";
import { LoginService } from "../../src/services/authService";

export default function HomeTab() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await LoginService.removeToken();
    setIsLoggedIn(false);
  };

  return isLoggedIn ? (
    <HomeScreen onLogout={handleLogout} />
  ) : (
    <LoginScreen onLoginSuccess={handleLoginSuccess} />
  );
}
