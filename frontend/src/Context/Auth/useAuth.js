import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import api from "../../util/api";

const useAuth = () => {
	const history = useHistory();
	const [isAuth, setIsAuth] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("token");

		if (token) {
			api.defaults.headers.Authorization = `Bearer ${JSON.parse(token)}`;
			setIsAuth(true);
		}

		setLoading(false);
	}, []);

	const handleLogin = async (e, user) => {
		e.preventDefault();
		try {
			const res = await api.post("/auth/login", user);
			localStorage.setItem("token", JSON.stringify(res.data.token));
			localStorage.setItem("username", res.data.username);
			localStorage.setItem("userId", res.data.userId);
			api.defaults.headers.Authorization = `Bearer ${res.data.token}`;
			setIsAuth(true);
			history.push("/chat");
		} catch (err) {
			alert(err);
		}
	};

	const handleLogout = e => {
		e.preventDefault();
		setIsAuth(false);
		localStorage.removeItem("token");
		localStorage.removeItem("username");
		localStorage.removeItem("userId");
		api.defaults.headers.Authorization = undefined;
		history.push("/login");
	};

	return { isAuth, loading, handleLogin, handleLogout };
};

export default useAuth;
