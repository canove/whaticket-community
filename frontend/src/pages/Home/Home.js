import React from "react";
import LogedinNavbar from "../../components/Navbar/LogedinNavbar";
import DefaultNavbar from "../../components/Navbar/DefaultNavbar";

import { Container } from "react-bootstrap";

import "./Home.css";

const Home = () => {
	return (
		<div>
			{localStorage.getItem("token") ? <LogedinNavbar /> : <DefaultNavbar />}
			<Container>
				<h1>Home</h1>
			</Container>
		</div>
	);
};

export default Home;
