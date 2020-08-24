import { useState, useEffect, useReducer } from "react";
import openSocket from "socket.io-client";
import { useHistory } from "react-router-dom";

import api from "../../services/api";

const reducer = (state, action) => {
	if (action.type === "LOAD_TICKETS") {
		const newTickets = action.payload;

		newTickets.forEach(ticket => {
			const ticketIndex = state.findIndex(t => t.id === ticket.id);
			if (ticketIndex !== -1) {
				state[ticketIndex] = ticket;
				if (ticket.unreadMessages > 0) {
					state.unshift(state.splice(ticketIndex, 1)[0]);
				}
			} else {
				state.push(ticket);
			}
		});

		return [...state];
	}

	if (action.type === "UPDATE_TICKETS") {
		const ticket = action.payload;

		const ticketIndex = state.findIndex(t => t.id === ticket.id);
		if (ticketIndex !== -1) {
			if (ticket.status !== state[ticketIndex]) {
				state.splice(ticketIndex, 1);
			} else {
				state[ticketIndex] = ticket;
				state.unshift(state.splice(ticketIndex, 1)[0]);
			}
		} else {
			state.unshift(ticket);
		}
		return [...state];
	}

	if (action.type === "DELETE_TICKET") {
		const ticketId = action.payload;

		const ticketIndex = state.findIndex(t => t.id === ticketId);
		if (ticketIndex !== -1) {
			state.splice(ticketIndex, 1);
		}
		return [...state];
	}

	if (action.type === "RESET_UNREAD") {
		const ticketId = action.payload;

		const ticketIndex = state.findIndex(t => t.id === ticketId);
		if (ticketIndex !== -1) {
			state[ticketIndex].unreadMessages = 0;
		}
		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}
};

const useTickets = ({ searchParam, pageNumber, status, date }) => {
	const history = useHistory();

	const [loading, setLoading] = useState(true);
	const [hasMore, setHasMore] = useState(false);
	const [tickets, dispatch] = useReducer(reducer, []);

	useEffect(() => {
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchTickets = async () => {
				try {
					const { data } = await api.get("/tickets", {
						params: {
							searchParam,
							pageNumber,
							status,
							date,
						},
					});
					dispatch({
						type: "LOAD_TICKETS",
						payload: data.tickets,
					});
					setHasMore(data.hasMore);
					setLoading(false);
				} catch (err) {
					console.log(err);
				}
			};
			fetchTickets();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, pageNumber, status, date]);

	useEffect(() => {
		const socket = openSocket(process.env.REACT_APP_BACKEND_URL);
		socket.emit("joinNotification");

		socket.on("ticket", data => {
			if (data.action === "updateUnread") {
				dispatch({ type: "RESET_UNREAD", payload: data.ticketId });
			}

			if (data.action === "updateStatus" || data.action === "create") {
				console.log("to aqui", status, data.ticket);
				dispatch({
					type: "UPDATE_TICKETS",
					payload: data.ticket,
					status: status,
				});
			}

			if (data.action === "delete") {
				dispatch({ type: "DELETE_TICKET", payload: data.ticketId });
			}
		});

		socket.on("appMessage", data => {
			if (data.action === "create") {
				dispatch({ type: "UPDATE_TICKETS", payload: data.ticket });
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [status]);

	return { loading, tickets, hasMore, dispatch };
};

export default useTickets;
