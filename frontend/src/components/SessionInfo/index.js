import React from "react";
import Typography from "@material-ui/core/Typography";

const SessionInfo = ({ session }) => {
	console.log(session);
	return (
		<div>
			<Typography component="h2" variant="h6" color="primary" gutterBottom>
				{`Status: ${session.status}`}
			</Typography>
			<Typography component="p" variant="h6">
				{`Bateria: ${session.battery}%`}
			</Typography>
			<Typography color="textSecondary">
				{`Carregando: ${session.plugged} `}
			</Typography>
		</div>
	);
};

export default SessionInfo;
