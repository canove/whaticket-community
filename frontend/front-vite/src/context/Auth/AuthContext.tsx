import { createContext } from "react";
import type { ReactNode } from "react";

import useAuth from "../../hooks/useAuth";

interface AuthContextType {
  loading?: boolean;
  user?: any;
  isAuth?: boolean;
  handleLogin?: (userData: {
    email: string;
    password: string;
  }) => Promise<void>;
  handleLogout?: () => void;
}

const AuthContext = createContext<AuthContextType>({});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { loading, user, isAuth, handleLogin, handleLogout } = useAuth();

  return (
    <AuthContext.Provider
      value={{ loading, user, isAuth, handleLogin, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
