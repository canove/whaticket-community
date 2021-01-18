import { useState, useEffect } from "react";
import toastError from "../../errors/toastError";

import api from "../../services/api";

const useTickets = ({
	searchParam,
	pageNumber,
	status,
	date,
	showAll,
	queueIds,
	withUnreadMessages,
}) => {
	const [loading, setLoading] = useState(true);
	const [hasMore, setHasMore] = useState(false);
	const [tickets, setTickets] = useState([]);

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
							showAll,
							queueIds,
							withUnreadMessages,
						},
					});
					setTickets(data.tickets);
					setHasMore(data.hasMore);
					setLoading(false);
				} catch (err) {
					setLoading(false);
					toastError(err);
				}
			};
			fetchTickets();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [
		searchParam,
		pageNumber,
		status,
		date,
		showAll,
		queueIds,
		withUnreadMessages,
	]);

	return { tickets, loading, hasMore };
};

export default useTickets;
