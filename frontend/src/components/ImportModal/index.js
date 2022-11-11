import React, { useContext, useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { green, red } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";

import { useTranslation } from "react-i18next";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { MenuItem, Paper, Select } from "@material-ui/core";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	textField: {
		marginRight: theme.spacing(1),
		flex: 1,
	},

	extraAttr: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},

	btnWrapper: {
		position: "relative",
	},

	multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
		marginBottom: 20,
		marginTop: 20,
		alignItems: "center",
	},

	buttonRed: {
		color: red[300],
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

const ImportModal = ({ open, onClose }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();
	const { user } = useContext(AuthContext);
	const { whatsApps } = useContext(WhatsAppsContext);

    const [file, setFile] = useState();
	const [selectedType, setSelectedType] = useState(true);
	const [selectedConnection, setSelectedConnection] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showInfo, setShowInfo] = useState(false);
	const [openSelect, setOpenSelect] = useState(false);
	const [menus, setMenus] = useState();
	const [useType, setUseType] = useState(false);
	const [templates, setTemplates] = useState([]);
	const [selectedTemplate, setSelectedTemplate] = useState("Nenhum");

	const handleClose = () => {
		onClose();
		setFile();
	};

    const handleFile = (e) => {
		setFile(e.target.files[0])
    }

	const handleSubmit = async () => {
		setLoading(true);
		if (selectedConnection.length === 0 && !file) {
			toast.error(i18n.t("importModal.confirmation.errors"));
		} else if (selectedConnection.length === 0 ) {
			toast.error(i18n.t("importModal.confirmation.errorConnection"));
		} else if (!file) {
			toast.error(i18n.t("importModal.confirmation.errorShots"));
		} else {
			try {
				const formData = new FormData();
				formData.append("file", file, file.name);
				formData.set("ownerid", user.id);
				formData.set("name", file.name);
				formData.set("official", selectedType);
				if (selectedConnection.includes('Todos')) {
					formData.set("whatsappIds", null);
				} else {
					const selectedConnectionToString = selectedConnection.join();
					formData.set("whatsappIds", selectedConnectionToString);
				}
				if (selectedTemplate !== "Nenhum") {
					formData.set("templateId", selectedTemplate);
				}

				await api.post("file/upload", formData);
			} catch (err) {
				toastError(err);
			}
			handleClose();
		}
		setLoading(false);
	}

	const handleChange = (e) => {
		setSelectedType(e.target.value);
	}

	const handleChangeConnection = (e) => {
		const value = e.target.value;
		const allIndex = value.indexOf('Todos');

		if (allIndex !== -1 && allIndex === (value.length - 1)) {
			setSelectedConnection([]);

			const allConnections = ["Todos"]

			setSelectedConnection(allConnections);
			setOpenSelect(false);
		} else {
			if ((allIndex || allIndex === 0) && allIndex !== -1) {
				value.splice(allIndex, 1);
			}
			setSelectedConnection(typeof value === "string" ? value.split(",") : value);
		}
	}

	const handleChangeTemplate = (e) => {
		setSelectedTemplate(e.target.value);
	}

	const handleOpenSelect = () => {
		setOpenSelect(true)
	};

	const handleCloseSelect = () => {
		setOpenSelect(false)
	};

	useEffect(() => {
		const fetchMenus = async () => {
			try {
				const { data } = await api.get('menus/company');
				setMenus(data);
			} catch(err) {
				toastError(err);
			}
		}
		fetchMenus();
	}, [])

	useEffect(() => {
		const fetchTemplates = async () => {
			try {
				const { data } = await api.get('/TemplatesData/list/');
				setTemplates(data.templates);
			} catch (err) {
				toastError(err);
			}
		}
		fetchTemplates();
	}, [])

	useEffect(() => {
		if (menus) {
			let offWhats = false;
			let noOffWhats = false;

			menus.forEach(menu => {
				if (menu.name === "Official Connections") {
					offWhats = true;
				}

				if (menu.name === "Connections") {
					noOffWhats = true;
				}
			})

			if (offWhats && noOffWhats) {
				setUseType(true);
			}

			if (offWhats && !noOffWhats) {
				setUseType(false);
				setSelectedType(true);
			}

			if (!offWhats && noOffWhats) {
				setUseType(false);
				setSelectedType(false);
			}
		}
	}, [menus])

	return (
		<div className={classes.root}>
			<Dialog
                open={open}
                onClose={handleClose}
                maxWidth="lg"
                scroll="paper"
            >
                <DialogTitle id="form-dialog-title">
					{i18n.t('importModal.title')}
				</DialogTitle>
                <DialogContent dividers>
					{ useType &&
						<Typography variant="subtitle1" gutterBottom>
							{i18n.t('importModal.form.shotType')}:
						</Typography>
					}
					{ useType &&
					<div className={classes.multFieldLine}>
						<Select
							labelId="type-select-label"
							id="type-select"
							value={selectedType}
							label="Type"
							onChange={handleChange}
							style={{width: "100%"}}
							variant="outlined"
						>
							<MenuItem value={true}>{i18n.t('importModal.form.official')}</MenuItem>
							<MenuItem value={false}>{i18n.t('importModal.form.notOfficial')}</MenuItem>
						</Select>
					</div>
					}
					<Typography variant="subtitle1" gutterBottom>
                        {i18n.t('importModal.form.connection')}
					</Typography>
					<div className={classes.multFieldLine}>
						<Select
							variant="outlined"
							labelId="type-select-label"
							id="type-select"
							value={selectedConnection}
							label="Type"
							onChange={handleChangeConnection}
							multiple
							open={openSelect}
							onOpen={handleOpenSelect}
							onClose={handleCloseSelect}
							style={{width: "100%"}}
						>
							<MenuItem value={"Todos"}>{i18n.t('importModal.form.all')}</MenuItem>
							{whatsApps && whatsApps.map((whats, index) => {
								if (whats.official === selectedType) {
									if (selectedType === false && whats.status === "CONNECTED") {
										return (
											<MenuItem key={index} value={whats.id}>{whats.name}</MenuItem>
										)
									} else if (selectedType === true) {
										return (
											<MenuItem key={index} value={whats.id}>{whats.name}</MenuItem>
										)
									}
								} return null
							})}
						</Select>
					</div>
					{ selectedType === false &&
						<Typography variant="subtitle1" gutterBottom>
							{i18n.t('importModal.form.template')}
						</Typography>
					}
					{ selectedType === false &&
					<div className={classes.multFieldLine}>
						<Select
							variant="outlined"
							labelId="type-select-label"
							id="type-select"
							value={selectedTemplate}
							label="Type"
							onChange={(e) => { handleChangeTemplate(e) }}
							style={{width: "100%"}}
						>
							<MenuItem value={"Nenhum"}>{i18n.t('importModal.form.none')}</MenuItem>
							{templates.length > 0 && templates.map((template, index) => {
								return (
									<MenuItem key={index} value={template.id}>{template.name}</MenuItem>
								)
							})}
						</Select>
					</div>
					}
					<div className={classes.multFieldLine}>
						<Button
							variant="contained"
							component="label"
						>
							{i18n.t('importModal.buttons.uploadFile')}
							<input
								type="file"
								onChange={handleFile}
								hidden
							/>
						</Button>
						<Typography variant="subtitle1" gutterBottom>
                        	{file ? `${i18n.t('importModal.form.uploadedFile')}: ${file.name}` : i18n.t('importModal.form.noFile')}
						</Typography>
					</div>
					<div className={classes.multFieldLine}>
						<Typography variant="subtitle1" gutterBottom>
							{i18n.t('importModal.form.supportedTriggerModel')}
						</Typography>
						<Button onClick={() => setShowInfo(!showInfo)}>
							{showInfo
							 ? `${i18n.t("importModal.form.toHide")}`
							 : `${i18n.t("importModal.form.show")}`
							}
						</Button>
					</div>
					<div>
						{showInfo && (
							<Paper
								variant="outlined"
							>
								<Typography variant="subtitle1" gutterBottom>
									{i18n.t("importModal.model.line1")}<br /><br />
									{i18n.t("importModal.model.line2")}<br />
									{i18n.t("importModal.model.line3")}<br />
									{i18n.t("importModal.model.line4")}<br /><br />
									{i18n.t("importModal.model.line5")}<br />
									{i18n.t("importModal.model.line6")}<br />
									{i18n.t("importModal.model.line7")}<br />
								</Typography>
							</Paper>
						)}
					</div>
                </DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						color="secondary"
						variant="outlined"
						disabled={loading}
					>
						{i18n.t('importModal.buttons.cancel')}
					</Button>
					<Button
						type="submit"
						color="primary"
						variant="contained"
						className={classes.btnWrapper}
						onClick={handleSubmit}
						disabled={loading}
					>
						{i18n.t('importModal.buttons.import')}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default ImportModal;
