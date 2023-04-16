import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	textField: {
		marginRight: theme.spacing(1),
		flex: 1,
	},

	extraAttr: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
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

const ContactSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	number: Yup.string().min(8, "Too Short!").max(50, "Too Long!"),
	email: Yup.string().email("Invalid email"),
});

const GroupModal = ({ open, onClose, contactId, initialValues, onSave }) => {
	const classes = useStyles();
	const isMounted = useRef(true);

	const initialState = {
		name: "",
		number: "",
		isGroup: true
	};

	const [contact, setContact] = useState(initialState);
	const [loading, setLoading] = useState(false);
	// console.log(contact);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const handleClose = () => {
		onClose();
		setContact(initialState);
	};

	const handleCreateGroup = async (name, integer, isGroup) => {
		setLoading(true)
		try {
			const create = await api.post('/group', {
				name,
				integer,
				isGroup
			});
			console.log(create);
			setLoading(false);
			onSave(create.data)
			onClose();
		}
		catch (error) {
			console.log(error.message)
		}
	};

	return (
		<div className={classes.root}>
			<Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="paper">
				<DialogTitle id="form-dialog-title">
					Finalizar grupo
				</DialogTitle>
				<Formik
					initialValues={contact}
					enableReinitialize={true}
					validationSchema={ContactSchema}
				>
					<Form>
						<DialogContent dividers>
							<Typography variant="subtitle1" gutterBottom>
								Nome do grupo
							</Typography>
							<div>
								<Field
									as={TextField}
									label={i18n.t("contactModal.form.name")}
									name="name"
									onChange={ ({target: { value }}) => setContact({...contact, name: value}) }
									placeholder="Email address"
									fullWidth
									margin="dense"
									variant="outlined"
								/>
							</div>
						</DialogContent>
						<DialogActions>
							<Button
								onClick={handleClose}
								color="secondary"
								variant="outlined"
							>
								{i18n.t("contactModal.buttons.cancel")}
							</Button>
							<Button
								type="submit"
								color="primary"
								disabled={!contact.name.length > 0}
								variant="contained"
								className={classes.btnWrapper}
								onClick={() => handleCreateGroup(contact.name, initialValues, true)}
							>
								CRIAR
								{loading && (
									<CircularProgress
										size={24}
										className={classes.buttonProgress}
									/>
								)}
							</Button>
						</DialogActions>
					</Form>
				</Formik>
			</Dialog>
		</div>
	);
};

export default GroupModal;
