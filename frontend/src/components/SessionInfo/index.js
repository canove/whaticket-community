import React from "react";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles({
	main: {
		flex: 1,
	},
});

const SessionInfo = ({ session }) => {
	const classes = useStyles();
	return (
		<React.Fragment>
			<Typography component="h2" variant="h6" color="primary" gutterBottom>
				Bateria
			</Typography>
			<Typography component="p" variant="h6">
				{(session && session.baterry) || "Não disponível"}
			</Typography>
			<Typography color="textSecondary" className={classes.main}>
				Carregando: {(session && session.plugged) || "Não disponível"}
			</Typography>
			<div>
				<Link color="primary" href="#">
					Verificar bateria
				</Link>
			</div>
		</React.Fragment>
	);
};

export default SessionInfo;
