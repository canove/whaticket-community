import React from "react";
import { useHistory } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import "./Navbar.css";

const DefaultNavbar = () => {
	const username = localStorage.getItem("username");
	const history = useHistory();

	const handleLogout = e => {
		e.preventDefault();
		localStorage.removeItem("token");
		localStorage.removeItem("userName");
		localStorage.removeItem("userId");
		history.push("/");
	};

	return (
		<div>
			<Navbar variant="dark" bg="dark" expand="lg">
				<Container>
					<LinkContainer to="/" style={{ color: "#519032" }}>
						<Navbar.Brand>EconoWhatsBot</Navbar.Brand>
					</LinkContainer>
					<Navbar.Toggle aria-controls="responsive-navbar-nav" />
					<Navbar.Collapse id="responsive-navbar-nav">
						<Nav className="mr-auto">
							<LinkContainer to="/">
								<Nav.Link href="#home">Home</Nav.Link>
							</LinkContainer>
							<LinkContainer to="/chat">
								<Nav.Link href="#link">Chat</Nav.Link>
							</LinkContainer>
							<LinkContainer to="/chat2">
								<Nav.Link href="#link">Chat MaterialUi</Nav.Link>
							</LinkContainer>
						</Nav>
						<Navbar.Text>
							Logado como: <a href="#login">{username}</a>
						</Navbar.Text>
						<Nav.Link href="#logout" onClick={handleLogout}>
							Logout
						</Nav.Link>
					</Navbar.Collapse>
				</Container>
			</Navbar>
		</div>
	);
};

export default DefaultNavbar;
