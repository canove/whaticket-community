import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import makeStyles from '@mui/styles/makeStyles';
import {
	Dialog,
	DialogContent,
	Button,
	DialogActions,
	CircularProgress,
	TextField,
	Switch,
	FormControlLabel,
	Typography,
} from "@mui/material";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";

const useStyles = makeStyles(() => ({
	dialogTitle: {
		padding: "22px 24px 0",
		fontFamily: '"Fraunces", Georgia, serif',
		fontWeight: 700,
		fontSize: 18,
		color: "#0A0F1E",
		letterSpacing: "-0.3px",
	},

	dialogContent: {
		padding: "20px 24px",
		display: "flex",
		flexDirection: "column",
		gap: 20,
	},

	section: {
		display: "flex",
		flexDirection: "column",
		gap: 12,
	},

	sectionLabel: {
		fontFamily: '"DM Sans", system-ui, sans-serif',
		fontWeight: 600,
		fontSize: 11,
		color: "#9BA3B0",
		letterSpacing: "0.6px",
		textTransform: "uppercase",
		margin: 0,
	},

	fieldRow: {
		display: "flex",
		alignItems: "center",
		gap: 16,
	},

	field: {
		flex: 1,
		"& .MuiOutlinedInput-root": {
			borderRadius: 11,
			fontFamily: '"DM Sans", system-ui, sans-serif',
			fontSize: 14,
			"& fieldset": { borderColor: "#E5E9EF" },
			"&:hover fieldset": { borderColor: "#25D366" },
			"&.Mui-focused fieldset": { borderColor: "#25D366", borderWidth: 1.5 },
		},
		"& .MuiInputLabel-outlined": {
			fontFamily: '"DM Sans", system-ui, sans-serif',
			fontSize: 14,
			color: "#9BA3B0",
		},
		"& .MuiInputLabel-outlined.Mui-focused": {
			color: "#25D366",
		},
		"& .MuiFormHelperText-root": {
			fontFamily: '"DM Sans", system-ui, sans-serif',
			fontSize: 11,
		},
	},

	switchLabel: {
		fontFamily: '"DM Sans", system-ui, sans-serif',
		fontSize: 14,
		color: "#0A0F1E",
		whiteSpace: "nowrap",
	},

	switch: {
		"& .MuiSwitch-switchBase.Mui-checked": {
			color: "#25D366",
		},
		"& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
			backgroundColor: "#25D366",
		},
	},

	dialogActions: {
		padding: "12px 24px 20px",
		gap: 10,
	},

	cancelBtn: {
		borderRadius: 11,
		border: "1px solid #E5E9EF",
		color: "#9BA3B0",
		fontFamily: '"DM Sans", system-ui, sans-serif',
		fontWeight: 600,
		fontSize: 13,
		textTransform: "none",
		height: 40,
		padding: "0 20px",
		backgroundColor: "transparent",
		boxShadow: "none",
		"&:hover": {
			backgroundColor: "#F7F8FA",
			boxShadow: "none",
		},
	},

	saveBtn: {
		borderRadius: 11,
		background: "linear-gradient(135deg, #25D366, #1DAB57)",
		color: "#ffffff",
		fontFamily: '"DM Sans", system-ui, sans-serif',
		fontWeight: 600,
		fontSize: 13,
		textTransform: "none",
		height: 40,
		padding: "0 24px",
		boxShadow: "none",
		position: "relative",
		"&:hover": {
			background: "linear-gradient(135deg, #1DAB57, #178A45)",
			boxShadow: "none",
		},
		"&.Mui-disabled": {
			opacity: 0.7,
			color: "#ffffff",
		},
	},

	buttonProgress: {
		color: "#ffffff",
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -9,
		marginLeft: -9,
	},

	channelSelector: {
		display: "flex",
		gap: 8,
		borderRadius: 11,
		background: "#F7F8FA",
		padding: 4,
		border: "1px solid #E5E9EF",
	},

	channelBtn: {
		flex: 1,
		borderRadius: 8,
		fontFamily: '"DM Sans", system-ui, sans-serif',
		fontWeight: 600,
		fontSize: 13,
		textTransform: "none",
		height: 36,
		border: "none",
		cursor: "pointer",
		transition: "all 150ms ease",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		backgroundColor: "transparent",
		color: "#9BA3B0",
	},

	channelBtnActive: {
		backgroundColor: "#ffffff",
		boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
	},

	channelBtnWhatsapp: {
		color: "#1DAB57",
	},

	channelBtnInstagram: {
		color: "#e6683c",
	},

	channelBtnCloud: {
		color: "#128C7E",
	},
}));

const SessionSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
});

const WhatsAppModal = ({ open, onClose, whatsAppId }) => {
	const classes = useStyles();
	const initialState = {
		name: "",
		greetingMessage: "",
		farewellMessage: "",
		isDefault: false,
	};
	const [whatsApp, setWhatsApp] = useState(initialState);
	const [selectedQueueIds, setSelectedQueueIds] = useState([]);
	const [channel, setChannel] = useState("whatsapp");

	useEffect(() => {
		const fetchSession = async () => {
			if (!whatsAppId) return;
			try {
				const { data } = await api.get(`whatsapp/${whatsAppId}`);
				setWhatsApp(data);
				setChannel(data.channel || "whatsapp");
				const whatsQueueIds = data.queues?.map(queue => queue.id);
				setSelectedQueueIds(whatsQueueIds);
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, [whatsAppId]);

	const handleSaveWhatsApp = async values => {
		const whatsappData = { ...values, queueIds: selectedQueueIds, channel };
		try {
			if (whatsAppId) {
				await api.put(`/whatsapp/${whatsAppId}`, whatsappData);
			} else {
				await api.post("/whatsapp", whatsappData);
			}
			toast.success(i18n.t("whatsappModal.success"));
			handleClose();
		} catch (err) {
			toastError(err);
		}
	};

	const handleClose = () => {
		onClose();
		setWhatsApp(initialState);
		setChannel("whatsapp");
	};

	return (
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
					boxShadow: "0 8px 32px rgba(10,15,30,0.10)",
				},
			}}
		>
			<div className={classes.dialogTitle}>
				{whatsAppId
					? i18n.t("whatsappModal.title.edit")
					: i18n.t("whatsappModal.title.add")}
			</div>

			<Formik
				initialValues={whatsApp}
				enableReinitialize={true}
				validationSchema={SessionSchema}
				onSubmit={(values, actions) => {
					setTimeout(() => {
						handleSaveWhatsApp(values);
						actions.setSubmitting(false);
					}, 400);
				}}
			>
				{({ values, touched, errors, isSubmitting }) => (
					<Form>
						<DialogContent className={classes.dialogContent}>

							{/* Seletor de canal — apenas na criação */}
							{!whatsAppId && (
								<div className={classes.section}>
									<p className={classes.sectionLabel}>Canal</p>
									<div className={classes.channelSelector}>
										<button
											type="button"
											className={`${classes.channelBtn} ${channel === "whatsapp" ? `${classes.channelBtnActive} ${classes.channelBtnWhatsapp}` : ""}`}
											onClick={() => setChannel("whatsapp")}
										>
											📱 WhatsApp
										</button>
										<button
											type="button"
											className={`${classes.channelBtn} ${channel === "instagram" ? `${classes.channelBtnActive} ${classes.channelBtnInstagram}` : ""}`}
											onClick={() => setChannel("instagram")}
										>
											📸 Instagram
										</button>
										<button
											type="button"
											className={`${classes.channelBtn} ${channel === "whatsapp_cloud" ? `${classes.channelBtnActive} ${classes.channelBtnCloud}` : ""}`}
											onClick={() => setChannel("whatsapp_cloud")}
										>
											☁️ WA Cloud
										</button>
									</div>
								</div>
							)}

							{/* Seção: Identificação */}
							<div className={classes.section}>
								<p className={classes.sectionLabel}>Identificação</p>
								<div className={classes.fieldRow}>
									<Field
										as={TextField}
										label={i18n.t("whatsappModal.form.name")}
										autoFocus
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										size="small"
										className={classes.field}
									/>
									{channel === "whatsapp" && (
										<FormControlLabel
											control={
												<Field
													as={Switch}
													name="isDefault"
													checked={values.isDefault}
													className={classes.switch}
												/>
											}
											label={
												<Typography className={classes.switchLabel}>
													{i18n.t("whatsappModal.form.default")}
												</Typography>
											}
										/>
									)}
								</div>
							</div>

							{/* Seção: Mensagens automáticas */}
							<div className={classes.section}>
								<p className={classes.sectionLabel}>Mensagens automáticas</p>
								<Field
									as={TextField}
									label={i18n.t("queueModal.form.greetingMessage")}
									multiline
									rows={3}
									fullWidth
									name="greetingMessage"
									error={touched.greetingMessage && Boolean(errors.greetingMessage)}
									helperText={touched.greetingMessage && errors.greetingMessage}
									variant="outlined"
									size="small"
									className={classes.field}
								/>
								<Field
									as={TextField}
									label={i18n.t("whatsappModal.form.farewellMessage")}
									multiline
									rows={3}
									fullWidth
									name="farewellMessage"
									error={touched.farewellMessage && Boolean(errors.farewellMessage)}
									helperText={touched.farewellMessage && errors.farewellMessage}
									variant="outlined"
									size="small"
									className={classes.field}
								/>
							</div>

							{/* Seção: Filas */}
							<div className={classes.section}>
								<p className={classes.sectionLabel}>Filas de atendimento</p>
								<QueueSelect
									selectedQueueIds={selectedQueueIds}
									onChange={selectedIds => setSelectedQueueIds(selectedIds)}
								/>
							</div>

						</DialogContent>

						<DialogActions className={classes.dialogActions}>
							<Button
								onClick={handleClose}
								disabled={isSubmitting}
								variant="outlined"
								className={classes.cancelBtn}
							>
								{i18n.t("whatsappModal.buttons.cancel")}
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting}
								variant="contained"
								className={classes.saveBtn}
							>
								{whatsAppId
									? i18n.t("whatsappModal.buttons.okEdit")
									: i18n.t("whatsappModal.buttons.okAdd")}
								{isSubmitting && (
									<CircularProgress size={18} className={classes.buttonProgress} />
								)}
							</Button>
						</DialogActions>
					</Form>
				)}
			</Formik>
		</Dialog>
	);
};

export default React.memo(WhatsAppModal);
