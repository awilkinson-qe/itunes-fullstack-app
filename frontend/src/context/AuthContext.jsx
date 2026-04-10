// AuthContext.jsx - React context for managing authentication state
// This context provides authentication state and actions (login, logout)
// to the entire app. It restores session state from localStorage,
// validates tokens with the backend, and keeps user data in sync.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import api from "../services/api";

const AuthContext = createContext();

// Safely read the stored user from localStorage
const getStoredUser = () => {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  // Restore token + user from localStorage on initial load
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || ""
  );
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  // Prevent duplicate /auth/me calls (React StrictMode can trigger twice)
  const lastCheckedTokenRef = useRef(null);

  // Clear all authentication-related state
  const logout = () => {
    setToken("");
    setUser(null);
    setLoading(false);
    lastCheckedTokenRef.current = null;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Validate token and fetch current user profile
  useEffect(() => {
    const checkUser = async () => {
      // No token = no authenticated session
      if (!token) {
        lastCheckedTokenRef.current = null;
        setLoading(false);
        return;
      }

      // Skip duplicate validation for same token
      if (lastCheckedTokenRef.current === token) {
        setLoading(false);
        return;
      }

      lastCheckedTokenRef.current = token;
      setLoading(true);

      try {
        const response = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Support flexible backend response formats
        const currentUser =
          response.data.data || response.data.user || response.data;

        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));
      } catch {
        // Token invalid or expired → force logout
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [token]);

  // Apply login state after successful authentication
  const login = (tokenValue, userValue) => {
    setToken(tokenValue);
    setUser(userValue);
    setLoading(false);
    lastCheckedTokenRef.current = tokenValue;

    localStorage.setItem("token", tokenValue);
    localStorage.setItem("user", JSON.stringify(userValue));
  };

  // Memoise context value to avoid unnecessary re-renders
  const value = useMemo(
    () => ({
      token,
      user,
      login,
      logout,
      isAuthenticated: !!token,
      loading,
    }),
    [token, user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easier context usage
export function useAuth() {
  return useContext(AuthContext);
}