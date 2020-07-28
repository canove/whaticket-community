import React from "react";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles({
	main: {
		// flex: 1,
	},
});

const SessionInfo = ({ session }) => {
	console.log(session);
	const classes = useStyles();
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
