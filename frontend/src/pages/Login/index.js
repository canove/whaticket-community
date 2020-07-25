import React, { useState, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";

import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
// import FormControlLabel from "@material-ui/core/FormControlLabel";
// import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

import { AuthContext } from "../../context/Auth/AuthContext";

const Copyright = () => {
	return (
		<Typography variant="body2" color="textSecondary" align="center">
			{"Copyright © "}
			<Link color="inherit" href="https://material-ui.com/">
				Canove
			</Link>{" "}
			{new Date().getFullYear()}
			{"."}
		</Typography>
	);
};

const useStyles = makeStyles(theme => ({
	paper: {
		marginTop: theme.spacing(8),
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: "100%", // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
}));

const Login = ({ showToast }) => {
	const classes = useStyles();

	const [user, setUser] = useState({ email: "", password: "" });

	const { handleLogin } = useContext(AuthContext);

	const handleChangeInput = e => {
		setUser({ ...user, [e.target.name]: e.target.value });
	};

	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<div className={classes.paper}>
				<Avatar className={classes.avatar}>
					<LockOutlinedIcon />
				</Avatar>
				<Typography component="h1" variant="h5">
					Login
				</Typography>
				<form
					className={classes.form}
					noValidate
					onSubmit={e => handleLogin(e, user)}
				>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						id="email"
						label="Email"
						name="email"
						value={user.email}
						onChange={handleChangeInput}
						autoComplete="email"
						autoFocus
					/>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						name="password"
						label="Senha"
						type="password"
						id="password"
						value={user.password}
						onChange={handleChangeInput}
						autoComplete="current-password"
					/>
					{/* <FormControlLabel
						control={<Checkbox value="remember" color="primary" />}
						label="Lembrar"
					/> */}
					<Button
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						className={classes.submit}
					>
						Entrar
					</Button>
					<Grid container>
						{/* <Grid item xs>
							<Link href="#" variant="body2">
								Forgot password?
							</Link>
						</Grid> */}
						<Grid item>
							<Link
								href="#"
								variant="body2"
								component={RouterLink}
								to="/signup"
							>
								{"Não tem uma conta? Cadastre-se!"}
							</Link>
						</Grid>
					</Grid>
				</form>
			</div>
			<Box mt={8}>
				<Copyright />
			</Box>
		</Container>
	);
};

export default Login;
