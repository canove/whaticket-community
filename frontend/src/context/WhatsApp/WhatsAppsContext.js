import React, { createContext, useMemo } from "react";

import useWhatsApps from "../../hooks/useWhatsApps";

const WhatsAppsContext = createContext();

const WhatsAppsProvider = ({ children }) => {
	const { loading, whatsApps } = useWhatsApps();

	const value = useMemo(
		() => ({ whatsApps, loading }),
		[whatsApps, loading]
	);

	return (
		<WhatsAppsContext.Provider value={value}>
			{children}
		</WhatsAppsContext.Provider>
	);
};

export { WhatsAppsContext, WhatsAppsProvider };
