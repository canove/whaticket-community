import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import api from "../../services/api";
import openSocket from "socket.io-client";

import { makeStyles } from "@material-ui/core/styles";

import Paper from "@material-ui/core/Paper";

import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		alignItems: "center",
		padding: theme.spacing(4),
	},

	paper: {
		padding: theme.spacing(2),
		display: "flex",
		alignItems: "center",
	},

	switch: {
		marginLeft: "auto",
	},
}));

const WhatsAuth = () => {
	const classes = useStyles();
	// const history = useHistory();

	const [settings, setSettings] = useState([]);

	// useEffect(() => {
	// 	const fetchSession = async () => {
	// 		try {
	// 			const { data } = await api.get("/whatsapp/session/1");
	// 			setQrCode(data.qrcode);
	// 			setSession(data);
	// 		} catch (err) {
	// 			console.log(err);
	// 		}
	// 	};
	// 	fetchSession();
	// }, []);

	return (
		<div className={classes.root}>
			<Container className={classes.container} maxWidth="sm">
				<Typography variant="subtitle1" gutterBottom>
					Settings
				</Typography>
				<Paper className={classes.paper}>
					<Typography variant="body2">Enable user creation</Typography>
					<Switch
						size="small"
						className={classes.switch}
						checked={true}
						// onChange={() => setShowAllTickets(prevState => !prevState)}
						name="showAllTickets"
						color="primary"
					/>
				</Paper>
			</Container>
		</div>
	);
};

export default WhatsAuth;
