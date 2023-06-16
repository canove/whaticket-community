import { useState, useEffect, useReducer, useContext } from "react";
import openSocket from "../../services/socket-io";
import openWorkerSocket from "../../services/socket-worker-io";
import toastError from "../../errors/toastError";

import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
	if (action.type === "LOAD_WHATSAPPS") {
		const whatsapps = action.payload;
		return [...whatsapps];
	}

	if (action.type === "UPDATE_WHATSAPPS") {
		const whatsapps = action.payload;
		const whatsappsIndex = state.findIndex(s => s.id === whatsapps.id);
		if (whatsappsIndex !== -1 || whatsapps.official === true) {
			state[whatsappsIndex] = whatsapps;
			return [...state];
		} else {
			return [whatsapps, ...state];
		}
	}

	if (action.type === "UPDATE_SESSION") {
		const whatsapps = action.payload;
		const whatsappsIndex = state.findIndex(s => s.id === whatsapps.id);

		if (whatsappsIndex !== -1) {
			state[whatsappsIndex].status = whatsapps.status;
			state[whatsappsIndex].updatedAt = whatsapps.updatedAt;
			state[whatsappsIndex].qrcode = whatsapps.qrcode;
			state[whatsappsIndex].retries = whatsapps.retries;
			return [...state];
		} else {
			return [...state];
		}
	}

	if (action.type === "DELETE_WHATSAPPS") {
		const whatsappsId = action.payload;

		const whatsappsIndex = state.findIndex(s => s.id === whatsappsId);
		if (whatsappsIndex !== -1) {
			state.splice(whatsappsIndex, 1);
		}
		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}
};

const useWhatsApps2 = ({
    official = false,
    officialWhatsappId,
	connectionFileId,
	limit = "10",
	pageNumber = "1",
	name,
	status,
	selectedCompanyId,
	connectionFileName,
	business,
	anyCompany = false,
}) => {
	const [whatsapps, dispatch] = useReducer(reducer, []);
	const [count, setCount] = useState(0);
	const [hasMore, setHasMore] = useState(false);
	const [loading, setLoading] = useState(true);
	const { user } = useContext(AuthContext);

	useEffect(() => {
		setLoading(true);
		dispatch({ type: "RESET" });

		// const delayDebounceFn = setTimeout(() => {
			const fetchSessions = async () => {
				if (!user.name) return;

				try {
					const { data } = await api.get(`/whatsapp2/`, {
						params: {
							official,
							officialWhatsappId,
							connectionFileId,
							limit,
							pageNumber,
							name,
							status,
							selectedCompanyId,
							connectionFileName,
							business,
							anyCompany,
						}
					});
					dispatch({ type: "LOAD_WHATSAPPS", payload: data.whatsapps });
					setCount(data.count);
					setHasMore(data.hasMore);
				} catch (err) {
					toastError(err);
				}
				setLoading(false);
			};

			fetchSessions();
		// }, 250);
		// return () => clearTimeout(delayDebounceFn)
	}, [
		user, 
		official, 
		officialWhatsappId,
		connectionFileId, 
		limit, 
		pageNumber, 
		name, 
		status, 
		selectedCompanyId, 
		connectionFileName,
		business,
		anyCompany,
	]);

	useEffect(() => {
		const socket = openSocket();

		socket.on(`whatsapp${user.companyId}`, data => {
			if (data.action === "update") {
				dispatch({ type: "UPDATE_WHATSAPPS", payload: data.whatsapp });
			}

			if (data.action === "delete") {
				dispatch({ type: "DELETE_WHATSAPPS", payload: data.whatsappId });
			}
		});

		socket.on(`whatsappSession${user.companyId}`, data => {
			if (data.action === "update") {
				dispatch({ type: "UPDATE_SESSION", payload: data.session });
			}
		});

		socket.on(`officialwhatsapp${user.companyId}`, data => {
			if (data.action === "update") {
				dispatch({ type: "UPDATE_WHATSAPPS", payload: data.whatsapp });
			}

			if (data.action === "delete") {
				dispatch({ type: "DELETE_WHATSAPPS", payload: data.whatsappId });
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [user]);

	useEffect(() => {
        const socket = openWorkerSocket();

        socket.on(`officialwhatsapp${user.companyId}`, (data) => {
            if (data.action === "update") {
                dispatch({ type: "UPDATE_WHATSAPPS", payload: data.whatsapp });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

	return { whatsapps, count, hasMore, loading };
};

export default useWhatsApps2;
