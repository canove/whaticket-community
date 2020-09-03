import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { toast } from "react-toastify";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";

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
		const checkAuth = async () => {
			if (
				history.location.pathname === "/login" ||
				history.location.pathname === "/signup"
			) {
				setLoading(false);
				return;
			}
			try {
				const res = await api.get("/auth/check");
				if (res.status === 200) {
					setIsAuth(true);
					setLoading(false);
				}
			} catch (err) {
				setLoading(false);
				setIsAuth(false);
				toast.error(i18n.t("auth.toasts.fail"));
			}
		};
		checkAuth();
	}, [history.location.pathname]);

	const handleLogin = async (e, user) => {
		e.preventDefault();
		try {
			const res = await api.post("/auth/login", user);
			localStorage.setItem("token", JSON.stringify(res.data.token));
			localStorage.setItem("username", res.data.username);
			localStorage.setItem("userId", res.data.userId);
			api.defaults.headers.Authorization = `Bearer ${res.data.token}`;
			setIsAuth(true);
			toast.success(i18n.t("auth.toasts.success"));
			history.push("/tickets");
		} catch (err) {
			toast.error(i18n.t("auth.toasts.fail"));
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
