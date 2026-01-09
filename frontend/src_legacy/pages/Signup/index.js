import React, { useState } from "react";

import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";

import {
	Avatar,
	Button,
	CssBaseline,
	TextField,
	Grid,
	Box,
	Typography,
	Container,
	InputAdornment,
	IconButton,
	Link
} from '@material-ui/core';

import { LockOutlined, Visibility, VisibilityOff } from '@material-ui/icons';

import { makeStyles } from "@material-ui/core/styles";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";

// const Copyright = () => {
// 	return (
// 		<Typography variant="body2" color="textSecondary" align="center">
// 			{"Copyleft "}
// 			<Link color="inherit" href="https://github.com/canove">
// 				Canove
// 			</Link>{" "}
// 			{new Date().getFullYear()}
// 			{"."}
// 		</Typography>
// 	);
// };

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
		width: "100%",
		marginTop: theme.spacing(3),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
}));

const UserSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	password: Yup.string().min(5, "Too Short!").max(50, "Too Long!"),
	email: Yup.string().email("Invalid email").required("Required"),
});

const SignUp = () => {
	const classes = useStyles();
	const history = useHistory();

	const initialState = { name: "", email: "", password: "" };
	const [showPassword, setShowPassword] = useState(false);
	const [user] = useState(initialState);

	const handleSignUp = async values => {
		try {
			await api.post("/auth/signup", values);
			toast.success(i18n.t("signup.toasts.success"));
			history.push("/login");
		} catch (err) {
			toastError(err);
		}
	};

	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<div className={classes.paper}>
				<Avatar className={classes.avatar}>
					<LockOutlined />
				</Avatar>
				<Typography component="h1" variant="h5">
					{i18n.t("signup.title")}
				</Typography>
				{/* <form className={classes.form} noValidate onSubmit={handleSignUp}> */}
				<Formik
					initialValues={user}
					enableReinitialize={true}
					validationSchema={UserSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSignUp(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting }) => (
						<Form className={classes.form}>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<Field
										as={TextField}
										autoComplete="name"
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										fullWidth
										id="name"
										label={i18n.t("signup.form.name")}
										autoFocus
									/>
								</Grid>

								<Grid item xs={12}>
									<Field
										as={TextField}
										variant="outlined"
										fullWidth
										id="email"
										label={i18n.t("signup.form.email")}
										name="email"
										error={touched.email && Boolean(errors.email)}
										helperText={touched.email && errors.email}
										autoComplete="email"
									/>
								</Grid>
								<Grid item xs={12}>
									<Field
										as={TextField}
										variant="outlined"
										fullWidth
										name="password"
										id="password"
										autoComplete="current-password"
										error={touched.password && Boolean(errors.password)}
										helperText={touched.password && errors.password}
										label={i18n.t("signup.form.password")}
										type={showPassword ? 'text' : 'password'}
										InputProps={{
											endAdornment: (
												<InputAdornment position="end">
													<IconButton
														aria-label="toggle password visibility"
														onClick={() => setShowPassword((e) => !e)}
													>
														{showPassword ? <VisibilityOff /> : <Visibility />}
													</IconButton>
												</InputAdornment>
											)
										}}
									/>
								</Grid>
							</Grid>
							<Button
								type="submit"
								fullWidth
								variant="contained"
								color="primary"
								className={classes.submit}
							>
								{i18n.t("signup.buttons.submit")}
							</Button>
							<Grid container justifyContent="flex-end">
								<Grid item>
									<Link
										href="#"
										variant="body2"
										component={RouterLink}
										to="/login"
									>
										{i18n.t("signup.buttons.login")}
									</Link>
								</Grid>
							</Grid>
						</Form>
					)}
				</Formik>
			</div>
			<Box mt={5}>{/* <Copyright /> */}</Box>
		</Container>
	);
};

export default SignUp;
