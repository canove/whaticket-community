import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";

import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";

import { AuthContext } from "../context/Auth/AuthContext";

const useStyles = makeStyles(theme => ({
	backdrop: {
		zIndex: theme.zIndex.drawer + 1,
		color: "#fff",
	},
}));

const RouteWrapper = ({ component: Component, isPrivate = false, ...rest }) => {
	const classes = useStyles();
	const { isAuth, loading } = useContext(AuthContext);

	if (loading)
		return (
			<Backdrop className={classes.backdrop} open={loading}>
				<CircularProgress color="inherit" />
			</Backdrop>
		);

	if (!isAuth && isPrivate) {
		return (
			<Redirect to={{ pathname: "/login", state: { from: rest.location } }} />
		);
	}

	if (isAuth && !isPrivate) {
		return <Redirect to={{ pathname: "/", state: { from: rest.location } }} />;
	}

	return <Route {...rest} component={Component} />;
};

export default RouteWrapper;
