import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";

import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";

const RouteWrapper = ({ component: Component, isPrivate = false, ...rest }) => {
	const { isAuth, loading } = useContext(AuthContext);

	if (loading) return <BackdropLoading />;

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
