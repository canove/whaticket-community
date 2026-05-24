import React, { createContext, useMemo } from "react";

import useAuth from "../../hooks/useAuth.js";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
	const { loading, user, isAuth, handleLogin, handleLogout } = useAuth();

	const value = useMemo(
		() => ({ loading, user, isAuth, handleLogin, handleLogout }),
		[loading, user, isAuth, handleLogin, handleLogout]
	);

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
};

export { AuthContext, AuthProvider };
