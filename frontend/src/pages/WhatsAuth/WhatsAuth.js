import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import api from "../../util/api";
import openSocket from "socket.io-client";

import { makeStyles } from "@material-ui/core/styles";

import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Bateryinfo from "./components/Bateryinfo";
import Qrcode from "./components/Qrcode";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		padding: theme.spacing(4),
	},

	content: {
		flexGrow: 1,
		overflow: "auto",
	},
	paper: {
		padding: theme.spacing(2),
		display: "flex",
		overflow: "auto",
		alignItems: "center",
		flexDirection: "column",
	},
	fixedHeight: {
		height: 640,
	},
}));

const WhatsAuth = () => {
	const classes = useStyles();
	const history = useHistory();

	const [qrCode, setQrCode] = useState("");
	const [session, setSession] = useState({});

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const res = await api.get("/whatsapp/session/1");
				setQrCode(res.data.qrcode);
				setSession(res.data);
			} catch (err) {
				console.log(err);
			}
		};
		fetchSession();
	}, []);

	useEffect(() => {
		const socket = openSocket(process.env.REACT_APP_BACKEND_URL);

		socket.on("qrcode", data => {
			if (data.action === "update") {
				setQrCode(data.qr);
			}
		});

		socket.on("whats_auth", data => {
			if (data.action === "authentication") {
				setQrCode("");
				setSession(data.session);
				history.push("/chat");
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [history]);

	console.log(session);

	return (
		<div className={classes.root}>
			<Grid container spacing={3}>
				{session.status === "pending" ? (
					<Grid item xs={12}>
						<Paper className={classes.paper}>
							<Qrcode qrCode={qrCode} />
						</Paper>
					</Grid>
				) : (
					<Grid item xs={6}>
						<Paper className={classes.paper}>
							<Bateryinfo sessio={session} />
						</Paper>
					</Grid>
				)}
			</Grid>
		</div>
	);
};

export default WhatsAuth;
