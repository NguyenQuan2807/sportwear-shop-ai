import { createContext, useEffect, useState } from "react";
import { getCurrentUserApi } from "../services/authService";
import { clearAuthSession, getAccessToken, saveAuthSession } from "../utils/tokenStorage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const response = await getCurrentUserApi();
      setUser(response.data);
    } catch (error) {
      clearAuthSession();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAccessToken();

    if (token) {
      fetchCurrentUser();
      return;
    }

    setLoading(false);
  }, []);

  const login = (tokenOrPayload, userData) => {
    if (typeof tokenOrPayload === "string") {
      saveAuthSession({ token: tokenOrPayload });
      setUser(userData || null);
      return;
    }

    saveAuthSession(tokenOrPayload || {});
    setUser(tokenOrPayload?.user || userData || null);
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser, refreshCurrentUser: fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
