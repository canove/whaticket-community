import React, { createContext } from "react";

import useOfficialWhatsApps from "../../hooks/useOfficialWhatsApps";

const OfficialWhatsAppsContext = createContext();

const OfficialWhatsAppsProvider = ({ children }) => {
	const { loading, whatsApps } = useOfficialWhatsApps(false);

	return (
		<OfficialWhatsAppsContext.Provider value={{ whatsApps, loading }}>
			{children}
		</OfficialWhatsAppsContext.Provider>
	);
};

export { OfficialWhatsAppsContext, OfficialWhatsAppsProvider };
