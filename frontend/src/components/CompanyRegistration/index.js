import React, { useState, useEffect, useContext, } from "react";
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
	TextField,
  } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useTranslation } from "react-i18next";

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
	formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
	},
}));

const UserSchema = Yup.object().shape({
	name: Yup.string().required("Required"),
	cnpj: Yup.number().typeError().required("Required"),
	phone: Yup.number().typeError().required("Required"),
	email: Yup.string().email("Invalid email").required("Required"),
	address: Yup.string().required("Required")

});

const CompanyRegistration = ({ open, onClose, companyId }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();

	const initialState = {
		id: "",
		name: "",
		cnpj: "",
		phone:"",
		email: "",
		address: "",
	};

	const [company, setCompany] = useState(initialState);

	useEffect(() => {
		const fetchCompany = async () => {
			if (!companyId) return;
			try {
				const { data } = await api.get(`/companies/${companyId}`);
				setCompany(prevState => {
					return { ...prevState, ...data };
				});
			} catch (err) {
				toastError(err);
			}
		};

		fetchCompany();
	}, [companyId, open]);

	const handleClose = () => {
		onClose();
		setCompany(initialState);
	};

	const handleSaveCompany = async values => {
		const companyData = { ...values };
		try {
			let result ;
			if (companyId) {
				result = await api.put(`/companies/${companyId}`, companyData);
			} else {
				result = await api.post("/companies", companyData);
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
			>
				<DialogTitle id="form-dialog-title">
					{companyId
						? `${i18n.t("Editar Cadastro")}`
						: `${i18n.t("Cadastro de Empresa")}`}
				</DialogTitle>
				<Formik
					initialValues={company}
					enableReinitialize={true}
					validationSchema={UserSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveCompany(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting }) => (
						<Form>
							<DialogContent dividers>
									<div className={classes.multFieldLine}>
										<Field
											as={TextField}
											name="name"
											variant="outlined"
											margin="dense"
											label={i18n.t("Nome da Empresa")}
											error={touched.name && Boolean(errors.name)}
											helperText={touched.name && errors.name}
											fullWidth
										/>
									</div>
									<div className={classes.multFieldLine}>
										<Field
											as={TextField}
											label={i18n.t("CNPJ")}
											name="cnpj"
											error={touched.cnpj && Boolean(errors.cnpj)}
											helperText={touched.cnpj && errors.cnpj}
											variant="outlined"
											margin="dense"
											fullWidth
										/>
									</div>
									<div className={classes.multFieldLine}>
										<Field
											as={TextField}
											label={i18n.t("Telefone")}
											name="phone"
											error={touched.phone && Boolean(errors.phone)}
											helperText={touched.phone && errors.phone}
											variant="outlined"
											margin="dense"
											fullWidth
										/>
									</div>
									<div className={classes.multFieldLine}>
										<Field
											as={TextField}
											label={i18n.t("Email")}
											name="email"
											error={touched.email && Boolean(errors.email)}
											helperText={touched.email && errors.email}
											variant="outlined"
											margin="dense"
											fullWidth
										/>
									</div>
									<div className={classes.multFieldLine}>
										<Field
											as={TextField}
											label={i18n.t("Endereço")}
											name="address"
											error={touched.address && Boolean(errors.address)}
											helperText={touched.address && errors.address}
											variant="outlined"
											margin="dense"
											fullWidth
										/>
									</div>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("userModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{companyId
										? `${i18n.t("userModal.buttons.okEdit")}`
										: `${i18n.t("userModal.buttons.okAdd")}`}
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

export default CompanyRegistration;
