import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, Form, Field, FieldArray } from "formik";
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

import api from "../../services/api";
import toastError from "../../errors/toastError";
import ColorPicker from "../ColorPicker";
import { IconButton, InputAdornment } from "@material-ui/core";
import { Colorize, DeleteOutline } from "@material-ui/icons";
import { useTranslation } from "react-i18next";
import QueueSelectSingle from "../QueueSelectSingle";

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

	multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
	},

	extraAttr: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
}));

const SatisfactionSurveyModal = ({ open, onClose, surveyId }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();

	const initialState = {
		name: "",
		message: "",
		answers: [],
	};

	const SurveySchema = Yup.object().shape({});

	const [survey, setSurvey] = useState(initialState);

	useEffect(() => {
		(async () => {
			if (!surveyId) return;
			try {
				const { data } = await api.get(`/satisfactionSurvey/${surveyId}`);

				setSurvey(prevState => {
					return { 
						...prevState, 
						...data,
						answers: JSON.parse(data.answers) ?? []
					};
				});
			} catch (err) {
				toastError(err);
			}
		})();

		return () => {
			setSurvey({
				name: "",
				message: "",
				answers: [],
			});
		};
	}, [surveyId, open]);

	const handleClose = () => {
		onClose();
		setSurvey(initialState);
	};

	const handleSaveSurvey = async values => {
		const surveyBody = {
			...values,
			answers: values.answers.length > 0 ? JSON.stringify(values.answers) : null
		}

		try {
			if (surveyId) {
				await api.put(`/satisfactionSurvey/${surveyId}`, surveyBody);
				toast.success("Pesquisa editada com sucesso.");
			} else {
				await api.post("/satisfactionSurvey", surveyBody);
				toast.success("Pesquisa criada com sucesso.");
			}

			handleClose();
		} catch (err) {
			toastError(err);
		}
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
				<DialogTitle>
					{surveyId
						? `${"Editar"}`
						: `${"Criar"}`}
				</DialogTitle>
				<Formik
					initialValues={survey}
					enableReinitialize={true}
					validationSchema={SurveySchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveSurvey(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting, values }) => (
						<Form>
							<DialogContent dividers>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={"Nome"}
										autoFocus
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										fullWidth
									/>
								</div>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={"Mensagem"}
										multiline
										minRows={3}
										maxRows={3}
										name="message"
										error={touched.message && Boolean(errors.message)}
										helperText={touched.message && errors.message}
										variant="outlined"
										margin="dense"
										fullWidth
									/>
								</div>
								<FieldArray name="answers">
									{({ push, remove }) => (
										<>
											{values.answers &&
												values.answers.length > 0 &&
												values.answers.map((answer, index) => (
													<div
														className={classes.extraAttr}
														key={`${index}-answer`}
													>
														<Field
															as={TextField}
															label={`Resposta - ${index + 1}`}
															name={`answers[${index}]`}
															variant="outlined"
															margin="dense"
															fullWidth
														/>
														<IconButton
															size="small"
															onClick={() => remove(index)}
														>
															<DeleteOutline />
														</IconButton>
													</div>
												))}
											<div>
												{values.answers.length < 5 &&
													<Button
														style={{ flex: 1, marginTop: 8 }}
														variant="outlined"
														color="primary"
														onClick={() => push("")}
													>
														{`+ ${"Adicionar Resposta"}`}
													</Button>
												}
											</div>
										</>
									)}
								</FieldArray>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{"Cancelar"}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{surveyId
										? `${"Salvar"}`
										: `${"Criar"}`
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

export default SatisfactionSurveyModal;
