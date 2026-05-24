import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import openSocket, { disconnectSocket } from "../../services/socket-io";

import { toast } from "react-toastify";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useAuth = () => {
	const navigate = useNavigate();
	const [isAuth, setIsAuth] = useState(false);
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState({});

	useEffect(() => {
		const requestId = api.interceptors.request.use(
			config => {
				const token = localStorage.getItem("token");
				if (token) {
					config.headers["Authorization"] = `Bearer ${JSON.parse(token)}`;
				}
				return config;
			},
			error => Promise.reject(error)
		);

		const responseId = api.interceptors.response.use(
			response => response,
			async error => {
				const originalRequest = error.config;
				if (error?.response?.status === 403 && !originalRequest._retry) {
					originalRequest._retry = true;

					const { data } = await api.post("/auth/refresh_token");
					if (data) {
						localStorage.setItem("token", JSON.stringify(data.token));
						api.defaults.headers.Authorization = `Bearer ${data.token}`;
					}
					return api(originalRequest);
				}
				if (error?.response?.status === 401) {
					localStorage.removeItem("token");
					api.defaults.headers.Authorization = undefined;
					setIsAuth(false);
				}
				return Promise.reject(error);
			}
		);

		return () => {
			api.interceptors.request.eject(requestId);
			api.interceptors.response.eject(responseId);
		};
	}, []);

	useEffect(() => {
		const token = localStorage.getItem("token");
		(async () => {
			if (token) {
				try {
					const { data } = await api.post("/auth/refresh_token");
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
		const socket = openSocket();

		socket.on("user", data => {
			if (data.action === "update" && data.user.id === user.id) {
				setUser(data.user);
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [user.id]);

	const handleLogin = useCallback(async userData => {
		setLoading(true);

		try {
			const { data } = await api.post("/auth/login", userData);
			localStorage.setItem("token", JSON.stringify(data.token));
			api.defaults.headers.Authorization = `Bearer ${data.token}`;
			setUser(data.user);
			setIsAuth(true);
			toast.success(i18n.t("auth.toasts.success"));
			navigate("/tickets");
			setLoading(false);
		} catch (err) {
			toastError(err);
			setLoading(false);
		}
	}, [navigate]);

	const handleLogout = useCallback(async () => {
		setLoading(true);

		try {
			await api.delete("/auth/logout");
			disconnectSocket();
			setIsAuth(false);
			setUser({});
			localStorage.removeItem("token");
			api.defaults.headers.Authorization = undefined;
			setLoading(false);
			navigate("/login");
		} catch (err) {
			toastError(err);
			setLoading(false);
		}
	}, [navigate]);

	return { isAuth, user, loading, handleLogin, handleLogout };
};

export default useAuth;
