import React, { useState, useEffect, useContext, } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Select,
	InputLabel,
	MenuItem,
	FormControl,
	TextField,
} from '@material-ui/core';

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import ConfirmationModal from "../../components/ConfirmationModal";

import api from "../../services/api";
import toastError from "../../errors/toastError";


const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},

	multFieldLine: {
        display: "flex",
        marginTop: 10,
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
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

const TemplateBody = ({ open, onClose, body, index, handleBodiesChange }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();

    const [type, setType] = useState("");
    const [text, setText] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [file, setFile] = useState("");

    const [param, setParam] = useState("");
    const [paramsQuantity, setParamsQuantity] = useState(0);
    const [openParamModal, setOpenParamModal] = useState(false);

    const [disableButton, setDisableButton] = useState(false);

    useEffect(() => {
        if (body) {
            setType(body.type);

            if (body.type === "text") {
                setText(body.value);
            }

            if (body.type === "contact") {
                setPhoneNumber(body.value)
            }

            if (body.type === "audio" || body.type === "video" || body.type === "image") {
                setFile(body.value);
            }
        }
    }, [open, body])

	const handleClose = () => {
		onClose();
        setType("");
        setText("");
        setPhoneNumber("");
        setFile(null);
        setDisableButton(false);

        setOpenParamModal(false);
        setParamsQuantity(0);
	};

	const handleSubmit = async () => {
        if (type === "text") {
            const bodyData = {
                type,
                value: text
            }

            handleBodiesChange(bodyData, index);
        }

        if (type === "contact") {
            const bodyData = {
                type,
                value: phoneNumber
            }

            handleBodiesChange(bodyData, index);
        }

        if (type === "audio" || type === "video" || type === "image") {
            const bodyData = {
                type,
                value: file
            }

            handleBodiesChange(bodyData, index);
        }

		handleClose();
	};

    const handleTypeChange = (e) => {
        setType(e.target.value);
    }

    const handleTextChange = (e) => {
        setText(e.target.value);
    }

    const handlePhoneNumberChange = (e) => {
        setPhoneNumber(e.target.value);
    }

    const handleParams = () => {
        if (paramsQuantity >= 3) {
             toast.error(i18n.t("templates.templateModal.toastErr"));
        } else {
             setText(prevText => prevText + "{{" + param + "}}")
        }
  
        handleCloseParamModal();
    };
  
    const handleChangeParam = (e) => {
        setParam(e.target.value)
    };
  
    const handleOpenParamModal = () => {
        setOpenParamModal(true);
    };
  
    const handleCloseParamModal = () => {
        setParam("");
        setOpenParamModal(false);
    };

    const handleFileChange = (e) => {
		setFile(e.target.files[0]);
    }

    useEffect(() => {
        const testParams = () => {
            let result = 0;
            result += text.split("{{name}}").length - 1
            result += text.split("{{documentNumber}}").length - 1
            result += text.split("{{phoneNumber}}").length - 1
    
            setParamsQuantity(result);
        }
        testParams();
    }, [text])

    useEffect(() => {
        if (type === "text" && paramsQuantity > 3) {
          setDisableButton(true);
        } else {
          setDisableButton(false);
        }
    }, [type, paramsQuantity])

	return (
		<div className={classes.root}>
            <div>
                <Dialog open={openParamModal} onClose={handleCloseParamModal}>
                <DialogTitle>Selecione uma variável</DialogTitle>
                <DialogContent>
                    <FormControl className={classes.multFieldLine}>
                    <Select
                        variant="outlined"
                        id="demo-dialog-select"
                        value={param}
                        onChange={handleChangeParam}
                        style={{width: "100%"}}
                    >
                        <MenuItem value={'name'}>Nome</MenuItem>
                        <MenuItem value={'documentNumber'}>Documento</MenuItem>
                        <MenuItem value={'phoneNumber'}>Número de Telefone</MenuItem>
                    </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseParamModal} color="primary">
                    Cancel
                    </Button>
                    <Button onClick={handleParams} color="primary">
                    Ok
                    </Button>
                </DialogActions>
                </Dialog>
            </div>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="xs"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{ body ? 'Editar' : 'Criar' }
				</DialogTitle>
				<DialogContent dividers>
					<div className={classes.root}>
						<FormControl
							variant="outlined"
							margin="dense"
							fullWidth
						>
							<InputLabel id="type-select-label">
								Tipo
							</InputLabel>
							<Select
								labelId="type-select-label"
								label="Tipo"
								id="type-select"
								value={type}
								onChange={(e) => { handleTypeChange(e) }}
								fullWidth
							>
								<MenuItem value={"text"}>Texto</MenuItem>
                                <MenuItem value={"audio"}>Áudio</MenuItem>
                                <MenuItem value={"video"}>Vídeo</MenuItem>
                                <MenuItem value={"image"}>Imagem</MenuItem>
                                <MenuItem value={"contact"}>Contato</MenuItem>
							</Select>
						</FormControl>
                    </div>
                    { type === "text" &&
                        <div className={classes.root}>
                            <FormControl
							variant="outlined"
							margin="dense"
							fullWidth
						>
							<TextField
								label="Texto"
								variant="outlined"
								value={text}
								onChange={handleTextChange}
								fullWidth
							/>
						</FormControl>
                        </div>
                    }
                    { type === "contact" &&
                        <div className={classes.root}>
                            <FormControl
							variant="outlined"
							margin="dense"
							fullWidth
						>
							<TextField
								label="Número de Telefone"
                                placeholder="(00) 0000-0000"
								variant="outlined"
								value={phoneNumber}
								onChange={handlePhoneNumberChange}
								fullWidth
							/>
						</FormControl>
                        </div>
                    }
                    { (type === "audio" || type === "video" || type === "image") &&
                    <div className={classes.multFieldLine}>
                        <TextField
							label="Arquivo"
							variant="outlined"
							value={file ? file.name || file : ""}
							fullWidth
                            disabled
						/>
                        <Button
                            variant="contained"
                            component="label"
                        >
                            Upload
                            <input
                                type="file"
                                onChange={handleFileChange}
                                hidden
                            />
                        </Button>
                    </div>}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						color="secondary"
						variant="outlined"
					>
						Cancelar
					</Button>
                    { type === "text" && 
                        <Button
                            color="primary"
                            variant="contained"
                            className={classes.btnWrapper}
                            onClick={handleOpenParamModal}
                        >
                            {"{{ }}"}
                        </Button>
                    }
					<Button
                        onClick={handleSubmit}
						color="primary"
						variant="contained"
                        disabled={disableButton}
					>
						{ body ? 'Editar' : 'Criar' }
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default TemplateBody;