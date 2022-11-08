import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
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
	MenuItem,
	FormControl,
	Select,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

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

	const [param, setParam] = useState("");
	const [paramsQuantity, setParamsQuantity] = useState(0);
	const [openParamModal, setOpenParamModal] = useState(false);

    const [disableButton, setDisableButton] = useState(false);

    useEffect(() => {
        if (greetingMessageText) {
            setGreetingMessage({greetingMessage: greetingMessageText[0].greetingMessage});
        }
    }, [greetingMessageText]);

	const handleClose = () => {
		onClose();
		setGreetingMessage(initialState);
		setDisableButton(false);
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

	const handleParams = () => {
        if (paramsQuantity >= 3) {
             toast.error(i18n.t("templatesData.modalConfirm.exceeded"));
        } else {
            //  setGreetingMessage({greetingMessage: + "{{" + param + "}}" })
			setGreetingMessage(prevGreeting => {
				const lastMessage = prevGreeting.greetingMessage;
				return {
					greetingMessage: lastMessage + "{{" + param + "}}"
				}
			});
        }

        handleCloseParamModal();
    };

	const handleChangeParam = (e) => {
        setParam(e.target.value)
    };

	const handleOpenParamModal = () => {
        setOpenParamModal(true);
    };

    const handleCloseParamModal = () => {
        setParam("");
        setOpenParamModal(false);
    };

	useEffect(() => {
        const testParams = () => {
            let result = 0;
            result += greetingMessage.greetingMessage.split("{{name}}").length - 1
            result += greetingMessage.greetingMessage.split("{{documentNumber}}").length - 1
            result += greetingMessage.greetingMessage.split("{{phoneNumber}}").length - 1
            result += greetingMessage.greetingMessage.split("{{var1}}").length - 1
            result += greetingMessage.greetingMessage.split("{{var2}}").length - 1
            result += greetingMessage.greetingMessage.split("{{var3}}").length - 1
            result += greetingMessage.greetingMessage.split("{{var4}}").length - 1
            result += greetingMessage.greetingMessage.split("{{var5}}").length - 1

            setParamsQuantity(result);
        }
        testParams();
    }, [greetingMessage]);

	useEffect(() => {
		if (paramsQuantity > 3) {
			setDisableButton(true);
		} else {
			setDisableButton(false);
		}
	}, [paramsQuantity]);

	const handleMessageChange = (e) => {
		setGreetingMessage({greetingMessage: e.target.value});
	}

	return (
		<div className={classes.root}>
			<div>
				<Dialog open={openParamModal} onClose={handleCloseParamModal}>
					<DialogTitle>{i18n.t("templates.templateModal.selectVar")}</DialogTitle>
					<DialogContent>
						<FormControl className={classes.multFieldLine}>
							<Select
								variant="outlined"
								id="demo-dialog-select"
								value={param}
								onChange={handleChangeParam}
								style={{width: "100%"}}
							>
								<MenuItem value={'name'}>{i18n.t("templates.templateModal.name")}</MenuItem>
								<MenuItem value={'documentNumber'}>{i18n.t("templates.templateModal.document")}</MenuItem>
								<MenuItem value={'phoneNumber'}>{i18n.t("templates.templateModal.phoneNumber")}</MenuItem>
								<MenuItem value={'var1'}>Var 1</MenuItem>
								<MenuItem value={'var2'}>Var 2</MenuItem>
								<MenuItem value={'var3'}>Var 3</MenuItem>
								<MenuItem value={'var4'}>Var 4</MenuItem>
								<MenuItem value={'var5'}>Var 5</MenuItem>
							</Select>
						</FormControl>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleCloseParamModal} color="primary">
						{i18n.t("templates.templateModal.cancel")}
						</Button>
						<Button onClick={handleParams} color="primary">
						{i18n.t("templates.templateModal.ok")}
						</Button>
					</DialogActions>
				</Dialog>
			</div>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="sm"
				fullWidth
				scroll="paper"
			>
				<DialogTitle>
					{greetingMessageText
						? `${i18n.t("settingsWhats.modal.edited")}`
						: `${i18n.t("settingsWhats.modal.createdAt")}`
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
										label={i18n.t("settingsWhats.modal.salutation")}
										type="greetingMessage"
										multiline
										minRows={5}
										fullWidth
										name="greetingMessage"
										onChange={handleMessageChange}
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
									color="primary"
									variant="contained"
									className={classes.btnWrapper}
									onClick={handleOpenParamModal}
								>
									{"{{ }}"}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting || disableButton}
									variant="contained"
									className={classes.btnWrapper}
								>
									{greetingMessageText
										? `${i18n.t("settingsWhats.modal.edit")}`
										: `${i18n.t("settingsWhats.modal.create")}`
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
