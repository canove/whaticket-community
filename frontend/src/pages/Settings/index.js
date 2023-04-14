import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { Box, Button, Checkbox, FormControlLabel } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";

import Title from "../../components/Title";

import openSocket from "../../services/socket-io";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		alignItems: "center",
		padding: theme.spacing(8, 8, 3),
	},

	paper: {
		padding: theme.spacing(2),
		display: "flex",
		alignItems: "center",
		marginBottom: 12,

	},

	settingOption: {
		marginLeft: "auto",
	},
	margin: {
		margin: theme.spacing(1),
	},

}));

const Settings = () => {
	const classes = useStyles();
	const { i18n } = useTranslation();

	//                  | dom | seg | ter | qua | qui | sex | sab |
	const initialDays = [false,false,false,false,false,false,false];

	const [useWorkTime, setUseWorkTime] = useState(false);
	const [days, setDays] = useState(initialDays);
	const [hours, setHours] = useState("");
	const [message, setMessage] = useState("");

	useEffect(() => {
		const fetchWorkTime = async () => {
			try {
				const { data } = await api.get("/workTime/");

				const workTime = JSON.parse(data);

				console.log(workTime);

				setUseWorkTime(workTime.useWorkTime);
				setDays(workTime.days)
				setHours(workTime.hours);
				setMessage(workTime.message);
			} catch (err) {
				toastError(err);
			}
		}

		fetchWorkTime();
	}, []);

	const checkHours = () => {
		return true;
	}

	const handleSaveWorkTime = async () => {
		const validHours = checkHours(hours);

		if (!validHours) {
			toast.error("Horário inválido.");
		}

		const body = {
			useWorkTime,
			days: days.map(day => day ? true : false),
			hours,
			message
		};

		try {
			await api.post("/workTime/", body);
			toast.success("Horário de Atendimento salvo com sucesso.");
		} catch (err) {
			toastError(err);
		}
	}

	const handleDayChange = (e, day) => {
		if (day === "dom") setDays([e.target.checked, days[1], days[2], days[3], days[4], days[5], days[6]]);
		if (day === "seg") setDays([days[0], e.target.checked, days[2], days[3], days[4], days[5], days[6]]);
		if (day === "ter") setDays([days[0], days[1], e.target.checked, days[3], days[4], days[5], days[6]]);
		if (day === "qua") setDays([days[0], days[1], days[2], e.target.checked, days[4], days[5], days[6]]);
		if (day === "qui") setDays([days[0], days[1], days[2], days[3], e.target.checked, days[5], days[6]]);
		if (day === "sex") setDays([days[0], days[1], days[2], days[3], days[4], e.target.checked, days[6]]);
		if (day === "sab") setDays([days[0], days[1], days[2], days[3], days[4], days[5], e.target.checked]);
	}

	return (
		<div className={classes.root}>
			<Container className={classes.container} maxWidth="sm">
				<Title>{i18n.t("settings.title")}</Title>
				<Paper className={classes.paper}>
					<div>
						<FormControlLabel
							label="Horário de Atendimento"
							control={
							<Checkbox
								checked={useWorkTime}
								indeterminate={useWorkTime === false}
								onChange={() => setUseWorkTime(prevWorkTime => !prevWorkTime)}
								color="primary"
							/>
							}
						/>
						{ !useWorkTime &&
							<Typography variant="body2" gutterBottom>
								{"Se horário de atendimento estiver desativado, ----- será usado como padrão."}
							</Typography>
						}
						{ useWorkTime &&
							<>
								<Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
									<FormControlLabel
										label="Segunda"
										control={<Checkbox color="primary" checked={days[1]} onChange={(e) => { handleDayChange(e, "seg") }} />}
									/>
									<FormControlLabel
										label="Terça"
										control={<Checkbox color="primary" checked={days[2]} onChange={(e) => { handleDayChange(e, "ter") }} />}
									/>
									<FormControlLabel
										label="Quarta"
										control={<Checkbox color="primary" checked={days[3]} onChange={(e) => { handleDayChange(e, "qua") }} />}
									/>
									<FormControlLabel
										label="Quinta"
										control={<Checkbox color="primary" checked={days[4]} onChange={(e) => { handleDayChange(e, "qui") }} />}
									/>
									<FormControlLabel
										label="Sexta"
										control={<Checkbox color="primary" checked={days[5]} onChange={(e) => { handleDayChange(e, "sex") }} />}
									/>
									<FormControlLabel
										label="Sábado"
										control={<Checkbox color="primary" checked={days[6]} onChange={(e) => { handleDayChange(e, "sab") }} />}
									/>
									<FormControlLabel
										label="Domingo"
										control={<Checkbox color="primary" checked={days[0]} onChange={(e) => { handleDayChange(e, "dom") }} />}
									/>
								</Box>
								<TextField
									label={"Horários"}
									placeholder={"08:00-12:40,13:50-18:30"}
									name="hours"
									variant="outlined"
									margin="dense"
									value={hours}
									onChange={(e) => { setHours(e.target.value) }}
									fullWidth
								/>
								<TextField
									label={"Mensagem"}
									name="message"
									variant="outlined"
									margin="dense"
									minRows={3}
									maxRows={3}
									multiline
									value={message}
									onChange={(e) => { setMessage(e.target.value) }}
									fullWidth
								/>
							</>
						}
						<Button
							color="primary"
							variant="contained"
							onClick={handleSaveWorkTime}
						>
							Salvar
						</Button>
					</div>
				</Paper>
			</Container>
		</div>
	);
};

export default Settings;
