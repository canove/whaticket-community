import React, { useState, useEffect } from "react";
import openSocket from "socket.io-client";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Select from "@material-ui/core/Select";
import { toast } from "react-toastify";

import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		alignItems: "center",
		padding: theme.spacing(4),
	},

	paper: {
		padding: theme.spacing(2),
		display: "flex",
		alignItems: "center",
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

	const [settings, setSettings] = useState([]);

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const { data } = await api.get("/settings");
				setSettings(data);
			} catch (err) {
				const errorMsg = err.response?.data?.error;
				if (errorMsg) {
					if (i18n.exists(`backendErrors.${errorMsg}`)) {
						toast.error(i18n.t(`backendErrors.${errorMsg}`));
					} else {
						toast.error(err.response.data.error);
					}
				} else {
					toast.error("Unknown error");
				}
			}
		};
		fetchSession();
	}, []);

	useEffect(() => {
		const socket = openSocket(process.env.REACT_APP_BACKEND_URL);
		socket.on("settings", data => {
			if (data.action === "update") {
				// dispatch({ type: "UPDATE_USERS", payload: data.user });
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
			const errorMsg = err.response?.data?.error;
			if (errorMsg) {
				if (i18n.exists(`backendErrors.${errorMsg}`)) {
					toast.error(i18n.t(`backendErrors.${errorMsg}`));
				} else {
					toast.error(err.response.data.error);
				}
			} else {
				toast.error("Unknown error");
			}
		}
	};

	const getSettingValue = key => {
		const { value } = settings.find(s => s.key === key);
		return value;
	};

	return (
		<div className={classes.root}>
			<Container className={classes.container} maxWidth="sm">
				<Typography variant="body2" gutterBottom>
					{i18n.t("settings.title")}
				</Typography>
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
			</Container>
		</div>
	);
};

export default Settings;
