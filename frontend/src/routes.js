import React, { useContext } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import { AuthContext, AuthProvider } from "./Context/Auth/AuthContext";

import MainDrawer from "./components/Layout/MainDrawer";
import Dashboard from "./pages/Home/Dashboard";
import Chat from "./pages/Chat/Chat";
import Profile from "./pages/Profile/Profile";
import Signup from "./pages/Signup/Signup";
import Login from "./pages/Login/Login";
import WhatsAuth from "./pages/WhatsAuth/WhatsAuth";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";

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
						<PrivateRoute exact path="/profile" component={Profile} />
						<PrivateRoute exact path="/whats-auth" component={WhatsAuth} />
					</MainDrawer>
				</Switch>
			</AuthProvider>
		</BrowserRouter>
	);
};

export default Routes;
