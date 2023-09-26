import React, { useState, useEffect, useRef } from "react";

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

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import ColorPicker from "../ColorPicker";
import { FormControlLabel, IconButton, InputAdornment, Switch } from "@material-ui/core";
import { Colorize } from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	textField: {
		marginRight: theme.spacing(1),
		flex: 1,
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
	colorAdorment: {
		width: 20,
		height: 20,
	},
}));

const QueueSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	color: Yup.string().min(3, "Too Short!").max(9, "Too Long!").required(),
	greetingMessage: Yup.string(),
	awayMessage: Yup.string(),
	seconds: Yup.number().typeError("Only integers!").min(0, "No negative numbers!").integer("Only integers!").default(0)
});

const QueueModal = ({ open, onClose, queueId }) => {
	const classes = useStyles();

	const initialState = {
		name: "",
		color: "",
		greetingMessage: "",
		awayMessage: "",
		seconds: 0,
		checkAwayMessage: false
	};

	const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
	const [awayMessageModalOpen, setAwayMessageModalOpen] = useState(false);
	const [queue, setQueue] = useState(initialState);
	const greetingRef = useRef();
	const awayRef = useRef();

	useEffect(() => {
		(async () => {
			if (!queueId) return;
			try {
				const { data } = await api.get(`/queue/${queueId}`);
				setQueue(prevState => {
					return { ...prevState, ...data, checkAwayMessage: data.seconds > 0 };
				});
			} catch (err) {
				toastError(err);
			}
		})();

		return () => {
			setQueue({
				name: "",
				color: "",
				greetingMessage: "",
				awayMessage: "",
				seconds: 0,
				checkAwayMessage: false
			});
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
			<Dialog open={open} onClose={handleClose} scroll="paper">
				<DialogTitle>
					{queueId
						? `${i18n.t("queueModal.title.edit")}`
						: `${i18n.t("queueModal.title.add")}`}
				</DialogTitle>
				<Formik
					initialValues={queue}
					enableReinitialize={true}
					validationSchema={QueueSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							values.seconds = values.checkAwayMessage ? values.seconds : 0; 
							values.seconds = Number(values.seconds);
							handleSaveQueue(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting, values, setFieldValue }) => (
						<Form>
							<DialogContent dividers>
								<Field
									as={TextField}
									label={i18n.t("queueModal.form.name")}
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
												></div>
											</InputAdornment>
										),
										endAdornment: (
											<IconButton
												size="small"
												color="default"
												onClick={() => setColorPickerModalOpen(true)}
											>
												<Colorize />
											</IconButton>
										),
									}}
									variant="outlined"
									margin="dense"
								/>
								<ColorPicker
									open={colorPickerModalOpen}
									handleClose={() => setColorPickerModalOpen(false)}
									onChange={color => {
										values.color = color;
										setQueue(() => {
											return { ...values, color };
										});
									}}
								/>
								<div>
									<Field
										as={TextField}
										label={i18n.t("queueModal.form.greetingMessage")}
										type="greetingMessage"
										multiline
										inputRef={greetingRef}
										rows={5}
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
									<Field
										as={TextField}
										label={"Mensagem de Ausência"}
										type="awayMessage"
										multiline
										inputRef={awayRef}
										rows={5}
										fullWidth
										name="awayMessage"
										error={
											touched.awayMessage && Boolean(errors.awayMessage)
										}
										helperText={
											touched.awayMessage && errors.awayMessage
										}
										variant="outlined"
										margin="dense"
									/>
								</div>
								<FormControlLabel control={
									<Field
										as={Switch}
										type="checkbox"
										name="checkAwayMessage"
										id="checkAwayMessage"
										onChange={() => {
											if (!values.checkAwayMessage) {
												setAwayMessageModalOpen(true);
											}
											setFieldValue("checkAwayMessage", !values.checkAwayMessage);
										}}
									/>
								} label="Enviar mensagem por inatividade do cliente" />
							</DialogContent>
							<Dialog
								onClose={handleClose}
								aria-labelledby="simple-dialog-title"
								open={awayMessageModalOpen}
							>
								<DialogTitle>Selecione o tempo para enviar mensagem de ausência</DialogTitle>
								<DialogContent>
									<Field
										as={TextField}
										type="number"
										name="seconds"
										id="seconds"
										label="Seconds"
										InputProps={{
											inputProps: {
												min: 0
											}
										}}
										error={touched.seconds && Boolean(errors.seconds)}
										helperText={(touched.seconds && errors.seconds) || "0 = Desabilitado"}
										variant="outlined"
										margin="dense"
									/>
								</DialogContent>
								<DialogActions>
									<Button
										type="button"
										color="primary"
										disabled={isSubmitting}
										variant="contained"
										className={classes.btnWrapper}
										onClick={() => {
											if (values.seconds <= 0) {
												setFieldValue("checkAwayMessage", false);
											}
											setAwayMessageModalOpen(false);
										}}
									>
										OK
									</Button>
								</DialogActions>
    						</Dialog>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("queueModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{queueId
										? `${i18n.t("queueModal.buttons.okEdit")}`
										: `${i18n.t("queueModal.buttons.okAdd")}`}
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

export default QueueModal;
