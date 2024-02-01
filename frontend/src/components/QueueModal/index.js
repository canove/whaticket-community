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
import CircularProgress from "@material-ui/core/CircularProgress";
import { AppBar, Tab, Tabs } from '@material-ui/core';
import { Edit, DeleteOutline, Colorize } from "@material-ui/icons";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import ColorPicker from "../ColorPicker";
import { IconButton, InputAdornment } from "@material-ui/core";

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
	//área total do modal
	rootDialog: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "center",
		flexWrap: "wrap",
		height: "420px",
	},
	table: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "start",
		alignItems: "center",
		width: "100%",
		height: "77%",
		overflowY: "scroll",
	},
	//Títulos da tabela
	tableHead: {
		display: "flex",
		width: "100%",
		height: "fit-content",
	},
	//linhas da tabela
	tableRows: {
		display: "flex",
		justifyContent: "start",
		width: "100%",
	},
	titleCellsDate: {
		width: "92px",
		display: "flex",
		justifyContent: "start",
	},
	titleCellsHoliday: {
		width: "300px",
		display: "flex",
		alignItems: "center",
		justifyContent: "start",
	},
	tableDataRows: {
		display: "flex",
		justifyContent: "space-between",
		width: "100%",
		borderBottom: "solid 0.2ch gray"
	},
	tableBody: {
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		height: "fit-content",
		textAlign: "center",
	},
	cellsDate: {
		width: "50px",
		display: "flex",
		alignItems: "center",
		justifyContent: "start",
	},
	cellsHoliday: {
		width: "300px",
		display: "flex",
		alignItems: "center",
		justifyContent: "start",
	},
	buttonCells: {
		width: "100px",
		display: "flex",
		alignItems: "center",
		justifyContent: "end"
	},
	formNewHoliday: {
		display: "flex",
		alignItems: "start",
		justifyContent: "center",
		height: "fit-content",
	},
	btnNewHoliday: {
	marginTop: "10px",
	}
}));

const QueueSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	color: Yup.string().min(3, "Too Short!").max(9, "Too Long!").required(),
	greetingMessage: Yup.string(),
	absenceMessage: Yup.string(),
});

const HolidaySchema = Yup.object().shape({
	date: Yup.string().test('is-day-month-format', "Please, use a valid date", (value) => {
		if(value && value.includes("/")) {
			const day = value.split('/')[0];
			const month = value.split('/')[1];

			if (day === '00' || month === '00') {
				return false;
			}
			if (month === '02' && Number(day) > 29) {
				return false;
			}

			if ((month === '04' || month === '06' || month === '09' || month === '11') && Number(day) > 30) {
				return false;
			}
		}

		const dayMonthRegex = /^((0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2]))$/;
		return dayMonthRegex.test(value);
	}).required("Required"),
	holiday: Yup.string().min(3, "Too short").max(49, "Too long").required("Required"),
});

const QueueModal = ({ open, onClose, queueId }) => {

	const initialHolidayValue = {
		date: "",
		holiday: "",
	}

	const classes = useStyles();

	const initialState = {
		name: "",
		color: "",
		greetingMessage: "",
		absenceMessage: "",
		name1: ""
	};

	const [activeTab, setActiveTab] = useState(0);
	const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
	const [queue, setQueue] = useState(initialState);
	const [edit, setEdit] = useState(false);
	const [toEdit, setToEdit] = useState("");
	const [createNew, setCreateNew] = useState(false);
	const greetingRef = useRef();
	//Dados iniciais para estruturação do modal
	const [defaultHolidays, setDefaultHolidays] = useState([
		{ "date": "01/01", "holiday": "Confraternização Universal" },
		{ "date": "21/04", "holiday": "Tiradentes" },
		{ "date": "01/05", "holiday": "Dia do Trabalhador" },
		{ "date": "07/09", "holiday": "Dia da Independência do Brasil" },
		{ "date": "12/10", "holiday": "Dia das Crianças/ Nossa Senhora Aparecida" },
		{ "date": "02/11", "holiday": "Dia de Finados" },
		{ "date": "15/11", "holiday": "Proclamação da República" },
		{ "date": "25/12", "holiday": "Natal" }
	])
	const [holidays, setHolidays] = useState([
		{ "date": "01/01", "holiday": "Confraternização Universal" },
		{ "date": "21/04", "holiday": "Tiradentes" },
		{ "date": "01/05", "holiday": "Dia do Trabalhador" },
		{ "date": "07/09", "holiday": "Dia da Independência do Brasil" },
		{ "date": "12/10", "holiday": "Dia das Crianças/ Nossa Senhora Aparecida" },
		{ "date": "02/11", "holiday": "Dia de Finados" },
		{ "date": "15/11", "holiday": "Proclamação da República" },
		{ "date": "25/12", "holiday": "Natal" }
	]);

	useEffect(() => {
		(async () => {
			if (!queueId) return;
			try {
				const { data } = await api.get(`/queue/${queueId}`);
				setHolidays(JSON.parse(data.holidays));
				const newData = {
					name: data.name,
					color: data.color,
					greetingMessage: data.greetingMessage,
					absenceMessage: data.absenceMessage,
					holidays: JSON.parse(data.holidays)
				}
				setQueue(prevState => {
					return { ...prevState, ...newData };
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
				absenceMessage: "",
				holidays: holidays
			});
		};
	}, [queueId, open]);

	const handleClose = () => {
		onClose();
		setQueue(initialState);
	};

	const handleSaveQueue = async values => {
		values = {
			name: values.name,
			color: values.color,
			greetingMessage: values.greetingMessage,
			absenceMessage: values.absenceMessage,
			holidays: JSON.stringify(holidays) }
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

	const deleteHoliday = (selectedHoliday, selectedIndex) => {
		const returned = holidays.filter((holiday) => holiday !== selectedHoliday);
		setHolidays(returned);
	}

	const createNewHoliday = (newHoliday) => {
		setHolidays([...holidays, newHoliday]);
		setCreateNew(!createNew);
	}

	const editHoliday = (holidayToEdit) => {
		toEdit.holiday = holidayToEdit
		setHolidays([...holidays, toEdit])
		setEdit(false);
	}
	return (
		<div className={classes.root}>
			<Dialog open={open} onClose={handleClose} dividers="true">
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
					(<>
						<DialogContent dividers className={classes.rootDialog}>
							<Formik
								initialValues={edit ? toEdit : initialHolidayValue}
								enableReinitialize={true}
								validationSchema={HolidaySchema}
								onSubmit={(values, actions) => {
									setTimeout(() => {
										{ edit ? editHoliday(values.holiday) : createNewHoliday(values) }
										actions.resetForm();
										setEdit(false)
										actions.setSubmitting(false);
									}, 400);
								}}
							>
								{({ values, touched, errors, isSubmitting }) =>
									<Form className={classes.formNewHoliday}>
										<Field
											as={TextField}
											label={i18n.t("queueModal.holiday.date")}
											name="date"
											placeholder="DD/MM"
											error={touched.date && Boolean(errors.date)}
											helperText={touched.date && errors.date}
											variant="outlined"
											margin="dense"
											disabled={edit ? true : false}
											className={classes.textField}
											inputProps={{ maxLength: 5 }}
										/>
										<Field
											as={TextField}
											label={i18n.t("queueModal.holiday.holiday")}
											name="holiday"
											placeholder="Nome do feriado"
											error={touched.holiday && Boolean(errors.holiday)}
											helperText={touched.holiday && errors.holiday}
											variant="outlined"
											margin="dense"
											className={classes.textField}
											inputProps={{ maxLength: 50 }}
										/>
										<Button
											variant="outlined"
											color="primary"
											type="submit"
											disabled={isSubmitting}
											className={classes.btnNewHoliday}>
											{edit
												? `${i18n.t("queueModal.buttons.okEdit")}`
												: `${i18n.t("queueModal.buttons.okAdd")}`}
										</Button>
									</Form>}
							</Formik>

							<table className={classes.table}>
								{holidays.length >= 1 ?
									<thead className={classes.tableHead}>
										<tr className={classes.tableRows}>
											<th className={classes.titleCellsDate}>Data</th>
											<th className={classes.titleCellsHoliday}>Feriado</th>
										</tr>
									</thead> : null}
								<tbody className={classes.tableBody}>
									{holidays.length > 0
										? holidays.sort((a, b) => a.holiday - b.holiday).map((holiday, index) =>
											<tr className={classes.tableDataRows} key={index}>
												<td className={classes.cellsDate}>{holiday.date}</td>
												<td className={classes.cellsHoliday}>{holiday.holiday}</td>
												<td className={classes.buttonCells}>
													<IconButton
														size="small"
														disabled={edit}
														onClick={() => {
															setEdit(true);
															setToEdit(holiday);
															setHolidays(holidays.filter((h) => h !== holidays[index]));
														}}
													>
														<Edit />
													</IconButton>
													<IconButton
														size="small"
														onClick={() => {
															deleteHoliday(holiday, index)
														}}
													>
														<DeleteOutline />
													</IconButton>
												</td>
											</tr>

										)
										: <tr><td style={{ width: "100%", alignSelf: "center", justifySelf: "center" }} colSpan={3}>Você ainda não programou nenhum feriado</td></tr>}
								</tbody>
							</table>
						</DialogContent>
						<DialogActions style={{ height: "fit-content", display: "flex", alignContent: "center", justifyContent: "center" }}>
							<Button
								style={{ display: 'flex', alignSelf: "end", heigth: "17px" }}
								variant="text"
								color="primary"
								onClick={() => setHolidays(defaultHolidays)}
							>
								Restaurar Feriados
							</Button>
						</DialogActions>
					</>)
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
										fullWidth
										className={classes.textField}
									/>
									<Field
										as={TextField}
										label={i18n.t("queueModal.form.greetingMessage")}
										name="greetingMessage"
										inputRef={greetingRef}
										error={touched.greetingMessage && Boolean(errors.greetingMessage)}
										helperText={touched.greetingMessage && errors.greetingMessage}
										variant="outlined"
										minRows={5}
										fullWidth
										multiline
										margin="dense"
										className={classes.textField}
									/>
																		<Field
										as={TextField}
										label={i18n.t("queueModal.form.absenceMessage")}
										name="absenceMessage"
										inputRef={greetingRef}
										error={touched.absenceMessage && Boolean(errors.absenceMessage)}
										helperText={touched.absenceMessage && errors.absenceMessage}
										variant="outlined"
										minRows={5}
										fullWidth
										multiline
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
