import React from "react";
import { BrowserRouter, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import MainDrawer from "../components/_layout";
import Dashboard from "../pages/Dashboard/";
import Chat from "../pages/Chat/";
import Signup from "../pages/Signup/";
import Login from "../pages/Login/";
import WhatsAuth from "../pages/WhatsAuth/WhatsAuth";
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
						<Route exact path="/chat/:ticketId?" component={Chat} isPrivate />
						<Route exact path="/whats-auth" component={WhatsAuth} isPrivate />
						<Route exact path="/contacts" component={Contacts} isPrivate />
					</MainDrawer>
				</Switch>
				<ToastContainer autoClose={3000} />
			</AuthProvider>
		</BrowserRouter>
	);
};

export default Routes;
