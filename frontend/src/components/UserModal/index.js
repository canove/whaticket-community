import React, { useState, useEffect, useContext } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	CircularProgress,
	Select,
	InputLabel,
	MenuItem,
	FormControl,
	TextField,
	InputAdornment,
	IconButton,
	Typography,
} from "@mui/material";

import { Eye as Visibility, EyeOff as VisibilityOff } from "lucide-react";

import makeStyles from '@mui/styles/makeStyles';

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import useWhatsApps from "../../hooks/useWhatsApps";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},

	dialogTitle: {
		padding: "24px 24px 16px",
		borderBottom: "1px solid #E5E9EF",
		"& h2": {
			fontFamily: '"Fraunces", Georgia, serif',
			fontWeight: 700,
			fontSize: 20,
			color: "#0A0F1E",
			letterSpacing: "-0.3px",
		},
	},

	dialogContent: {
		padding: "24px",
		display: "flex",
		flexDirection: "column",
		gap: 16,
	},

	fieldRow: {
		display: "flex",
		gap: theme.spacing(2),
		"& > *": {
			flex: 1,
		},
	},

	formControl: {
		flex: 1,
	},

	selectLabel: {
		fontFamily: '"DM Sans", system-ui, sans-serif',
	},

	dialogActions: {
		padding: "16px 24px",
		borderTop: "1px solid #E5E9EF",
		gap: 8,
	},

	btnWrapper: {
		position: "relative",
	},

	buttonProgress: {
		color: "#25D366",
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},

	cancelBtn: {
		fontFamily: '"DM Sans", system-ui, sans-serif',
		fontWeight: 500,
		color: "#9BA3B0",
		borderColor: "#E5E9EF",
		borderRadius: 11,
		"&:hover": {
			borderColor: "#9BA3B0",
			backgroundColor: "#F7F8FA",
		},
	},

	saveBtn: {
		fontFamily: '"DM Sans", system-ui, sans-serif',
		fontWeight: 600,
		borderRadius: 11,
		background: "linear-gradient(135deg, #25D366 0%, #1DAB57 100%)",
		color: "#ffffff",
		boxShadow: "none",
		"&:hover": {
			background: "linear-gradient(135deg, #1DAB57 0%, #158A3E 100%)",
			boxShadow: "none",
		},
		"&:disabled": {
			background: "#E5E9EF",
			color: "#9BA3B0",
		},
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

	const { user: loggedInUser } = useContext(AuthContext);

	const [user, setUser] = useState(initialState);
	const [selectedQueueIds, setSelectedQueueIds] = useState([]);
	const [showPassword, setShowPassword] = useState(false);
	const [whatsappId, setWhatsappId] = useState(false);
	const { loading, whatsApps } = useWhatsApps();

	useEffect(() => {
		const fetchUser = async () => {
			if (!userId) return;
			try {
				const { data } = await api.get(`/users/${userId}`);
				setUser(prevState => ({ ...prevState, ...data }));
				const userQueueIds = data.queues?.map(queue => queue.id);
				setSelectedQueueIds(userQueueIds);
				setWhatsappId(data.whatsappId ? data.whatsappId : "");
			} catch (err) {
				toastError(err);
			}
		};
		fetchUser();
	}, [userId, open]);

	const handleClose = () => {
		onClose();
		setUser(initialState);
	};

	const handleSaveUser = async values => {
		const userData = { ...values, whatsappId, queueIds: selectedQueueIds };
		try {
			if (userId) {
				await api.put(`/users/${userId}`, userData);
			} else {
				await api.post("/users", userData);
			}
			toast.success(i18n.t("userModal.success"));
		} catch (err) {
			toastError(err);
		}
		handleClose();
	};

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="xs"
				fullWidth
				scroll="paper"
				PaperProps={{
					style: {
						borderRadius: 14,
						border: "1px solid #E5E9EF",
					},
				}}
			>
				<DialogTitle className={classes.dialogTitle}>
					{userId
						? i18n.t("userModal.title.edit")
						: i18n.t("userModal.title.add")}
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
							<DialogContent className={classes.dialogContent}>
								<div className={classes.fieldRow}>
									<Field
										as={TextField}
										label={i18n.t("userModal.form.name")}
										autoFocus
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										fullWidth
									/>
									<Field
										as={TextField}
										name="password"
										variant="outlined"
										margin="dense"
										label={i18n.t("userModal.form.password")}
										error={touched.password && Boolean(errors.password)}
										helperText={touched.password && errors.password}
										type={showPassword ? "text" : "password"}
										InputProps={{
											endAdornment: (
												<InputAdornment position="end">
													<IconButton
														aria-label="toggle password visibility"
														onClick={() => setShowPassword(e => !e)}
														edge="end"
														size="small"
														style={{ color: "#9BA3B0" }}
													>
														{showPassword ? <VisibilityOff size={18} /> : <Visibility size={18} />}
													</IconButton>
												</InputAdornment>
											),
										}}
										fullWidth
									/>
								</div>

								<div className={classes.fieldRow}>
									<Field
										as={TextField}
										label={i18n.t("userModal.form.email")}
										name="email"
										error={touched.email && Boolean(errors.email)}
										helperText={touched.email && errors.email}
										variant="outlined"
										margin="dense"
										fullWidth
									/>
									<Can
										role={loggedInUser.profile}
										perform="user-modal:editProfile"
										yes={() => (
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
										)}
									/>
								</div>

								<Can
									role={loggedInUser.profile}
									perform="user-modal:editQueues"
									yes={() => (
										<QueueSelect
											selectedQueueIds={selectedQueueIds}
											onChange={values => setSelectedQueueIds(values)}
										/>
									)}
								/>

								<Can
									role={loggedInUser.profile}
									perform="user-modal:editQueues"
									yes={() =>
										!loading && (
											<FormControl
												variant="outlined"
												margin="dense"
												fullWidth
											>
												<InputLabel>{i18n.t("userModal.form.whatsapp")}</InputLabel>
												<Field
													as={Select}
													value={whatsappId}
													onChange={e => setWhatsappId(e.target.value)}
													label={i18n.t("userModal.form.whatsapp")}
												>
													<MenuItem value="">&nbsp;</MenuItem>
													{whatsApps.map(whatsapp => (
														<MenuItem key={whatsapp.id} value={whatsapp.id}>
															{whatsapp.name}
														</MenuItem>
													))}
												</Field>
											</FormControl>
										)
									}
								/>
							</DialogContent>

							<DialogActions className={classes.dialogActions}>
								<Button
									onClick={handleClose}
									disabled={isSubmitting}
									variant="outlined"
									className={classes.cancelBtn}
								>
									{i18n.t("userModal.buttons.cancel")}
								</Button>
								<div className={classes.btnWrapper}>
									<Button
										type="submit"
										disabled={isSubmitting}
										variant="contained"
										className={classes.saveBtn}
									>
										{userId
											? i18n.t("userModal.buttons.okEdit")
											: i18n.t("userModal.buttons.okAdd")}
									</Button>
									{isSubmitting && (
										<CircularProgress
											size={24}
											className={classes.buttonProgress}
										/>
									)}
								</div>
							</DialogActions>
						</Form>
					)}
				</Formik>
			</Dialog>
		</div>
	);
};

export default UserModal;
