import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import api from "../../services/api";

const useTickets = ({
	searchParam,
	pageNumber,
	status,
	date,
	showAll,
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
							withUnreadMessages,
						},
					});
					setTickets(data.tickets);
					setHasMore(data.hasMore);
					setLoading(false);
				} catch (err) {
					console.log(err);
					if (err.response && err.response.data && err.response.data.error) {
						toast.error(err.response.data.error);
					}
				}
			};
			fetchTickets();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, pageNumber, status, date, showAll, withUnreadMessages]);

	return { tickets, loading, hasMore };
};

export default useTickets;
