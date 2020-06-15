import React, { createContext } from "react";

import useAuth from "./useAuth";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
	const { isAuth, loading, handleLogin, handleLogout } = useAuth();

	return (
		<AuthContext.Provider
			value={{ loading, isAuth, handleLogin, handleLogout }}
		>
			{children}
		</AuthContext.Provider>
	);
};

export { AuthContext, AuthProvider };
