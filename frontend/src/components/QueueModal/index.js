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
		justifyContent: "center",
		alignItems: "space-around",
		flexWrap: "wrap",
		height: "350px",
	},
	//select e botão "add feriados"
	formControl: {
		display: "flex",
		justifyContent: "space-evenly",
		margin: theme.spacing(1),
		width: "90%",
		height: "35%"
	},
	table: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "start",
		alignItems: "center",
		width: "100%",
		height: "60%",
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
		alignItems: "center",
		justifyContent: "center",
	},
	btnNewHoliday: {
		height: "60%"
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

const HolidaySchema = Yup.object().shape({
	data: Yup.string().max(5).required("Required"),
	nome: Yup.string().required("Required"),
});

const initialHolidayValue = {
	data: "",
	nome: "",
}

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
	const [selectedHolidays, setSelectedHolidays] = useState([]);
	const [selected, setSelected] = useState("");
	const [createNew, setCreateNew] = useState(false);
	const greetingRef = useRef();
	const [holidays, setHolidays] = useState([
		{ "data": "01/01", "nome": "Confraternização Universal" },
		{ "data": "21/04", "nome": "Tiradentes" },
		{ "data": "01/05", "nome": "Dia do Trabalhador" },
		{ "data": "07/09", "nome": "Dia da Independência do Brasil" },
		{ "data": "12/10", "nome": "Dia das Crianças/ Nossa Senhora Aparecida" },
		{ "data": "02/11", "nome": "Dia de Finados" },
		{ "data": "15/11", "nome": "Proclamação da República" },
		{ "data": "25/12", "nome": "Natal" }
	]);

	const options = holidays.map((holi) => `${holi.data} - ${holi.nome}`).sort();

	useEffect(() => {
		(async () => {
			if (!queueId) return;
			try {
				console.log("Erro aqui EM CIMA");
				const { data } = await api.get(`/queue/${queueId}`);
				setQueue(prevState => {
					return { ...prevState, ...data };
				});
			} catch (err) {
				toastError(err);
			}
		})();

		return () => {
			console.log("Erro aqui");
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
		const selection = holidays.find(({ nome }) => props.value.includes(nome));
		setSelected(`${selection.data} - ${selection.nome}`);
		setSelectedHolidays([...selectedHolidays, selection]);
		setHolidays(holidays.filter(({ nome }) => nome !== selection.nome));
	}

	const deleteHoliday = (selectedHoliday, selectedIndex) => {
		const returned = selectedHolidays.filter((selected) => selected !== selectedHoliday);
		setSelectedHolidays(returned);
		setHolidays([...holidays, selectedHoliday])
		setSelected("");
	}

	const deleteAllHolidays = () => {
		setHolidays(selectedHolidays);
		setSelectedHolidays([]);
		setSelected("");
	}

	const addAllHolidays = () => {
		let limit = holidays.length;
		const newList = selectedHolidays;
		for (let i = 0; i <= limit - 1; i += 1) {
			newList.push(holidays[i]);
		}
		setSelectedHolidays(newList);
		setHolidays([]);
		setSelected("");
	}

	const createNewHoliday = (newHoliday) => {
		setHolidays([...holidays, newHoliday]);
		setCreateNew(!createNew);
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
							<FormControl className={classes.formControl}>
								<InputLabel id="select-label">Selecione um feriado</InputLabel>
								<TextField
									id="select-id"
									value={selected}
									onChange={handleNewHoliday}
									select
									disabled={holidays.length === 0 ? true : false}
								>
									{options.map((holiday, index) =>
										<MenuItem key={index} value={holiday}>{holiday}</MenuItem>)}
								</TextField>
								{createNew
									? (
										<Formik
											initialValues={initialHolidayValue}
											validationSchema={HolidaySchema}
											onSubmit={(values, actions) => {
												setTimeout(() => {
													createNewHoliday(values);
													toast.success("Novo feriado adicionado à lista");
													values = initialHolidayValue;
													actions.setSubmitting(false);
												}, 400)
											}}>
											{({ values, touched, errors, isSubmitting }) =>
												<Form className={classes.formNewHoliday}>
													<Field
														as={TextField}
														label={i18n.t("queueModal.holiday.date")}
														autoFocus
														name="data"
														placeholder="DD/MM"
														error={touched.date && Boolean(errors.date)}
														helperText={touched.date && errors.date}
														variant="outlined"
														margin="dense"
														className={classes.textField}
													/>
													<Field
														as={TextField}
														label={i18n.t("queueModal.holiday.name")}
														name="nome"
														placeholder="Nome do feriado"
														error={touched.name && Boolean(errors.name)}
														helperText={touched.name && errors.name}
														variant="outlined"
														margin="dense"
														className={classes.textField}
													/>
													<Button
														variant="outlined"
														color="primary"
														type="submit"
														disabled={isSubmitting}
														className={classes.btnNewHoliday}>
														Adicionar
													</Button>
												</Form>}
										</Formik>
									)
									: (
										<Button
											variant="contained"
											color="primary"
											onClick={() => addAllHolidays()}
											disabled={holidays.length === 0 ? true : false}
										>
											{i18n.t("queueModal.buttons.addAllHolidays")}
										</Button>
									)}
							</FormControl>
							<table className={classes.table}>
								{selectedHolidays.length >= 1 ?
									<thead className={classes.tableHead}>
										<tr className={classes.tableRows}>
											<th className={classes.titleCellsDate}>Data</th>
											<th className={classes.titleCellsHoliday}>Feriado</th>
										</tr>
									</thead> : null}
								<tbody className={classes.tableBody}>
									{selectedHolidays.length > 0
										? selectedHolidays.map((holiday, index) =>
											<tr className={classes.tableDataRows} key={index}>
												<td className={classes.cellsDate}>{holiday.data}</td>
												<td className={classes.cellsHoliday}>{holiday.nome}</td>
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
						<DialogActions style={{ alignSelf: "end" }}>
							<Button
								variant="contained"
								color="secondary"
								onClick={() => deleteAllHolidays()}
								disabled={selectedHolidays.length === 0 ? true : false}
							>
								{i18n.t("queueModal.buttons.deleteAllHolidays")}
							</Button>
							<Button
								variant="contained"
								color="primary"
								onClick={() => setCreateNew(true)}
								disabled={holidays.length === 0 ? true : false}
							>
								{i18n.t("queueModal.buttons.okAddHoliday")}
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
