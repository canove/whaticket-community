import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import openSocket from "../../services/socket-io";

import { toast } from "react-toastify";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";

const useAuth = () => {
	const { i18n } = useTranslation();
	const history = useHistory();
	const [isAuth, setIsAuth] = useState(false);
	const [loading, setLoading] = useState(false);
	const [user, setUser] = useState({});
	
	const [accountConnected, setAccountConnected] = useState(false);

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

				const { data } = await api.post("/auth/refresh_token");
				if (data) {
					localStorage.setItem("token", JSON.stringify(data.token));
					api.defaults.headers.Authorization = `Bearer ${data.token}`;
				}

				if (isAuth) {
					return api(originalRequest);
				}

				return Promise.reject(error);
			}
			if (error?.response?.status === 401) {
				localStorage.removeItem("token");
				api.defaults.headers.Authorization = undefined;
				setIsAuth(false);
			}
			return Promise.reject(error);
		}
	);

	useEffect(() => {
		const token = localStorage.getItem("token");
		(async () => {
			if (token) {
				try {
					const { data } = await api.post("/auth/refresh_token");

					localStorage.setItem("token", JSON.stringify(data.token));
					api.defaults.headers.Authorization = `Bearer ${data.token}`;
					setIsAuth(true);
					setUser(data.user);
					i18n.changeLanguage(data.user.lang);
				} catch (err) {
					toastError(err);
				}
			}
			setLoading(false);
		})();
	}, []);

	useEffect(() => {
		const socket = openSocket();

		socket.on(`user${user.companyId}`, data => {
			if (data.action === "update" && data.user.id === user.id) {
				setUser(data.user);
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [user]);

	const handleLogin = async userData => {
		setLoading(true);

		try {
			api.defaults.headers.Authorization = undefined;
			localStorage.removeItem("token");

			const { data } = await api.post("/auth/login", userData);

			if (data.accountConnected) {
				setAccountConnected(true);
			} else {
				setAccountConnected(false);

				localStorage.setItem("token", JSON.stringify(data.token));
				api.defaults.headers.Authorization = `Bearer ${data.token}`;
	
				setUser(data.user);
				i18n.changeLanguage(data.user.lang);
				setIsAuth(true);
	
				toast.success(i18n.t("auth.toasts.success"));
				history.push("/tickets");
			}

			setLoading(false);
		} catch (err) {
			toastError(err);
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		setLoading(true);

		try {
			await api.delete("/auth/logout");
			setIsAuth(false);
			setUser({});
			localStorage.removeItem("token");
			api.defaults.headers.Authorization = undefined;
			setLoading(false);
			history.push("/login");
		} catch (err) {
			toastError(err);
			setLoading(false);
		}
	};

	return { isAuth, user, loading, accountConnected, setAccountConnected, handleLogin, handleLogout };
};

export default useAuth;
