import { useEffect, useState } from "react";
import api from "../../util/api";

const useMessageSerach = (query, pageNumber, token, contactId) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [listMessages, setListMessages] = useState([]);
	const [hasMore, setHasMore] = useState(false);

	useEffect(() => setListMessages([]), [contactId, query]);

	useEffect(() => {
		console.log(pageNumber);
		setLoading(true);
		setError(false);
		const delayDebounceFn = setTimeout(() => {
			console.log(query);
			const fetchMessages = async () => {
				try {
					const res = await api.get("/messages/" + contactId, {
						headers: { Authorization: "Bearer " + token },
						params: { searchParam: query, pageNumber: pageNumber },
					});
					setListMessages(prevMessages => {
						return [...res.data.messages, ...prevMessages];
					});
					setHasMore(res.data.messages.length > 0);
					setLoading(false);
					console.log(res.data);
				} catch (err) {
					console.log(err);
					setError(true);
				}
			};
			fetchMessages();
		}, 1000);
		return () => clearTimeout(delayDebounceFn);
	}, [query, pageNumber, contactId, token]);

	return { loading, error, listMessages, hasMore, setListMessages };
};

export default useMessageSerach;
