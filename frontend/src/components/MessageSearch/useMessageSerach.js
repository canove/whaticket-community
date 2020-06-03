import { useEffect, useState } from "react";
import api from "../../util/api";

const useMessageSerach = (query, pageNumber) => {
	useEffect(() => {
		const fetchMessages = async () => {
			try {
				const res = await api.get("/messages/" + contactId, {
					headers: { Authorization: "Bearer " + token },
					params: { serach: query, page: pageNumber },
				});
				setListMessages(res.data);
			} catch (err) {
				alert(err);
			}
		};
	}, [query, pageNumber]);

	return null;
};

export default useMessageSerach;
