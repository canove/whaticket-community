import React, { useState, useEffect } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	textField: {
		// marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		// width: "25ch",
		flex: 1,
	},

	btnWrapper: {
		// margin: theme.spacing(1),
		position: "relative",
	},

	buttonProgress: {
		color: green[500],
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},
	formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
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

const UserModal = ({ open, onClose, userId }) => {
	const classes = useStyles();

	const initialState = {
		name: "",
		email: "",
		password: "",
		profile: "user",
	};

	const [user, setUser] = useState(initialState);

	useEffect(() => {
		const fetchUser = async () => {
			if (!userId) return;
			try {
				const { data } = await api.get(`/users/${userId}`);
				setUser(prevState => {
					return { ...prevState, ...data };
				});
			} catch (err) {
				const errorMsg = err.response?.data?.error;
				if (errorMsg) {
					if (i18n.exists(`backendErrors.${errorMsg}`)) {
						toast.error(i18n.t(`backendErrors.${errorMsg}`));
					} else {
						toast.error(err.response.data.error);
					}
				} else {
					toast.error("Unknown error");
				}
			}
		};

		fetchUser();
	}, [userId, open]);

	const handleClose = () => {
		onClose();
		setUser(initialState);
	};

	const handleSaveUser = async values => {
		try {
			if (userId) {
				await api.put(`/users/${userId}`, values);
			} else {
				await api.post("/users", values);
			}
			toast.success(i18n.t("userModal.success"));
		} catch (err) {
			const errorMsg = err.response?.data?.error;
			if (errorMsg) {
				if (i18n.exists(`backendErrors.${errorMsg}`)) {
					toast.error(i18n.t(`backendErrors.${errorMsg}`));
				} else {
					toast.error(err.response.data.error);
				}
			} else {
				toast.error("Unknown error");
			}
		}
		handleClose();
	};

	return (
		<div className={classes.root}>
			<Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="paper">
				<DialogTitle id="form-dialog-title">
					{userId
						? `${i18n.t("userModal.title.edit")}`
						: `${i18n.t("userModal.title.add")}`}
				</DialogTitle>
				<Formik
					initialValues={user}
					enableReinitialize={true}
					validationSchema={UserSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveUser(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting }) => (
						<Form>
							<DialogContent dividers>
								<Field
									as={TextField}
									label={i18n.t("userModal.form.name")}
									autoFocus
									name="name"
									error={touched.name && Boolean(errors.name)}
									helperText={touched.name && errors.name}
									variant="outlined"
									margin="dense"
									className={classes.textField}
								/>
								<Field
									as={TextField}
									label={i18n.t("userModal.form.email")}
									name="email"
									error={touched.email && Boolean(errors.email)}
									helperText={touched.email && errors.email}
									variant="outlined"
									margin="dense"
								/>
								<div>
									<Field
										as={TextField}
										label={i18n.t("userModal.form.password")}
										type="password"
										name="password"
										error={touched.password && Boolean(errors.password)}
										helperText={touched.password && errors.password}
										variant="outlined"
										margin="dense"
									/>
									<FormControl
										variant="outlined"
										className={classes.formControl}
										margin="dense"
									>
										<InputLabel id="profile-selection-input-label">
											{i18n.t("userModal.form.profile")}
										</InputLabel>
										<Field
											as={Select}
											label={i18n.t("userModal.form.profile")}
											name="profile"
											labelId="profile-selection-label"
											id="profile-selection"
											required
										>
											<MenuItem value="admin">Admin</MenuItem>
											<MenuItem value="user">User</MenuItem>
										</Field>
									</FormControl>
								</div>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("userModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{userId
										? `${i18n.t("userModal.buttons.okEdit")}`
										: `${i18n.t("userModal.buttons.okAdd")}`}
									{isSubmitting && (
										<CircularProgress
											size={24}
											className={classes.buttonProgress}
										/>
									)}
								</Button>
							</DialogActions>
						</Form>
					)}
				</Formik>
			</Dialog>
		</div>
	);
};

export default UserModal;
