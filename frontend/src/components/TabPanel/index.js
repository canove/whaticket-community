import React from "react";

const TabPanel = ({ children, value, name, ...rest }) => {
	if (value === name) {
		return (
			<div
				role="tabpanel"
				id={`simple-tabpanel-${name}`}
				aria-labelledby={`simple-tab-${name}`}
				{...rest}
			>
				<>{children}</>
			</div>
		);
	} else return null;
};

export default TabPanel;
