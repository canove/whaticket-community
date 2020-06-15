import React from "react";
import clsx from "clsx";
import MainDrawer from "../../components/Layout/MainDrawer";

import { makeStyles } from "@material-ui/core/styles";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";

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

	const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

	return (
		<div>
			<MainDrawer appTitle="QR Code">
				<div className={classes.root}>
					<main className={classes.content}>
						<div className={classes.appBarSpacer} />
						<Container maxWidth="lg" className={classes.container}>
							<Grid container spacing={3}>
								<Grid item xs={12}>
									<Paper className={classes.paper}>
										<h4>Status da conexão</h4>
									</Paper>
								</Grid>
								<Grid item xs={12}>
									<Paper className={fixedHeightPaper}>
										<h1>QR Code</h1>
									</Paper>
								</Grid>
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
