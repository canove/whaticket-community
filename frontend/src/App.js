import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import Dashboard from "./pages/Home/Dashboard";
import Chat from "./pages/Chat/Chat";
import Profile from "./pages/Profile/Profile";
import Signup from "./pages/Signup/Signup";
import Login from "./pages/Login/Login";
import "./App.css";

const App = () => {
	const showToast = (type, message) => {
		switch (type) {
			case 0:
				toast.warning(message);
				break;
			case 1:
				toast.success(message);
				break;
			default:
				break;
		}
	};

	return (
		<BrowserRouter>
			<ToastContainer
				autoClose={2000}
				hideProgressBar={true}
				position={toast.POSITION.TOP_CENTER}
			/>
			<Switch>
				<Route exact path="/" render={props => <Dashboard />} />
				<Route
					exact
					path="/login"
					render={props => <Login showToast={showToast} />}
				/>
				<Route
					exact
					path="/profile"
					render={props => <Profile showToast={showToast} />}
				/>
				<Route
					exact
					path="/signup"
					render={props => <Signup showToast={showToast} />}
				/>
				<Route
					exact
					path="/chat"
					render={props => <Chat showToast={showToast} />}
				/>
			</Switch>
		</BrowserRouter>
	);
};

export default App;
