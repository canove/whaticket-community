import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import makeStyles from '@mui/styles/makeStyles';
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";
import { IconButton, InputAdornment } from "@mui/material";
import { Pipette as Colorize } from "lucide-react";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import ColorPicker from "../ColorPicker";

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

	colorRow: {
		display: "flex",
		gap: theme.spacing(2),
		alignItems: "flex-start",
	},

	colorField: {
		flex: 1,
	},

	colorAdorment: {
		width: 20,
		height: 20,
		borderRadius: 5,
		border: "1px solid rgba(0,0,0,0.12)",
	},

	colorizeIcon: {
		color: "#9BA3B0",
		fontSize: 20,
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

const QueueSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	color: Yup.string().min(3, "Too Short!").max(9, "Too Long!").required(),
	greetingMessage: Yup.string(),
});

const QueueModal = ({ open, onClose, queueId }) => {
	const classes = useStyles();

	const initialState = {
		name: "",
		color: "",
		greetingMessage: "",
	};

	const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
	const [queue, setQueue] = useState(initialState);
	const greetingRef = useRef();

	useEffect(() => {
		(async () => {
			if (!queueId) return;
			try {
				const { data } = await api.get(`/queue/${queueId}`);
				setQueue(prevState => ({ ...prevState, ...data }));
			} catch (err) {
				toastError(err);
			}
		})();

		return () => {
			setQueue({ name: "", color: "", greetingMessage: "" });
		};
	}, [queueId, open]);

	const handleClose = () => {
		onClose();
		setQueue(initialState);
	};

	const handleSaveQueue = async values => {
		try {
			if (queueId) {
				await api.put(`/queue/${queueId}`, values);
			} else {
				await api.post("/queue", values);
			}
			toast.success("Queue saved successfully");
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
				maxWidth="sm"
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
					{queueId
						? i18n.t("queueModal.title.edit")
						: i18n.t("queueModal.title.add")}
				</DialogTitle>
				<Formik
					initialValues={queue}
					enableReinitialize={true}
					validationSchema={QueueSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveQueue(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting, values }) => (
						<Form>
							<DialogContent className={classes.dialogContent}>
								<div className={classes.colorRow}>
									<Field
										as={TextField}
										label={i18n.t("queueModal.form.name")}
										autoFocus
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										style={{ flex: 1 }}
									/>
									<Field
										as={TextField}
										label={i18n.t("queueModal.form.color")}
										name="color"
										id="color"
										onFocus={() => {
											setColorPickerModalOpen(true);
											greetingRef.current.focus();
										}}
										error={touched.color && Boolean(errors.color)}
										helperText={touched.color && errors.color}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<div
														style={{ backgroundColor: values.color }}
														className={classes.colorAdorment}
													/>
												</InputAdornment>
											),
											endAdornment: (
												<InputAdornment position="end">
													<IconButton
														size="small"
														onClick={() => setColorPickerModalOpen(true)}
													>
														<Colorize size={20} className={classes.colorizeIcon} />
													</IconButton>
												</InputAdornment>
											),
										}}
										variant="outlined"
										margin="dense"
										style={{ width: 160 }}
									/>
								</div>

								<ColorPicker
									open={colorPickerModalOpen}
									handleClose={() => setColorPickerModalOpen(false)}
									onChange={color => {
										values.color = color;
										setQueue(() => ({ ...values, color }));
									}}
								/>

								<Field
									as={TextField}
									label={i18n.t("queueModal.form.greetingMessage")}
									type="greetingMessage"
									multiline
									inputRef={greetingRef}
									rows={5}
									fullWidth
									name="greetingMessage"
									error={touched.greetingMessage && Boolean(errors.greetingMessage)}
									helperText={touched.greetingMessage && errors.greetingMessage}
									variant="outlined"
									margin="dense"
								/>
							</DialogContent>

							<DialogActions className={classes.dialogActions}>
								<Button
									onClick={handleClose}
									disabled={isSubmitting}
									variant="outlined"
									className={classes.cancelBtn}
								>
									{i18n.t("queueModal.buttons.cancel")}
								</Button>
								<div className={classes.btnWrapper}>
									<Button
										type="submit"
										disabled={isSubmitting}
										variant="contained"
										className={classes.saveBtn}
									>
										{queueId
											? i18n.t("queueModal.buttons.okEdit")
											: i18n.t("queueModal.buttons.okAdd")}
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

export default QueueModal;
