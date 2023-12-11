import React, { useState, useEffect, useRef, startTransition } from "react";

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
import CircularProgress from "@material-ui/core/CircularProgress";
import { AppBar, Select, Tab, Tabs, MenuItem, FormControl, InputLabel } from '@material-ui/core';
import { Edit, DeleteOutline } from "@material-ui/icons";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import ColorPicker from "../ColorPicker";
import { IconButton, InputAdornment } from "@material-ui/core";
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
	colorAdorment: {
		width: 20,
		height: 20,
	},
	rootDialog: {
		display: "flex",
		justifyContent: "center",
		alignItems: "space-around",
		flexWrap: "wrap",
		height: "340px",
	},
	formControl: {
		display: "flex",
		justifyContent: "space-evenly",
		margin: theme.spacing(1),
		width: "80%",
		height: "30%"
	},
	table: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		width: "90%",
		height: "40%",
	},
	tableHead: {
		width: "100%",
		height: "fit-content",
	},
	tableTitles: {
		display: "flex",
		justifyContent: "space-evenly",
		width: "100%",
	},
	tableBody: {
		justifyContent: "center",
		width: "100%",
		height: "fit-content",
	},
	cells: {
		width: "200px",
		textAlign: "center"
	},
	buttonCells: {
		width: "120px",
		textAlign: "center"
	}
}));

const QueueSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	color: Yup.string().min(3, "Too Short!").max(9, "Too Long!").required(),
	greetingMessage: Yup.string(),
});

const QueueModal = ({ open, onClose, queueId }) => {
	const classes = useStyles();

	const initialState = {
		name: "",
		color: "",
		greetingMessage: "",
	};

	const [activeTab, setActiveTab] = useState(0);
	const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
	const [queue, setQueue] = useState(initialState);
	//Dados iniciais para estruturação do modal
	const [holidays, setHolidays] = useState([{ "data": "25 de Dezembro", "nome": "Feriado 1" }, { "data": "08 de Março", "nome": "Feriado 2" }, { "data": "19 de Abril", "nome": "Feriado 3" }]);
	const [selectedHolidays, setSelectedHolidays] = useState([]);
	const [selected, setSelected] = useState("");
	const greetingRef = useRef();

	const options = holidays.map((holi) => `${holi.data} - ${holi.nome}`);

	useEffect(() => {
		(async () => {
			if (!queueId) return;
			try {
				const { data } = await api.get(`/queue/${queueId}`);
				setQueue(prevState => {
					return { ...prevState, ...data };
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

	const selectTab = (event, tab) => {
		setActiveTab(tab);
	}

	const handleNewHoliday = (event, selectedHoliday) => {
		const { props } = selectedHoliday;
		const selection = holidays.find(({nome}) => props.value.includes(nome));
		setSelected(`${selection.data} - ${selection.nome}`);
		setSelectedHolidays([...selectedHolidays, selection]);
		setHolidays(holidays.filter(({nome}) => nome !== selection.nome));
	}

	return (
		<div className={classes.root}>
			<Dialog open={open} onClose={handleClose} dividers="true" scroll="paper">
				<AppBar position="static" >
					<Tabs
						variant="fullWidth"
						value={activeTab}
						onChange={selectTab}
						aria-label="tab-label"
					>
						<Tab label={queueId
							? `${i18n.t("queueModal.title.edit")}`
							: `${i18n.t("queueModal.title.add")}`}
						/>
						<Tab
							label={`${i18n.t("queueModal.title.holidays")}`}
						/>
					</Tabs>
				</AppBar>
				{activeTab === 1 ?
					<DialogContent className={classes.rootDialog}>
						<FormControl className={classes.formControl}>
							<InputLabel id="select-label">Selecione um feriado</InputLabel>
							<Select
								id="select-id"
								value={selected}
								onChange={handleNewHoliday}
							>
								{options.map((holiday, index) =>
									<MenuItem key={index} value={holiday}>{holiday}</MenuItem>)}
							</Select>
							<Button
								variant="contained"
								color="primary"
								onClick={() => setSelectedHolidays(holidays)}
							>
								{i18n.t("queueModal.buttons.addAllHolidays")}
							</Button>
						</FormControl>
						<table className={classes.table}>
							{selectedHolidays.length >= 1 ?
								<thead className={classes.tableHead}>
									<tr className={classes.tableTitles}>
										<th className={classes.cells}>Data</th>
										<th className={classes.cells}>Feriado</th>
										<th className={classes.buttonCells}>Ação</th>
									</tr>
								</thead> : null}
							<tbody className={classes.tableBody}>
								{selectedHolidays.length > 0
									? selectedHolidays.map((holiday, index) =>
										<tr className={classes.tableTitles} key={index}>
											<td className={classes.cells}>{holiday.data}</td>
											<td className={classes.cells}>{holiday.nome}</td>
											<td className={classes.buttonCells}>
												<IconButton
													size="small"
													onClick={() => console.log("Edit Feriado")}
												>
													<Edit />
												</IconButton>
												<IconButton
													size="small"
													onClick={() => {
														console.log("Apagar Feriado");
														//setConfirmModalOpen(true);
														//setDeletingQuickAnswers(quickAnswer);
													}}
												>
													<DeleteOutline />
												</IconButton>
											</td>
										</tr>
									)
									: <tr className={classes.tableTitles}><td colSpan={3}>Você ainda não programou nenhum feriado</td></tr>}
							</tbody>
						</table>
					</DialogContent>
					:
					<Formik
						initialValues={queue}
						enableReinitialize={true}
						validationSchema={QueueSchema}
						onSubmit={(values, actions) => {
							setTimeout(() => {
								handleSaveQueue(values);
								actions.setSubmitting(false);
							}, 400);
						}}
					>
						{({ touched, errors, isSubmitting, values }) => (
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
				}
			</Dialog>
		</div >
	);
};

export default QueueModal;
