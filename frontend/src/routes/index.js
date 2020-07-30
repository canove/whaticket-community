import React, { useContext } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";

import MainDrawer from "../components/MainDrawer";
import Dashboard from "../pages/Dashboard/";
import Chat from "../pages/Chat/";
import Signup from "../pages/Signup/";
import Login from "../pages/Login/";
import WhatsAuth from "../pages/WhatsAuth/WhatsAuth";
import Contacts from "../pages/Contacts/";
import { AuthContext, AuthProvider } from "../context/Auth/AuthContext";

const useStyles = makeStyles(theme => ({
	backdrop: {
		zIndex: theme.zIndex.drawer + 1,
		color: "#fff",
	},
}));

const PrivateRoute = ({ component: Component, ...rest }) => {
	const classes = useStyles();
	const { isAuth, loading } = useContext(AuthContext);

	if (loading)
		return (
			<Backdrop className={classes.backdrop} open={loading}>
				<CircularProgress color="inherit" />
			</Backdrop>
		);

	return (
		<Route
			{...rest}
			render={props =>
				isAuth ? (
					<Component {...props} />
				) : (
					<Redirect
						to={{ pathname: "/login", state: { from: props.location } }}
					/>
				)
			}
		/>
	);
};

const PublicRoute = ({ component: Component, ...rest }) => {
	const classes = useStyles();
	const { isAuth, loading } = useContext(AuthContext);

	if (loading)
		return (
			<Backdrop className={classes.backdrop} open={loading}>
				<CircularProgress color="inherit" />
			</Backdrop>
		);

	return (
		<Route
			{...rest}
			render={props =>
				!isAuth ? (
					<Component {...props} />
				) : (
					<Redirect to={{ pathname: "/", state: { from: props.location } }} />
				)
			}
		/>
	);
};

const Routes = () => {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Switch>
					<PublicRoute exact path="/login" component={Login} />
					<PublicRoute exact path="/signup" component={Signup} />
					<MainDrawer>
						<PrivateRoute exact path="/" component={Dashboard} />
						<PrivateRoute exact path="/chat/:ticketId?" component={Chat} />
						<PrivateRoute exact path="/whats-auth" component={WhatsAuth} />
						<PrivateRoute exact path="/contacts" component={Contacts} />
					</MainDrawer>
				</Switch>
			</AuthProvider>
		</BrowserRouter>
	);
};

export default Routes;
