import React, { createContext } from "react";

import useWhatsApps from "../../hooks/useWhatsApps";

const OfficialWhatsAppsContext = createContext();

const OfficialWhatsAppsProvider = ({ children }) => {
	const { loading, whatsApps } = useWhatsApps(true);

	return (
		<OfficialWhatsAppsContext.Provider value={{ whatsApps, loading }}>
			{children}
		</OfficialWhatsAppsContext.Provider>
	);
};

export { OfficialWhatsAppsContext, OfficialWhatsAppsProvider };
