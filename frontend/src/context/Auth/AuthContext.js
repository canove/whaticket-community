import React, { createContext } from "react";

import useAuth from "./useAuth";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
	const {
		loading,
		user,
		setUser,
		isAuth,
		handleLogin,
		handleLogout,
	} = useAuth();

	return (
		<AuthContext.Provider
			value={{ loading, user, setUser, isAuth, handleLogin, handleLogout }}
		>
			{children}
		</AuthContext.Provider>
	);
};

export { AuthContext, AuthProvider };
