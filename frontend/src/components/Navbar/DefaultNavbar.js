import React from "react";

import { Navbar, Nav, Container } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

const LogedinNavbar = () => {
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
						</Nav>
						<LinkContainer to="/login">
							<Nav.Link href="#login">Login</Nav.Link>
						</LinkContainer>
						<LinkContainer to="/signup">
							<Nav.Link href="#signup">Signup</Nav.Link>
						</LinkContainer>
					</Navbar.Collapse>
				</Container>
			</Navbar>
		</div>
	);
};

export default LogedinNavbar;
