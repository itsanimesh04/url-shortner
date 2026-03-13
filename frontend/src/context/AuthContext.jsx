import { createContext, useContext, useState } from "react";
import { getToken, setToken, removeToken } from "../utils/token";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(getToken());
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (token, user) => {
    setToken(token);
    setTokenState(token);
     localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    removeToken();
    localStorage.removeItem("user");
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

//explain :
// This code defines an authentication context for a React application. It uses the Context API to manage authentication state across the app. The `AuthProvider` component provides the authentication state and functions to its children components. It includes a `login` function to set the token and user information, and a `logout` function to clear the token and user data. The `useAuth` hook allows components to easily access the authentication context.

// flow of the code:
// 1. The `AuthContext` is created using `createContext`.
// 2. The `AuthProvider` component initializes the authentication state using `useState` and retrieves any existing token from local storage.   
// 3. The `login` function updates the token and user state, and saves the token to local storage.
// 4. The `logout` function clears the token from local storage and resets the authentication state.
// 5. The `AuthContext.Provider` wraps the children components, providing them access to the authentication state and functions.
// 6. The `useAuth` hook allows components to consume the authentication context easily.

