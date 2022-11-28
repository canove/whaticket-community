import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { Formik, Form, Field, useFormikContext } from "formik";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import {
	Dialog,
	DialogContent,
	DialogTitle,
	Button,
	DialogActions,
	TextField,
	Switch,
	FormControlLabel,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from "@material-ui/core";

import QueueSelect from "../QueueSelect";
import { useTranslation } from "react-i18next";
import api from "../../services/api";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
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
}));

const SessionSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
});

const OfficialWhatsAppModal = ({ open, onClose, whatsAppId, connectionId }) => {
	const { i18n } = useTranslation();
	const classes = useStyles();
	const initialState = {
		name: "",
		greetingMessage: "",
		farewellMessage: "",
		official: true,
	};

	const [whatsApp, setWhatsApp] = useState(initialState);
	const [selectedQueueIds, setSelectedQueueIds] = useState([]);

	const [flows, setFlows] = useState([]);
	const [flow, setFlow] = useState("");

	useEffect(() => {
		const fetchSession = async () => {
			if (!whatsAppId) return;

			try {
				const { data } = await api.get(`whatsapp/${whatsAppId}`);
				setWhatsApp(data);
				setFlow(data.flowId);

				const whatsQueueIds = data.queues?.map(queue => queue.id);
				setSelectedQueueIds(whatsQueueIds);
			} catch (err) {
				toastError(err);
			}
		};

		const fetchFlows = async () => {
			try {
				const { data } = await api.get('flows');
				setFlows(data);
			} catch (err) {
				toastError(err);
			}
		}

		fetchSession();
		fetchFlows();
	}, [whatsAppId]);

	const handleClose = () => {
		onClose();
		setWhatsApp(initialState);
		setFlow("");
		setSelectedQueueIds([]);
	};

	const handleSaveWhatsApp = async values => {
		const whatsappData = {
			...values,
			queueIds: selectedQueueIds,
			flowId: flow ? flow : null,
			officialConnectionId: connectionId ? connectionId : null
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

	const handleFlowChange = (e) => {
		setFlow(e.target.value);
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
						? i18n.t("officialWhatsappModal.title.edit")
						: i18n.t("officialWhatsappModal.title.add")}
				</DialogTitle>
				<Formik
					initialValues={whatsApp}
					enableReinitialize={true}
					validationSchema={SessionSchema}
					onSubmit={(values, actions) => {
						handleSaveWhatsApp(values);

						setTimeout(() => {
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ values, touched, errors, isSubmitting }) => (
						<Form>
							<DialogContent dividers>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={i18n.t("officialPages.officialContacts.phoneNumber")}
										autoFocus
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										className={classes.textField}
										fullWidth
									/>
								</div>
								<div>
									<Field
										as={TextField}
										label={i18n.t("officialWhatsappModal.title.greetingMessage")}
										type="greetingMessage"
										multiline
										minRows={3}
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
										label={i18n.t("officialWhatsappModal.title.farewellMessage")}
										type="farewellMessage"
										multiline
										minRows={3}
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
											<MenuItem value={""}>Nenhum</MenuItem>
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
								/>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("officialWhatsappModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									variant="contained"
									className={classes.btnWrapper}
								>
									{ whatsAppId 
										? "Editar" 
										: i18n.t("officialWhatsappModal.buttons.add")
									}
								</Button>
							</DialogActions>
						</Form>
					)}
				</Formik>
			</Dialog>
		</div>
	);
};

export default React.memo(OfficialWhatsAppModal);
