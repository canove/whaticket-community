import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import api from "../../util/api";
import LogedinNavbar from "../../components/Navbar/LogedinNavbar";
import DefaultNavbar from "../../components/Navbar/DefaultNavbar";

import { Container, Form, Button } from "react-bootstrap";

const Login = ({ showToast }) => {
	const [user, setUser] = useState({ email: "", password: "" });
	const history = useHistory();

	// const [token, setToken] = useState(null);
	// const [userId, setUserId] = useState(null);

	const handleLogin = async e => {
		e.preventDefault();
		try {
			const res = await api.post("/auth/login", user);

			// setToken(res.data.token);
			// setUserId(res.data.userId);

			localStorage.setItem("token", res.data.token);
			localStorage.setItem("username", res.data.username);
			localStorage.setItem("userId", res.data.userId);
			const remainingMilliseconds = 60 * 60 * 1000;
			const expiryDate = new Date(new Date().getTime() + remainingMilliseconds);
			localStorage.setItem("expiryDate", expiryDate.toISOString());
			showToast(1, "Login efetuado com sucesso");
			history.push("/chat");
		} catch (err) {
			alert(err.response.data.message);
		}
	};

	const handleChangeInput = e => {
		setUser({ ...user, [e.target.name]: e.target.value });
	};

	return (
		<div>
			{localStorage.getItem("token") ? <LogedinNavbar /> : <DefaultNavbar />}
			<div>
				<br></br>
				<Container>
					<Form onSubmit={e => handleLogin(e, user)}>
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
						</Form.Group>

						<Button variant="primary" type="submit">
							Entrar
						</Button>
					</Form>
				</Container>
			</div>
		</div>
	);
};

export default Login;
