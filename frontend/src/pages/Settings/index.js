import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { Box, Button, Checkbox, FormControlLabel, Table, TableBody, TableCell, TableHead, TableRow } from "@material-ui/core";
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
import AllowedIPModal from "../../components/AllowedIPModal";

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

	const initialSettings = {
		hours: "",
		message: "",
		useWorkTime: false,
	//? dias: | dom | seg | ter | qua | qui | sex | sab |
		days: [false,false,false,false,false,false,false],
		allowedIPs: [],
	}
	const [settings, setSettings] = useState(initialSettings);

	const [allowedIPModalOpen, setAllowedIPModalOpen] = useState(false);
	const [selectedAllowedIP, setSelectedAllowedIP] = useState("");
	const [selectedAllowedIPIndex, setSelectedAllowedIPIndex] = useState(null);

	useEffect(() => {
		const fetchSettings = async () => {
			try {
				const { data } = await api.get("/companySettings/");
				setSettings(prevSettings => ({ ...prevSettings, ...data }));
			} catch (err) {
				toastError(err);
			}
		}

		fetchSettings();
	}, []);

	const checkHours = (periods_string) => {
		let validHours = true;

		const regex = new RegExp('^([0-1][0-9]|2[0-3]):([0-5][0-9])$');

		try {
			const periods = periods_string.trim().split(",");

			for (const period of periods) {
				if (period.length !== 11) {
					validHours = false;
					break;
				}

				const time = period.split("-");

				for (const hour of time) {
					validHours = regex.test(hour);

					if (!validHours) break;
				}

				if (!validHours) break;

				const hours1 = time[0].split(":");
				const hours2 = time[1].split(":");

				const hour1 = parseInt(hours1[0]);
				const hour2 = parseInt(hours2[0]);

				const minute1 = parseInt(hours1[1]);
				const minute2 = parseInt(hours2[1]);

				if (hour1 > hour2) validHours = false;

				if ((hour1 === hour2) && (minute1 >= minute2)) {
					validHours = false;
				}

				if (!validHours) break;
			}
		} catch (err) {
			validHours = false;
		}

		return validHours;
	}

	const handleSaveSettings = async () => {
		let validHours = true;

		if (settings.hours) {
			validHours = checkHours(settings.hours);
		}

		if (!validHours) {
			toast.error("Horários inválidos.");
			return;
		}

		const body = {
			useWorkTime: settings.useWorkTime,
			days: settings.days.map(day => day ? true : false),
			hours: settings.hours,
			message: settings.message,
			allowedIPs: settings.allowedIPs
		};

		try {
			await api.post("/companySettings/", body);
			toast.success("Configurações salvas com sucesso.");
		} catch (err) {
			toastError(err);
		}
	}

	const handleDayChange = (e, day) => {
		let oldDays = settings.days;
		let newDays = [];

		if (day === "dom") newDays = [e.target.checked, oldDays[1], oldDays[2], oldDays[3], oldDays[4], oldDays[5], oldDays[6]];
		if (day === "seg") newDays = [oldDays[0], e.target.checked, oldDays[2], oldDays[3], oldDays[4], oldDays[5], oldDays[6]];
		if (day === "ter") newDays = [oldDays[0], oldDays[1], e.target.checked, oldDays[3], oldDays[4], oldDays[5], oldDays[6]];
		if (day === "qua") newDays = [oldDays[0], oldDays[1], oldDays[2], e.target.checked, oldDays[4], oldDays[5], oldDays[6]];
		if (day === "qui") newDays = [oldDays[0], oldDays[1], oldDays[2], oldDays[3], e.target.checked, oldDays[5], oldDays[6]];
		if (day === "sex") newDays = [oldDays[0], oldDays[1], oldDays[2], oldDays[3], oldDays[4], e.target.checked, oldDays[6]];
		if (day === "sab") newDays = [oldDays[0], oldDays[1], oldDays[2], oldDays[3], oldDays[4], oldDays[5], e.target.checked];

		setSettings(prevSettings => ({ ...prevSettings, days: newDays }));
	}

	const handleSettingsChange = (value, settingName) => {
		setSettings(prevSettings => ({ ...prevSettings, [settingName]: value }))
	}

	const handleCloseAllowedIPModal = () => {
		setSelectedAllowedIP("");
		setSelectedAllowedIPIndex(null);
		setAllowedIPModalOpen(false);
	}

	const handleCreateAllowedIP = () => {
		setSelectedAllowedIP("");
		setSelectedAllowedIPIndex(null);
		setAllowedIPModalOpen(true);
	}

	const handleEditAllowedIP = (ip, index) => {
		setSelectedAllowedIP(ip);
		setSelectedAllowedIPIndex(index);
		setAllowedIPModalOpen(true);
	}

	const handleDeleteAllowedIP = (index) => {
		const newAllowedIPs = settings.allowedIPs;
		newAllowedIPs.splice(index, 1);

		setSettings(prevSettings => ({
			...prevSettings,
			allowedIPs: newAllowedIPs
		}));
	}

	const saveIP = (ip, index) => {
		if (typeof index === "number") {
			let newAllowedIPs = settings.allowedIPs;
			newAllowedIPs[index] = ip;

			setSettings(prevSettings => ({
				...prevSettings,
				allowedIPs: newAllowedIPs
			}));
		} else {
			const newAllowedIPs = settings.allowedIPs;
			newAllowedIPs.push(ip);

			setSettings(prevSettings => ({
				...prevSettings,
				allowedIPs: newAllowedIPs
			}));
		}
	}

	return (
		<div className={classes.root}>
			<AllowedIPModal
				open={allowedIPModalOpen}
				onClose={handleCloseAllowedIPModal}
				allowedIP={selectedAllowedIP}
				index={selectedAllowedIPIndex}
                saveIP={saveIP}
			/>
			<Container className={classes.container} maxWidth="sm">
				<div>
					<Title>{i18n.t("settings.title")}</Title>
					<Button
						color="primary"
						variant="contained"
						onClick={handleSaveSettings}
					>
						Salvar
					</Button>
				</div>
				<Paper className={classes.paper}>
					<div>
						<Typography variant="subtitle1" color="primary" gutterBottom>Horário de Atendimento:</Typography>
						<FormControlLabel
							label="Ativar"
							control={
							<Checkbox
								checked={settings.useWorkTime}
								indeterminate={settings.useWorkTime === false}
								onChange={(e) => handleSettingsChange(!settings.useWorkTime, "useWorkTime")}
								color="primary"
							/>
							}
						/>
						{ settings.useWorkTime &&
							<>
								<Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
									<FormControlLabel
										label="Segunda"
										control={<Checkbox color="primary" checked={settings.days[1]} onChange={(e) => { handleDayChange(e, "seg") }} />}
									/>
									<FormControlLabel
										label="Terça"
										control={<Checkbox color="primary" checked={settings.days[2]} onChange={(e) => { handleDayChange(e, "ter") }} />}
									/>
									<FormControlLabel
										label="Quarta"
										control={<Checkbox color="primary" checked={settings.days[3]} onChange={(e) => { handleDayChange(e, "qua") }} />}
									/>
									<FormControlLabel
										label="Quinta"
										control={<Checkbox color="primary" checked={settings.days[4]} onChange={(e) => { handleDayChange(e, "qui") }} />}
									/>
									<FormControlLabel
										label="Sexta"
										control={<Checkbox color="primary" checked={settings.days[5]} onChange={(e) => { handleDayChange(e, "sex") }} />}
									/>
									<FormControlLabel
										label="Sábado"
										control={<Checkbox color="primary" checked={settings.days[6]} onChange={(e) => { handleDayChange(e, "sab") }} />}
									/>
									<FormControlLabel
										label="Domingo"
										control={<Checkbox color="primary" checked={settings.days[0]} onChange={(e) => { handleDayChange(e, "dom") }} />}
									/>
								</Box>
								<TextField
									label={"Horários"}
									placeholder={"08:00-12:40,13:50-18:30"}
									name="hours"
									variant="outlined"
									margin="dense"
									value={settings.hours}
									onChange={(e) => { handleSettingsChange(e.target.value, "hours") }}
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
									value={settings.message}
									onChange={(e) => { handleSettingsChange(e.target.value, "message") }}
									fullWidth
								/>
							</>
						}
					</div>
				</Paper>
				<Paper className={classes.paper}>
					<div>
						<Typography variant="subtitle1" color="primary" gutterBottom>IPs Permitidos:</Typography>
						<Button
                            variant="contained"
                            color="primary"
                            onClick={ handleCreateAllowedIP }
                        >
                           {i18n.t("settingsWhats.buttons.created")}
                        </Button>
						<Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{"IP"}</TableCell>
                                    <TableCell>{"Ações"}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
								{ settings.allowedIPs && settings.allowedIPs.map((allowedIP, index) => {
									return (
										<TableRow key={index}>
											<TableCell>{allowedIP}</TableCell>
											<TableCell>
												<Button
													onClick={() => { handleEditAllowedIP(allowedIP, index) }}
												>
													{"Editar"}
												</Button>
												<Button
													onClick={() => { handleDeleteAllowedIP(index) }}
												>
													{"Deletar"}
												</Button>
											</TableCell>
										</TableRow>
									)
								})}
                            </TableBody>
                        </Table>
					</div>
				</Paper>
				{/* <Paper className={classes.paper}>
					<div>
						<Typography variant="subtitle1" color="primary" gutterBottom>Configurações do CHAT:</Typography>
					</div>
				</Paper> */}
			</Container>
		</div>
	);
};

export default Settings;
