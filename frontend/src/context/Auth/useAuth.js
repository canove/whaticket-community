import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import openSocket from "socket.io-client";

import { toast } from "react-toastify";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useAuth = () => {
	const history = useHistory();
	const [isAuth, setIsAuth] = useState(false);
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState({});

	api.interceptors.request.use(
		config => {
			const token = localStorage.getItem("token");
			if (token) {
				config.headers["Authorization"] = `Bearer ${JSON.parse(token)}`;
				setIsAuth(true);
			}
			return config;
		},
		error => {
			Promise.reject(error);
		}
	);

	api.interceptors.response.use(
		response => {
			return response;
		},
		async error => {
			const originalRequest = error.config;
			if (error?.response?.status === 403 && !originalRequest._retry) {
				originalRequest._retry = true;
				const authRefresh = localStorage.getItem('refreshToken')
				if (authRefresh) {
					const { data } = await api.post("/auth/refresh_token", {refreshToken:authRefresh});
					if (data) {
						localStorage.setItem("token", JSON.stringify(data.token));
						api.defaults.headers.Authorization = `Bearer ${data.token}`;
					}
				} else {
					handleRemoveLoginData()
				}
				return api(originalRequest);
			}
			if (error?.response?.status === 401) {
				handleRemoveLoginData()
			}
			return Promise.reject(error);
		}
	);

	useEffect(() => {
		const token = localStorage.getItem("token");
		(async () => {
			if (token) {
				try {
					const authRefresh = localStorage.getItem('refreshToken')
					if (authRefresh) {
						const { data } = await api.post("/auth/refresh_token", {refreshToken:authRefresh});
						if (data) {
							localStorage.setItem("token", JSON.stringify(data.token));
							api.defaults.headers.Authorization = `Bearer ${data.token}`;
						}
					} else {
						handleRemoveLoginData()
					}
					api.defaults.headers.Authorization = `Bearer ${data.token}`;
					setIsAuth(true);
					setUser(data.user);
				} catch (err) {
					toastError(err);
				}
			}
			setLoading(false);
		})();
	}, []);

	useEffect(() => {
		const socket = openSocket(process.env.REACT_APP_BACKEND_URL);

		socket.on("user", data => {
			if (data.action === "update" && data.user.id === user.id) {
				setUser(data.user);
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [user]);

	const handleRemoveLoginData = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("refreshToken");
		api.defaults.headers.Authorization = undefined;
		setIsAuth(false);
	}

	const handleLogin = async userData => {
		setLoading(true);

		try {
			const { data } = await api.post("/auth/login", userData);
			localStorage.setItem("token", JSON.stringify(data.token));
			localStorage.setItem("refreshToken", JSON.stringify(data.refreshToken))
			api.defaults.headers.Authorization = `Bearer ${data.token}`;
			setUser(data.user);
			setIsAuth(true);
			toast.success(i18n.t("auth.toasts.success"));
			history.push("/tickets");
			setLoading(false);
		} catch (err) {
			toastError(err);
			setLoading(false);
		}
	};

	const handleLogout = () => {
		setLoading(true);
		setIsAuth(false);
		setUser({});
		localStorage.removeItem("token");
		localStorage.removeItem("refreshToken");
		api.defaults.headers.Authorization = undefined;
		setLoading(false);
		history.push("/login");
	};

	return { isAuth, user, loading, handleLogin, handleLogout };
};

export default useAuth;
