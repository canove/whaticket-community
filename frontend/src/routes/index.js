import React from "react";
import { BrowserRouter, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import MainDrawer from "../components/_layout";
import Dashboard from "../pages/Dashboard/";
import Tickets from "../pages/Tickets/";
import Signup from "../pages/Signup/";
import Login from "../pages/Login/";
import Connection from "../pages/Connection/";
import Settings from "../pages/Settings/";
import Users from "../pages/Users";
import Contacts from "../pages/Contacts/";
import { AuthProvider } from "../context/Auth/AuthContext";
import Route from "./Route";

const Routes = () => {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Switch>
					<Route exact path="/login" component={Login} />
					<Route exact path="/signup" component={Signup} />
					<MainDrawer>
						<Route exact path="/" component={Dashboard} isPrivate />
						<Route
							exact
							path="/tickets/:ticketId?"
							component={Tickets}
							isPrivate
						/>
						<Route exact path="/connection" component={Connection} isPrivate />
						<Route exact path="/contacts" component={Contacts} isPrivate />
						<Route exact path="/users" component={Users} isPrivate />
						<Route exact path="/Settings" component={Settings} isPrivate />
					</MainDrawer>
				</Switch>
				<ToastContainer autoClose={3000} />
			</AuthProvider>
		</BrowserRouter>
	);
};

export default Routes;
