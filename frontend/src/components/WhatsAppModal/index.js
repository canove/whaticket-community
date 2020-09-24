import React, { useState, useEffect } from "react";
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
} from "@material-ui/core";

// import { i18n } from "../../translate/i18n";
import api from "../../services/api";

const useStyles = makeStyles(theme => ({
	form: {
		display: "flex",
		alignItems: "center",
		justifySelf: "center",
		"& > *": {
			margin: theme.spacing(1),
		},
	},

	textField: {
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

const WhatsAppModal = ({ open, onClose, whatsAppId }) => {
	const classes = useStyles();
	const initialState = {
		name: "",
		isDefault: false,
	};
	const [whatsApp, setWhatsApp] = useState(initialState);

	useEffect(() => {
		const fetchSession = async () => {
			if (!whatsAppId) return;

			try {
				const { data } = await api.get(`whatsapp/${whatsAppId}`);
				setWhatsApp(data);
			} catch (err) {
				console.log(err);
				if (err.response && err.response.data && err.response.data.error) {
					toast.error(err.response.data.error);
				}
			}
		};
		fetchSession();
	}, [whatsAppId]);

	const handleSaveWhatsApp = async values => {
		try {
			if (whatsAppId) {
				await api.put(`/whatsapp/${whatsAppId}`, {
					name: values.name,
					isDefault: values.isDefault,
				});
			} else {
				await api.post("/whatsapp", values);
			}
			toast.success("Success!");
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
		setWhatsApp(initialState);
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="paper">
			<DialogTitle>WhatsApp</DialogTitle>
			<Formik
				initialValues={whatsApp}
				enableReinitialize={true}
				validationSchema={SessionSchema}
				onSubmit={(values, actions) => {
					setTimeout(() => {
						handleSaveWhatsApp(values);
						// alert(JSON.stringify(values, null, 2));
						actions.setSubmitting(false);
					}, 400);
				}}
			>
				{({ values, touched, errors, isSubmitting }) => (
					<Form>
						<DialogContent dividers className={classes.form}>
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
							<FormControlLabel
								control={
									<Field
										as={Switch}
										color="primary"
										name="isDefault"
										checked={values.isDefault}
									/>
								}
								label="Default"
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

export default React.memo(WhatsAppModal);
