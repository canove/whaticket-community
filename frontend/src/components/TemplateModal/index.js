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
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";
import Autocomplete from "@material-ui/lab/Autocomplete";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},

	multFieldLine: {
		display: "flex",
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

const TemplateModal = ({ open, onClose }) => {
	const { i18n } = useTranslation();
	const classes = useStyles();
	const initialState = {
		name: "",
        category:"",
		corpo: "",
		rodape: "",
	};
	const [template, setTemplate] = useState(initialState);

	const handleClose = () => {
		onClose();
		setTemplate(initialState);
	};

	const renderOptionLabel = (option) => {
    return option;
	};

	 const handleSelectOption = (e, newValue) => {
    if (newValue === null) {
      setTemplate("");
    } else {
      setTemplate(getStatusByName(newValue));
      }
    };

	const getStatusByName = (status) => {
    if (status === "Transicional") {
      return "0";
    } else if (status === "Marketing") {
      return "1";
    }
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
					{i18n.t("templates.templateModal.title")}
				</DialogTitle>
				<Formik
					initialValues={template}
					enableReinitialize={true}
					validationSchema={SessionSchema}
					onSubmit={(values, actions) => {
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
										label={i18n.t("templates.templateModal.name")}
										autoFocus
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
                                        fullWidth
										className={classes.textField}
									/>
                                </div>
                                <div>
									<MainHeaderButtonsWrapper>
										<Autocomplete
											className={classes.root}
											options={["Transicional", "Marketing"]}
											getOptionLabel={renderOptionLabel}
											onChange={(e, newValue) => handleSelectOption(e, newValue)}
											renderInput={(params) => (
											<TextField
												{...params}
												label={i18n.t("templates.templateModal.category")}
												InputLabelProps={{ required: true }}
											/>
											)}
										/>
									</MainHeaderButtonsWrapper>
								</div>
								<div>
									<Field
										as={TextField}
										label={i18n.t("templates.templateModal.body")}
										type="greetingMessage"
										multiline
										minRows={5}
										fullWidth
                                        maxLength="1024"
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
										label={i18n.t("templates.templateModal.footer")}
										type="farewellMessage"
										multiline
										minRows={2}
										fullWidth
                                        maxLength="60"
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
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("templates.buttons.cancel")}
								</Button>
							    <Button
									type="submit"
									color="primary"
									variant="contained"
									className={classes.btnWrapper}
								>
									{i18n.t("templates.buttons.add")}
								</Button>
							</DialogActions>
						</Form>
					)}
				</Formik>
			</Dialog>
		</div>
	);
};

export default TemplateModal;
