import React, { useState, useEffect, useContext } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import DeleteIcon from '@material-ui/icons/Delete';
import {
    Button,
    Avatar,
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
} from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import useWhatsApps from "../../hooks/useWhatsApps";
const PadraoAvatar = "vetor-de-ícone-perfil-do-avatar-padrão-foto-usuário-mídia-social-183042379 (1).png";

const useStyles = makeStyles((theme) => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
	},
	btnWrapper: {
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

	const { user: loggedInUser } = useContext(AuthContext);
	const [profileImage, setProfileImage] = useState(PadraoAvatar);
	const [profileImageFile, setProfileImageFile] = useState(null);
	const [user, setUser] = useState(initialState);
	const [selectedQueueIds, setSelectedQueueIds] = useState([]);
	const [showPassword, setShowPassword] = useState(false);
	const [whatsappId, setWhatsappId] = useState('');
	const { loading, whatsApps } = useWhatsApps();

	useEffect(() => {
		const fetchUser = async () => {
			if (!userId) return;
			try {
				const { data } = await api.get(`/users/${userId}`);
				setUser((prevState) => ({ ...prevState, ...data }));
				const userQueueIds = data.queues?.map((queue) => queue.id);
				setSelectedQueueIds(userQueueIds);
				setWhatsappId(data.whatsappId || '');
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

	const handleImageUpload = (event) => {
		const file = event.target.files?.[0];
		if (file) {
			if (file.size > 2 * 1024 * 1024) {
				toast.error("A imagem deve ter no máximo 2MB.");
				return;
			}
			
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64String = reader.result;
				setProfileImage(base64String);
				setProfileImageFile(file);
				localStorage.setItem('profileImage', base64String);
			};
			reader.readAsDataURL(file);
		}
	};

	useEffect(() => {
		const savedImage = localStorage.getItem('profileImage');
		if (savedImage) {
			setProfileImage(savedImage);
		} else {
			setProfileImage(PadraoAvatar);
		}
	}, []);

	const handleImageRemove = () => {
		setProfileImage(PadraoAvatar);
		localStorage.removeItem('profileImage');
	};

	const handleSaveUser = async (values) => {
		const userData = { ...values, whatsappId, queueIds: selectedQueueIds };
		const formData = new FormData();
		formData.append('user', JSON.stringify(userData));
		if (profileImageFile) {
			formData.append('image', profileImageFile);
		}
		try {
			const response = userId
				? await api.put(`/users/${userId}`, formData, {
						headers: { 'Content-Type': 'multipart/form-data' },
				  })
				: await api.post('/users', formData, {
						headers: { 'Content-Type': 'multipart/form-data' },
				  });
			setUser(response.data);
			toast.success(i18n.t('userModal.success'));
			handleClose();
		} catch (err) {
			toastError(err);
		}
	};
	
	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="xs"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{userId ? `${i18n.t("userModal.title.edit")}` : `${i18n.t("userModal.title.add")}`}
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
								<div>
									<Avatar src={profileImage} alt="Profile Image" style={{ width: 100, height: 100 }}>
										{!profileImage && 'U'}
									</Avatar>

									<div>
										<input
											accept="image/*"
											id="upload-image"
											type="file"
											style={{ display: 'none' }}
											onChange={handleImageUpload}
										/>
										<label htmlFor="upload-image">
											<IconButton color="primary" aria-label="upload picture" component="span">
												<PhotoCamera />
											</IconButton>
										</label>

										{profileImage && (
											<IconButton color="secondary" aria-label="remove picture" onClick={handleImageRemove}>
												<DeleteIcon />
											</IconButton>
										)}
									</div>
								</div>

								<div className={classes.multFieldLine}>
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
										type={showPassword ? 'text' : 'password'}
										InputProps={{
											endAdornment: (
												<InputAdornment position="end">
													<IconButton
														aria-label="toggle password visibility"
														onClick={() => setShowPassword((prev) => !prev)}
													>
														{showPassword ? <VisibilityOff /> : <Visibility />}
													</IconButton>
												</InputAdornment>
											),
										}}
										fullWidth
									/>
								</div>
								<div className={classes.multFieldLine}>
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
									<FormControl
										variant="outlined"
										className={classes.formControl}
										margin="dense"
									>
										<Can
											role={loggedInUser.profile}
											perform="user-modal:editProfile"
											yes={() => (
												<>
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
												</>
											)}
										/>
									</FormControl>
								</div>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editQueues"
									yes={() => (
										<QueueSelect
											selectedQueueIds={selectedQueueIds}
											onChange={setSelectedQueueIds}
										/>
									)}
								/>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editQueues"
									yes={() => (!loading && (
										<FormControl variant="outlined" margin="dense" className={classes.maxWidth} fullWidth>
											<InputLabel>{i18n.t("userModal.form.whatsapp")}</InputLabel>
											<Field
												as={Select}
												value={whatsappId}
												onChange={(e) => setWhatsappId(e.target.value)}
												label={i18n.t("userModal.form.whatsapp")}
											>
												<MenuItem value={''}>&nbsp;</MenuItem>
												{whatsApps.map((whatsapp) => (
													<MenuItem key={whatsapp.id} value={whatsapp.id}>{whatsapp.name}</MenuItem>
												))}
											</Field>
										</FormControl>
									))}
								/>
							</DialogContent>
							<DialogActions>
								<Button onClick={handleClose} color="primary">
									{i18n.t("cancel")}
								</Button>
								<div className={classes.btnWrapper}>
									<Button
										type="submit"
										color="primary"
										disabled={isSubmitting}
									>
										{userId ? i18n.t("userModal.edit") : i18n.t("userModal.add")}
									</Button>
									{isSubmitting && <CircularProgress size={24} className={classes.buttonProgress} />}
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
