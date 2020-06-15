import React, { useContext } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import { AuthContext, AuthProvider } from "./Context/Auth/AuthContext";

import Dashboard from "./pages/Home/Dashboard";
import Chat from "./pages/Chat/Chat";
import Profile from "./pages/Profile/Profile";
import Signup from "./pages/Signup/Signup";
import Login from "./pages/Login/Login";
import WhatsAuth from "./pages/WhatsAuth/WhatsAuth";

const PrivateRoute = ({ component: Component, ...rest }) => {
	const { isAuth, loading } = useContext(AuthContext);

	if (loading) return <h1>Loading...</h1>;

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
	const { isAuth, loading } = useContext(AuthContext);

	if (loading) return <h1>Loading...</h1>;

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
					<PrivateRoute exact path="/" component={Dashboard} />
					<PrivateRoute exact path="/chat" component={Chat} />
					<PrivateRoute exact path="/profile" component={Profile} />
					<PrivateRoute exact path="/whats-auth" component={WhatsAuth} />
					<PublicRoute exact path="/login" component={Login} />
					<PublicRoute exact path="/signup" component={Signup} />
				</Switch>
			</AuthProvider>
		</BrowserRouter>
	);
};

export default Routes;
