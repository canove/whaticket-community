import React, { useContext, useEffect, useReducer, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { green, red } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import InfoIcon from '@material-ui/icons/Info';

import { useTranslation } from "react-i18next";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { InputLabel, MenuItem, Select } from "@material-ui/core";
import toastError from "../../errors/toastError";
import { useHistory } from "react-router-dom";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";

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
	const [selectedConnection, setSelectedConnection] = useState("placeholder");
	const [loading, setLoading] = useState(false);
	const [showInfo, setShowInfo] = useState(false);
	const history = useHistory();

	const handleClose = () => {
		onClose();
		setFile();
	};

    const handleFile = (e) => {
		setFile(e.target.files[0])
    }

	const handleSubmit = async () => {
		setLoading(true);

		const formData = new FormData();
		formData.append("file", file, file.name);
		formData.set("ownerid", user.id);
		formData.set("name", file.name);
		formData.set("official", selectedType);
		formData.set("whatsappId", selectedConnection);

		await api.post("file/upload", formData);

		setLoading(false);
		handleClose();
	}

	const handleChange = (e) => {
		setSelectedType(e.target.value);
	}

	const handleChangeConnection = (e) => {
		setSelectedConnection(e.target.value);
	}

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
					<div className={classes.multFieldLine}>
						<Typography variant="subtitle1" gutterBottom>
                        	Tipo de Disparo:
						</Typography>
						<Select
							labelId="type-select-label"
							id="type-select"
							value={selectedType}
							label="Type"
							onChange={handleChange}
						>
							<MenuItem value={true}>Oficial</MenuItem>
							<MenuItem value={false}>Não Oficial</MenuItem>
						</Select>
					</div>
					<div className={classes.multFieldLine}>
						<Typography variant="subtitle1" gutterBottom>
                        	Conexão:
						</Typography>
						<Select
							labelId="type-select-label"
							id="type-select"
							value={selectedConnection}
							label="Type"
							onChange={handleChangeConnection}
						>
							<MenuItem value={"placeholder"} disabled>Selecione uma Conexão</MenuItem>
							{whatsApps && whatsApps.map((whats, index) => {
								if (whats.official === selectedType) {
									return (
										<MenuItem key={index} value={whats.id}>{whats.name}</MenuItem>
									)
								}
							})}
						</Select>
					</div>
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
							Modelo de disparo suportado:
						</Typography>
						<Button onClick={() => setShowInfo(!showInfo)}>{showInfo ? "Esconder" : "Mostrar"}</Button>
					</div>
					<div>
						{showInfo && (
							<Typography variant="subtitle1" gutterBottom>
								NOME;CPF/CNPJ;TELEFONE;TEMPLATE_WHATS;PARAMETROS_TEMPLATE;TEXTO_MENSAGEM<br /><br />
								- CAMPOS OPCIONAIS (SE TEXTO_MENSAGEM PREENCHIDO)<br />
								TEMPLATE_WHATS<br />
								PARAMETROS_TEMPLATE<br /><br />
								- CAMPOS OPCIONAIS (SE TEMPLATE_WHATS PREENCHIDO)<br />
								TEXTO_MENSAGEM<br />
								PARAMETROS_TEMPLATE<br />
							</Typography>
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
