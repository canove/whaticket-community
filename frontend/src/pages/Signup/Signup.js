import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import api from "../../util/api";
import LogedinNavbar from "../../components/Navbar/LogedinNavbar";
import DefaultNavbar from "../../components/Navbar/DefaultNavbar";

import { Container, Form, Button } from "react-bootstrap";

const Signup = () => {
	const history = useHistory();
	const initialState = { name: "", email: "", password: "" };
	const [user, setUser] = useState(initialState);

	const handleChangeInput = e => {
		setUser({ ...user, [e.target.name]: e.target.value });
	};

	const handleSignUp = async e => {
		e.preventDefault();
		try {
			await api.put("/auth/signup", user);
		} catch (err) {
			alert(err);
		}
		history.push("/login");
	};

	return (
		<div>
			{localStorage.getItem("token") ? (
				<div>
					<LogedinNavbar />
					<h1> Você está logado </h1>
				</div>
			) : (
				<div>
					<DefaultNavbar />
					<br></br>
					<Container>
						<Form onSubmit={handleSignUp}>
							<Form.Group>
								{/* <Form.Label>Nome</Form.Label> */}
								<Form.Control
									name="name"
									type="text"
									placeholder="Nome"
									value={user.name}
									onChange={handleChangeInput}
								/>
							</Form.Group>
							<Form.Group>
								{/* <Form.Label>Email address</Form.Label> */}
								<Form.Control
									name="email"
									type="email"
									placeholder="Email"
									value={user.email}
									onChange={handleChangeInput}
								/>
							</Form.Group>

							<Form.Group>
								{/* <Form.Label>Password</Form.Label> */}
								<Form.Control
									name="password"
									type="password"
									placeholder="Senha"
									value={user.password}
									onChange={handleChangeInput}
								/>
								<Form.Text className="text-muted">
									Mínimo de 5 caracteres.
								</Form.Text>
							</Form.Group>

							<Button variant="primary" type="submit">
								Submit
							</Button>
						</Form>
					</Container>
				</div>
			)}
			<br></br>
		</div>
	);
};

export default Signup;
