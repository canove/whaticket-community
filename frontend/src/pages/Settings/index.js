import React, { useState, useEffect, useContext } from "react";
import openSocket from "../../services/socket-io";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { toast } from "react-toastify";

import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";
import toastError from "../../errors/toastError";
import { useThemeContext } from "../../context/DarkMode";

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

	brandingPaper: {
		padding: theme.spacing(3),
		display: "flex",
		flexDirection: "column",
		alignItems: "stretch",
		marginBottom: 12,
	},

	sectionTitle: {
		fontWeight: 700,
		marginBottom: theme.spacing(2),
	},

	colorsRow: {
		display: "flex",
		gap: 16,
		marginTop: 12,
	},

	colorField: {
		flex: 1,
	},

	colorControls: {
		display: "flex",
		alignItems: "center",
		gap: 8,
		marginTop: 4,
	},

	swatch: {
		width: 42,
		height: 42,
		padding: 0,
		border: "none",
		background: "none",
		cursor: "pointer",
	},

	saveButton: {
		alignSelf: "flex-start",
		marginTop: theme.spacing(2),
	},

	settingOption: {
		marginLeft: "auto",
	},
}));

const Settings = () => {
	const classes = useStyles();
	const { refreshBranding } = useThemeContext();

	const [settings, setSettings] = useState([]);
	const [branding, setBranding] = useState({
		appName: "",
		primaryColor: "#0E7C6B",
		secondaryColor: "#25D366",
	});
	const [savingBranding, setSavingBranding] = useState(false);

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const { data } = await api.get("/settings");
				setSettings(data);
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, []);

	useEffect(() => {
		const fetchBranding = async () => {
			try {
				const { data } = await api.get("/branding");
				if (data) setBranding(data);
			} catch (err) {
				// keep defaults
			}
		};
		fetchBranding();
	}, []);

	useEffect(() => {
		const socket = openSocket();

		socket.on("settings", data => {
			if (data.action === "update") {
				setSettings(prevState => {
					const aux = [...prevState];
					const settingIndex = aux.findIndex(s => s.key === data.setting.key);
					aux[settingIndex].value = data.setting.value;
					return aux;
				});
			}
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const handleChangeSetting = async e => {
		const selectedValue = e.target.value;
		const settingKey = e.target.name;

		try {
			await api.put(`/settings/${settingKey}`, {
				value: selectedValue,
			});
			toast.success(i18n.t("settings.success"));
		} catch (err) {
			toastError(err);
		}
	};

	const handleSaveBranding = async () => {
		setSavingBranding(true);
		try {
			await api.put("/branding", branding);
			await refreshBranding();
			toast.success("Marca atualizada!");
		} catch (err) {
			toastError(err);
		}
		setSavingBranding(false);
	};

	const getSettingValue = key => {
		const setting = settings.find(s => s.key === key);
		return setting ? setting.value : "";
	};

	const renderColorField = (label, key) => (
		<div className={classes.colorField}>
			<Typography variant="caption" color="textSecondary">
				{label}
			</Typography>
			<div className={classes.colorControls}>
				<input
					type="color"
					className={classes.swatch}
					value={branding[key]}
					onChange={e =>
						setBranding(b => ({ ...b, [key]: e.target.value }))
					}
				/>
				<TextField
					variant="outlined"
					margin="dense"
					value={branding[key]}
					onChange={e =>
						setBranding(b => ({ ...b, [key]: e.target.value }))
					}
				/>
			</div>
		</div>
	);

	return (
		<div className={classes.root}>
			<Container className={classes.container} maxWidth="sm">
				<Typography variant="body2" gutterBottom>
					{i18n.t("settings.title")}
				</Typography>

				<Paper className={classes.brandingPaper}>
					<Typography variant="body1" className={classes.sectionTitle}>
						Marca
					</Typography>
					<TextField
						label="Nome do sistema"
						variant="outlined"
						margin="dense"
						fullWidth
						value={branding.appName}
						onChange={e =>
							setBranding(b => ({ ...b, appName: e.target.value }))
						}
					/>
					<div className={classes.colorsRow}>
						{renderColorField("Cor primária", "primaryColor")}
						{renderColorField("Cor secundária", "secondaryColor")}
					</div>
					<Button
						className={classes.saveButton}
						variant="contained"
						color="primary"
						disabled={savingBranding}
						onClick={handleSaveBranding}
					>
						{savingBranding ? "Salvando..." : "Salvar marca"}
					</Button>
				</Paper>

				<Paper className={classes.paper}>
					<Typography variant="body1">
						{i18n.t("settings.settings.userCreation.name")}
					</Typography>
					<Select
						margin="dense"
						variant="outlined"
						native
						id="userCreation-setting"
						name="userCreation"
						value={
							settings && settings.length > 0 && getSettingValue("userCreation")
						}
						className={classes.settingOption}
						onChange={handleChangeSetting}
					>
						<option value="enabled">
							{i18n.t("settings.settings.userCreation.options.enabled")}
						</option>
						<option value="disabled">
							{i18n.t("settings.settings.userCreation.options.disabled")}
						</option>
					</Select>
				</Paper>

				<Paper className={classes.paper}>
					<TextField
						id="api-token-setting"
						readonly
						label="Token Api"
						margin="dense"
						variant="outlined"
						fullWidth
						value={settings && settings.length > 0 && getSettingValue("userApiToken")}
					/>
				</Paper>
			</Container>
		</div>
	);
};

export default Settings;
