import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
    Typography,
  } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",

	},
	multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(3),
		},
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
	formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
	},
}));

const ImportationtModal = ({ open, onClose, integratedImportId }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();

	const [name, setName] = useState("");
    const [method, setSelectedMethod] = useState([]);
    const [url, setUrl] = useState("");
    const [key, setKey] = useState("");
    const [token, setToken] = useState("");
    const [bodyDe, setBodyDe] = useState("");
    const [bodyPara, setBodyPara] = useState("");


	useEffect(() => {
		const fetchProduct = async () => {
			try {
				const { data } = await api.get(`/integratedImport/${integratedImportId}`);
				setName(data.name)
                setSelectedMethod(data.method)
                setUrl(data.url)
                setKey(data.key)
                setToken(data.token)
                setBodyDe(data.bodyDe)
                setBodyPara(data.bodyPara)

			} catch (err) {
				toastError(err);
			}
		}
		if (integratedImportId) {
			fetchProduct();
		}
	}, [open, integratedImportId])

    const handleClose = () => {
        setName("");
        setSelectedMethod("");
        setUrl("");
        setKey("");
        setToken("");
        setBodyDe("");
        setBodyPara("");
        onClose();
	};

	const handleNameChange = (e) => {
		setName(e.target.value);
	};

    const handleMethodChange = (e) => {
		setSelectedMethod(e.target.value);
	};

    const handleUrlChange = (e) => {
        setUrl(e.target.value);
    };

    const handleKeyChange = (e) => {
        setKey(e.target.value);
    };

    const handleTokenChange = (e) => {
        setToken(e.target.value)
    };

    const handleAuthenticate = () => {

    };

    const handleChangeBodyDe = (e) => {
        setBodyDe(e.target.value)
    };

    const handleChangeBodyPara = (e) => {
        setBodyPara(e.target.value)
    };

	const handleSubmit = async () => {
		const importData = {
            name: name,
            method: method,
            url: url,
            key: key,
            token: token,
            bodyDe: bodyDe,
            bodyPara: bodyPara
		};

		 try {
            if (integratedImportId) {
                await api.put(`/integratedImport/${integratedImportId}`, importData);
                toast.success("Importação editado com sucesso!");
            } else {
                await api.post("/integratedImport/", importData);
                toast.success("Importação adicionado com sucesso!");
            }
            } catch (err) {
                toastError(err);
        }
        handleClose();
	};

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="md"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{ integratedImportId ? 'Editar' : 'Criar' }
				</DialogTitle>
				<DialogContent dividers>
				<div className={classes.multFieldLine}>
                  <TextField
					as={TextField}
                    name="name"
                    variant="outlined"
                    margin="normal"
                    label={i18n.t("Nome")}
                    fullWidth
					value={name}
					onChange={handleNameChange}
                  />
                </div>
                <div>
                    <FormControl
                        variant="outlined"
                        margin="normal"
                        fullWidth
                    >
                    <InputLabel id="method-selection-label">Método</InputLabel>
                    <Select
                        label="Empresa"
                        name="method"
                        labelId="method-selection-label"
                        id="method-selection"
                        value={method}
                        onChange={(e) => {handleMethodChange(e)}}
                    >
                        <MenuItem value="GET"> {i18n.t('GET')}</MenuItem>
                        <MenuItem value= "POST">{i18n.t('POST')}</MenuItem>
                    </Select>
                    </FormControl>
                </div>
                <div className={classes.multFieldLine}>
                  <TextField
					as={TextField}
                    name="url"
                    variant="outlined"
                    margin="normal"
                    label={i18n.t("URL")}
                    fullWidth
					value={url}
					onChange={handleUrlChange}
                  />
                </div>
               <Typography variant="subtitle1" gutterBottom>
					{i18n.t('Autenticação')}:
				</Typography>
                <div className={classes.multFieldLine}>
                  <TextField
					as={TextField}
                    name="key"
                    variant="outlined"
                    margin="normal"
                    label={i18n.t("Key")}
                    value={key}
					onChange={handleKeyChange}
                    fullWidth
                  />
                  <TextField
					as={TextField}
                    name="token"
                    variant="outlined"
                    margin="normal"
                    label={i18n.t("Token")}
                    value={token}
					onChange={handleTokenChange}
                    fullWidth
                  />
                </div>
                <Button onClick={handleAuthenticate} color="primary" variant="contained">
                    Autenticar
                </Button>
                 <div className={classes.multFieldLine}>
                  <TextField
                    as={TextField}
                    label={i18n.t("De")}
                    type="bodyText"
                    onChange={(e) => {
                      handleChangeBodyDe(e);
                    }}
                    value={bodyDe}
                    multiline
                    minRows={8}
                    maxLength="1024"
                    name="bodyDe"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                  />
                    <TextField
                    as={TextField}
                    label={i18n.t("Para")}
                    type="bodyText"
                    onChange={(e) => {
                      handleChangeBodyPara(e);
                    }}
                    value={bodyPara}
                    multiline
                    minRows={8}
                    maxLength="1024"
                    name="bodyPara"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                  />
                </div>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						color="secondary"
						variant="outlined"
					>
						Cancelar
					</Button>
					<Button
                        onClick={handleSubmit}
						color="primary"
						variant="contained"
					>
						{ integratedImportId ? 'Editar' : 'Salvar' }
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default ImportationtModal;
