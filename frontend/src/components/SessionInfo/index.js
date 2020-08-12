import React from "react";
import Typography from "@material-ui/core/Typography";

import { i18n } from "../../translate/i18n";

const SessionInfo = ({ session }) => {
	console.log(session);
	return (
		<div>
			<Typography component="h2" variant="h6" color="primary" gutterBottom>
				{`${i18n.t("sessionInfo.status")}${session.status}`}
			</Typography>
			<Typography component="p" variant="h6">
				{`${i18n.t("sessionInfo.battery")}${session.battery}%`}
			</Typography>
			<Typography color="textSecondary">
				{`${i18n.t("sessionInfo.charging")}${session.plugged} `}
			</Typography>
		</div>
	);
};

export default SessionInfo;
