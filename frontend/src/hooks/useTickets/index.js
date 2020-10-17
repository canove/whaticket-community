import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";

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
					setLoading(false);
					const errorMsg = err.response?.data?.error;
					if (errorMsg) {
						if (i18n.exists(`backendErrors.${errorMsg}`)) {
							toast.error(i18n.t(`backendErrors.${errorMsg}`));
						} else {
							toast.error(err.response.data.error);
						}
					} else {
						toast.error("Unknown error");
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
