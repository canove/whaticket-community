import React, { useState, useEffect, useContext } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import {
	Dialog,
	DialogContent,
	DialogTitle,
	Button,
	DialogActions,
	CircularProgress,
	TextField,
	Switch,
	FormControlLabel,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from "@material-ui/core";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";
import { useTranslation } from "react-i18next";

import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input/input'
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},

	multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(3),
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

const WhatsAppModal = ({ open, onClose, whatsAppId, connectionFileId, company }) => {
	const { i18n } = useTranslation();
	const classes = useStyles();
	const initialState = {
		name: "",
		greetingMessage: "",
		farewellMessage: "",
		isDefault: false,
		official: false,
		business: false,
		useGroup: false,
		messageCallbackUrl: "",
		statusCallbackUrl: "",
		callbackAuthorization: "",
	};

	const SessionSchema = Yup.object().shape({
		name: Yup.string()
			.min(2, `${i18n.t("whatsappModal.short")}`)
			.max(50, `${i18n.t("whatsappModal.long")}`)
			.required(`${i18n.t("whatsappModal.required")}`),
	});

	const [whatsApp, setWhatsApp] = useState(initialState);
	const [selectedQueueIds, setSelectedQueueIds] = useState([]);
	const [flows, setFlows] = useState([]);
	const [flow, setFlow] = useState("");
	const [connectionFiles, setConnectionFiles] = useState("");
	const [connectionFile, setConnectionFile] = useState("");
	// const [phoneNumber, setPhoneNumber] = useState("");
	const { user } = useContext(AuthContext);
	const [service, setService] = useState("");
	const [services, setServices] = useState([]);

	useEffect(() => {
		const fetchSession = async () => {
			if (!whatsAppId) return;

			try {
				const { data } = await api.get(`whatsapp/${whatsAppId}`, {
					params: { companyId: company }
				});
				setWhatsApp(data);
				setFlow(data.flowId);
				setConnectionFile(data.connectionFileId);
				const whatsQueueIds = data.queues?.map(queue => queue.id);
				setSelectedQueueIds(whatsQueueIds);
			} catch (err) {
				toastError(err);
			}
		};

		const fetchFlows = async () => {
			try {
				const { data } = await api.get('/flows', {
					params: { official: false, companyId: company }
				});
				setFlows(data);
			} catch (err) {
				toastError(err);
			}
		}

		const fetchConnectionFiles = async () => {
			try {
				const { data } = await api.get('/connectionFiles', {
					params: { companyId: company }
				});
				setConnectionFiles(data);
			} catch (err) {
				toastError(err);
			}
		}

		const fetchServices = async () => {
			if (user.companyId !== 1) return;

			try {
				const { data } = await api.get(`/firebase/company/${user.companyId}`);
				setServices(data);
			} catch (err) {
				toastError(err);
			}
		}

		setConnectionFile(connectionFileId);

		fetchSession();
		fetchFlows();
		fetchConnectionFiles();
		fetchServices();
	}, [whatsAppId, connectionFileId, open, company]);

	const handleSaveWhatsApp = async values => {
		const whatsappData = {
			...values,
			queueIds: selectedQueueIds,
			flowId: flow ? flow : null,
			connectionFileId: connectionFile ? connectionFile : null,
			service: service ? service : null,
			selectedCompany: company ? company : null,
			// name: phoneNumber.replace("+", ""),
		};

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
		setFlow("");
		setConnectionFile("");
		setService("");
		// setPhoneNumber("");
		setWhatsApp(initialState);
		onClose();
	};

	const handleFlowChange = (e) => {
		setFlow(e.target.value);
	}

	const handleConnectionFileChange = (e) => {
		setConnectionFile(e.target.value);
	}

	// const handlePhoneNumberChange = (value) => {
    //     setPhoneNumber(value);
    // }

	const handleServiceChange = (e) => {
		setService(e.target.value);
	}

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="sm"
				fullWidth
				scroll="paper"
			>
				<DialogTitle>
					{whatsAppId
						? i18n.t("whatsappModal.title.edit")
						: i18n.t("whatsappModal.title.add")}
				</DialogTitle>
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
					{({ values, touched, errors, isSubmitting, setFieldValue }) => (
						<Form>
							<DialogContent dividers>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={i18n.t("whatsappModal.form.name")}
										autoFocus
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										className={classes.textField}
										fullWidth
										onChange={(e) => {
											const newValue = e.target.value.replace(/[^\d]/g, "");
											setFieldValue("name", newValue);
										}}
									/>
								</div>
								<div className={classes.multFieldLine}>
									<FormControlLabel
										control={
											<Field
												as={Switch}
												color="primary"
												name="isDefault"
												checked={values.isDefault}
											/>
										}
										label={i18n.t("whatsappModal.form.default")}
									/>
									<FormControlLabel
										control={
											<Field
												as={Switch}
												color="primary"
												name="business"
												checked={values.business}
											/>
										}
										label={i18n.t("Business")}
									/>
									<FormControlLabel
										control={
											<Field
												as={Switch}
												color="primary"
												name="useGroup"
												checked={values.useGroup}
											/>
										}
										label={"Usar Grupo"}
									/>
								</div>
								{/* <div>
									<Field
										as={TextField}
										label={i18n.t("queueModal.form.greetingMessage")}
										type="greetingMessage"
										multiline
										minRows={5}
										fullWidth
										name="greetingMessage"
										error={
											touched.greetingMessage && Boolean(errors.greetingMessage)
										}
										helperText={
											touched.greetingMessage && errors.greetingMessage
										}
										variant="outlined"
										margin="dense"
									/>
								</div>
								<div>
									<Field
										as={TextField}
										label={i18n.t("whatsappModal.form.farewellMessage")}
										type="farewellMessage"
										multiline
										minRows={5}
										fullWidth
										name="farewellMessage"
										error={
											touched.farewellMessage && Boolean(errors.farewellMessage)
										}
										helperText={
											touched.farewellMessage && errors.farewellMessage
										}
										variant="outlined"
										margin="dense"
									/>
								</div> */}
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label="Message Callback URL"
										name="messageCallbackUrl"
										error={touched.messageCallbackUrl && Boolean(errors.messageCallbackUrl)}
										helperText={touched.messageCallbackUrl && errors.messageCallbackUrl}
										variant="outlined"
										margin="dense"
										className={classes.textField}
										fullWidth
									/>
								</div>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label="Status Callback URL"
										name="statusCallbackUrl"
										error={touched.statusCallbackUrl && Boolean(errors.statusCallbackUrl)}
										helperText={touched.statusCallbackUrl && errors.statusCallbackUrl}
										variant="outlined"
										margin="dense"
										className={classes.textField}
										fullWidth
									/>
								</div>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label="Callback Authorization"
										name="callbackAuthorization"
										error={touched.callbackAuthorization && Boolean(errors.callbackAuthorization)}
										helperText={touched.callbackAuthorization && errors.callbackAuthorization}
										variant="outlined"
										margin="dense"
										className={classes.textField}
										fullWidth
									/>
								</div>
								{ (user.companyId === 1 && !whatsAppId) &&
									<div>
										<FormControl
											variant="outlined"
											className={classes.multFieldLine}
											margin="dense"
											fullWidth
										>
											<InputLabel>Serviço</InputLabel>
											<Select
												value={service}
												onChange={(e) => { handleServiceChange(e) }}
												label="Serviço"
											>
												<MenuItem value={""}>Nenhum</MenuItem>
												{ services && services.map(service => {
													if (service.data.isFull || !service.data.connected) return;
													return (
														<MenuItem value={service.data.service} key={service.data.service}>{service.data.service}</MenuItem>
													)
												}) }
											</Select>
										</FormControl>
									</div>
								}
								<div>
									<FormControl
										variant="outlined"
										className={classes.multFieldLine}
										margin="dense"
										fullWidth
									>
										<InputLabel>Categoria</InputLabel>
										<Select
											value={connectionFile}
											onChange={(e) => { handleConnectionFileChange(e) }}
											label="Categoria"
										>
											<MenuItem value={null}>Nenhum</MenuItem>
											{ connectionFiles && connectionFiles.map(connectionFile => {
												return (
													<MenuItem value={connectionFile.id} key={connectionFile.id}>{connectionFile.name}</MenuItem>
												)
											}) }
										</Select>
									</FormControl>
								</div>
								<div>
									<FormControl
										variant="outlined"
										className={classes.multFieldLine}
										margin="dense"
										fullWidth
									>
										<InputLabel>Fluxo</InputLabel>
										<Select
											value={flow}
											onChange={(e) => { handleFlowChange(e) }}
											label="Fluxo"
										>
											<MenuItem value={null}>Nenhum</MenuItem>
											{ flows && flows.map(flow => {
												return (
													<MenuItem value={flow.id} key={flow.id}>{flow.name}</MenuItem>
												)
											}) }
										</Select>
									</FormControl>
								</div>
								<QueueSelect
									selectedQueueIds={selectedQueueIds}
									onChange={selectedIds => setSelectedQueueIds(selectedIds)}
									company={company}
								/>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("whatsappModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{whatsAppId
										? i18n.t("whatsappModal.buttons.okEdit")
										: i18n.t("whatsappModal.buttons.okAdd")}
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

export default React.memo(WhatsAppModal);
