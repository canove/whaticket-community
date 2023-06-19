import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { Box, Button, Checkbox, Divider, FormControl, FormControlLabel, FormLabel, InputLabel, MenuItem, Radio, RadioGroup, Table, TableBody, TableCell, TableHead, TableRow } from "@material-ui/core";
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
import QueueSelectSingle from "../../components/QueueSelectSingle";

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

	multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
		marginBottom: "5px"
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
		transferRequiredQueue: false,
		defaultSurvey: "",
		autoCloseTickets: "never", 
		createTicketInterval: 0,
		autoCloseTicketStatus: { "inbot": false, "open": false },
		overflowQueueId: "",
		createTicketWhatsappType: "",
		userInactiveTime: 30,
	}
	const [settings, setSettings] = useState(initialSettings);

	const [surveys, setSurveys] = useState([]);

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

		const fetchSurveys = async () => {
			try {
				const { data } = await api.get('/satisfactionSurvey', {
					params: { limit: -1 }
				});
			  	setSurveys(data.surveys);
			} catch (err) {
			  	toastError(err);
			}
		}

		fetchSurveys();
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
			...settings,
			days: settings.days.map(day => day ? true : false),
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

	const handleAutoCloseTicketStatusChange = (status) => {
		setSettings(prevSettings => ({ ...prevSettings, autoCloseTicketStatus: { ...prevSettings.autoCloseTicketStatus, [status]: !settings.autoCloseTicketStatus[status] } }))
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
				<Title>{i18n.t("settings.title")}</Title>
				<Paper className={classes.paper}> {/* Horário de Atendimento */}
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
								<QueueSelectSingle
									selectedQueue={settings.overflowQueueId}
									onChange={(value) => { handleSettingsChange(value, "overflowQueueId") }}
									label={"Fila de Transbordo"}
								/>
							</>
						}
					</div>
				</Paper>
				<Paper className={classes.paper}> {/* IPs Permitidos */}
					<div>
						<div className={classes.multFieldLine}>
							<Typography variant="subtitle1" color="primary" gutterBottom>IPs Permitidos:</Typography>
							<Button
								variant="contained"
								color="primary"
								onClick={ handleCreateAllowedIP }
							>
							{"Adicionar IP"}
							</Button>
						</div>
						{ settings.allowedIPs && settings.allowedIPs.length > 0 &&
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>{"IP"}</TableCell>
										<TableCell>{"Ações"}</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{ settings.allowedIPs.map((allowedIP, index) => {
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
						}
					</div>
				</Paper>
				<Paper className={classes.paper}> {/* Chat */}
					<div style={{ width: "100%" }}>
						<Typography variant="subtitle1" color="primary" gutterBottom>Chat:</Typography>
						<FormControlLabel
							label="Transferir conversa: Selecionar fila obrigatório."
							control={
								<Checkbox
									checked={settings.transferRequiredQueue}
									onChange={(e) => handleSettingsChange(!settings.transferRequiredQueue, "transferRequiredQueue")}
									color="primary"
								/>
							}
						/>
						<Divider style={{ margin: "10px 0" }} fullWidth />
						{ surveys && surveys.length > 0 &&
							<>
								<div>
									<FormControl
										variant="outlined"
										margin="dense"
										fullWidth
									>
										<InputLabel>{"Pesquisa de Satisfação Padrão"}</InputLabel>
										<Select
											variant="outlined"
											label="Pesquisa de Satisfação Padrão"
											value={settings.defaultSurvey}
											onChange={(e) =>  handleSettingsChange(e.target.value, "defaultSurvey")}
											fullWidth
										>
											<MenuItem value={""}>&nbsp;</MenuItem>
											{surveys.map((survey) => (
												<MenuItem key={survey.id} value={survey.id}>{survey.name}</MenuItem>
											))}
										</Select>
									</FormControl>
								</div>
								<Divider style={{ margin: "10px 0" }} fullWidth />
							</>
						}
						<div>
							<FormControl>
								<FormLabel>
									Finalizar tickets abertos após: {(settings.autoCloseTickets !== "never") ? `${settings.autoCloseTickets} de inatividade.` : "Nunca" }
								</FormLabel>
								<RadioGroup
									name="autoCloseTickets"
									value={settings.autoCloseTickets}
									onChange={(e) => handleSettingsChange(e.target.value, "autoCloseTickets")}
								>
									<FormControlLabel value="never" control={<Radio />} label="Nunca" />
									<FormControlLabel value="8h" control={<Radio />} label="8h" />
									<FormControlLabel value="12h" control={<Radio />} label="12h" />
									<FormControlLabel value="24h" control={<Radio />} label="24h" />
									<FormControlLabel value="48h" control={<Radio />} label="48h" />
								</RadioGroup>
								<FormLabel>
									Status do ticket:
								</FormLabel>
								<FormControlLabel
									label="Em Bot / Disparo"
									control={<Checkbox color="primary" checked={settings.autoCloseTicketStatus["inbot"]} onChange={(e) => { handleAutoCloseTicketStatusChange("inbot") }} />}
								/>
								<FormControlLabel
									label="Em Atendimento"
									control={<Checkbox color="primary" checked={settings.autoCloseTicketStatus["open"]} onChange={(e) => { handleAutoCloseTicketStatusChange("open") }} />}
								/>
							</FormControl>
						</div>
						<Divider style={{ margin: "10px 0" }} fullWidth />
						<div>
							<FormControl
								variant="outlined"
								margin="dense"
								fullWidth
							>
								<TextField
									id="create-ticket-interval"
									label={"Intervalo para criar ticket (em minutos)"}
									type="number"
									variant="outlined"
									value={settings.createTicketInterval}
									onChange={(e) => handleSettingsChange(e.target.value, "createTicketInterval")}
									fullWidth
									inputProps={{
										step: 1,
										min: 0,
										type: 'number',
									}}
								/>
							</FormControl>
						</div>
						<Divider style={{ margin: "10px 0" }} fullWidth />
						<div>
							<FormControl
								variant="outlined"
								margin="dense"
								fullWidth
							>
								<InputLabel>{"Tipo de Whatsapp para Criar Conversa Nova"}</InputLabel>
								<Select
									variant="outlined"
									label="Tipo de Whatsapp para Criar Conversa Nova"
									value={settings.createTicketWhatsappType}
									onChange={(e) =>  handleSettingsChange(e.target.value, "createTicketWhatsappType")}
									fullWidth
								>
									<MenuItem value={""}>Ambos</MenuItem>
									<MenuItem value={"active"}>Ativo</MenuItem>
									<MenuItem value={"receptive"}>Receptivo</MenuItem>
								</Select>
							</FormControl>
						</div>
					</div>
				</Paper>
				<Paper className={classes.paper}> {/* User */}
					<div style={{ width: "100%" }}>
						<Typography variant="subtitle1" color="primary" gutterBottom>Usuários:</Typography>
						<div>
							<FormControl
								variant="outlined"
								margin="dense"
								fullWidth
							>
								<TextField
									id="user-inactive-time"
									label={"Tempo de inatividade (em minutos)"}
									type="number"
									variant="outlined"
									value={settings.userInactiveTime}
									onChange={(e) => handleSettingsChange(e.target.value, "userInactiveTime")}
									fullWidth
									inputProps={{
										step: 1,
										min: 0,
										type: 'number',
									}}
								/>
							</FormControl>
						</div>
					</div>
				</Paper>
				<Button
					color="primary"
					variant="contained"
					onClick={handleSaveSettings}
				>
					Salvar Alterações
				</Button>
			</Container>
		</div>
	);
};

export default Settings;
