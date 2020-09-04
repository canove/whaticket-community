import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import api from "../../services/api";
import openSocket from "socket.io-client";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";

import Paper from "@material-ui/core/Paper";
import SessionInfo from "../../components/SessionInfo";
import Qrcode from "../../components/Qrcode";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		padding: theme.spacing(4),
	},

	paper: {
		padding: theme.spacing(2),
		display: "flex",
		width: 400,
		overflow: "auto",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
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
				const { data } = await api.get("/whatsapp/session/1");
				setQrCode(data.qrcode);
				setSession(data);
			} catch (err) {
				console.log(err);
				if (err.response && err.response.data && err.response.data.error) {
					toast.error(err.response.data.error);
				}
			}
		};
		fetchSession();
	}, []);

	useEffect(() => {
		const socket = openSocket(process.env.REACT_APP_BACKEND_URL);

		socket.on("session", data => {
			if (data.action === "update") {
				setQrCode(data.qr);
				setSession(data.session);
			}
		});

		socket.on("session", data => {
			if (data.action === "update") {
				setSession(data.session);
			}
		});

		socket.on("session", data => {
			if (data.action === "authentication") {
				setQrCode("");
				setSession(data.session);
				history.push("/tickets");
			}
		});

		socket.on("session", data => {
			if (data.action === "logout") {
				setSession(data.session);
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [history]);

	return (
		<div className={classes.root}>
			{session && session.status === "disconnected" ? (
				<Paper className={classes.paper}>
					<Qrcode qrCode={qrCode} />
				</Paper>
			) : (
				<Paper className={classes.paper}>
					<SessionInfo session={session} />
				</Paper>
			)}
		</div>
	);
};

export default WhatsAuth;
