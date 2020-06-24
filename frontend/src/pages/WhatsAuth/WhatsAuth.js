import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import api from "../../util/api";
import MainDrawer from "../../components/Layout/MainDrawer";
import openSocket from "socket.io-client";

import { makeStyles } from "@material-ui/core/styles";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Bateryinfo from "./components/Bateryinfo";
import Qrcode from "./components/Qrcode";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
	},

	title: {
		flexGrow: 1,
	},

	appBarSpacer: theme.mixins.toolbar,
	content: {
		flexGrow: 1,

		overflow: "auto",
	},
	container: {
		// paddingTop: theme.spacing(4),
		// paddingBottom: theme.spacing(4),
		height: `calc(100% - 64px)`,
	},
	paper: {
		padding: theme.spacing(2),
		display: "flex",
		overflow: "auto",
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
				const res = await api.get("/whatsapp/session");
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
				history.push("/chat");
				setQrCode("");
				setSession(data.session);
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [history]);

	console.log(session);

	return (
		<div>
			<MainDrawer appTitle="QR Code">
				<div className={classes.root}>
					<main className={classes.content}>
						<div className={classes.appBarSpacer} />
						<Container maxWidth="lg" className={classes.container}>
							<Grid container spacing={3}>
								{session.status === "pending" ? (
									<Grid item xs={6}>
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

								{/* <Grid item xs={12} md={4} lg={3}>
									<Paper className={fixedHeightPaper}>
										<h1>paper2</h1>
									</Paper>
								</Grid> */}
							</Grid>
						</Container>
					</main>
				</div>
			</MainDrawer>
		</div>
	);
};

export default WhatsAuth;
