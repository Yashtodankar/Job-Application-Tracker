import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const navigate = useNavigate();

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    const accessToken = res.data.access_token;
    localStorage.setItem("token", accessToken);
    setToken(accessToken);
    navigate("/dashboard");
  };

  const register = async (name, email, password) => {
    await API.post("/auth/register", { name, email, password });
    navigate("/login");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);