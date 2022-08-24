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
import QueueSelect from "../QueueSelect";
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
}));

const GreetingMessageModal = ({ open, onClose, greetingMessageText, getGreetingMessage }) => {
	const { i18n } = useTranslation();
	const classes = useStyles();
	const initialState = {
		greetingMessage: '',
	};
	const [greetingMessage, setGreetingMessage] = useState(initialState);

    useEffect(() => {
        if (greetingMessageText) {
            setGreetingMessage({greetingMessage: greetingMessageText[0].greetingMessage});
        }
    }, [greetingMessageText]);

	const handleClose = () => {
		onClose();
		setGreetingMessage(initialState);
	};

    const handleSaveGreetingMessage = async (values) => {
        if (greetingMessageText) {
            getGreetingMessage(
				{
					id: greetingMessageText[0].id,
					greetingMessage: values.greetingMessage,
					configId: greetingMessageText[0].configId
				},
				"EDIT",
				greetingMessageText[1]
			);
        } else {
            getGreetingMessage(values.greetingMessage, "CREATE");
        }
        handleClose();
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
					{greetingMessageText
						? 'Editar Mensagem de Saudação'
						: 'Criar Mensagem de Saudação'
                    }
				</DialogTitle>
				<Formik
					initialValues={greetingMessage}
					enableReinitialize={true}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveGreetingMessage(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ values, touched, errors, isSubmitting }) => (
						<Form>
							<DialogContent dividers>
								<div>
									<Field
										as={TextField}
										label='Mensagem de Saudação'
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
									{greetingMessageText
										? 'Editar'
										: 'Criar'
                                    }
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

export default GreetingMessageModal;
