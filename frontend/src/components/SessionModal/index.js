import React, { useState, useEffect } from "react";
import QRCode from "qrcode.react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import {
	Dialog,
	DialogContent,
	Paper,
	Typography,
	DialogTitle,
	Button,
	DialogActions,
	CircularProgress,
	TextField,
} from "@material-ui/core";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";

const useStyles = makeStyles(theme => ({
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
}));

const SessionSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
});

const SessionModal = ({ open, onClose, sessionId }) => {
	const classes = useStyles();
	const initialState = {
		name: "",
		status: "",
	};
	const [session, setSession] = useState(initialState);

	useEffect(() => {
		const fetchSession = async () => {
			if (!sessionId) return;

			try {
				const { data } = await api.get(`whatsapp/session/${sessionId}`);
				setSession(data);
			} catch (err) {
				console.log(err);
				if (err.response && err.response.data && err.response.data.error) {
					toast.error(err.response.data.error);
				}
			}
		};
		fetchSession();
	}, [sessionId]);

	const handleSaveSession = async values => {
		try {
			if (sessionId) {
				await api.put(`/whatsapp/session/${sessionId}`, values);
			} else {
				await api.post("/whatsapp/session", values);
			}
			toast.success("Session created!");
		} catch (err) {
			console.log(err);
			if (err.response && err.response.data && err.response.data.error) {
				toast.error(err.response.data.error);
			}
		}
		handleClose();
	};

	const handleClose = () => {
		onClose();
		setSession(initialState);
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="paper">
			<DialogTitle>Edit Session</DialogTitle>
			<Formik
				initialValues={session}
				enableReinitialize={true}
				validationSchema={SessionSchema}
				onSubmit={(values, actions) => {
					setTimeout(() => {
						handleSaveSession(values);
						actions.setSubmitting(false);
					}, 400);
				}}
			>
				{({ touched, errors, isSubmitting }) => (
					<Form>
						<DialogContent dividers>
							<Field
								as={TextField}
								label="Name"
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
								label="Status"
								name="status"
								disabled
								variant="outlined"
								margin="dense"
							/>
						</DialogContent>
						<DialogActions>
							<Button
								onClick={handleClose}
								color="secondary"
								disabled={isSubmitting}
								variant="outlined"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								color="primary"
								disabled={isSubmitting}
								variant="contained"
								className={classes.btnWrapper}
							>
								Save
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
	);
};

export default SessionModal;
