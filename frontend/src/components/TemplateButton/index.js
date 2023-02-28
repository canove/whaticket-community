import React, { useState, useEffect } from "react";
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

import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input/input'

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

const TemplateButton = ({ open, onClose, button, index, handleButtonsChange }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();

    const [text, setText] = useState("");
	const [type, setType] = useState("quickReplyButton");
	const [buttonId, setButtonId] = useState("");
	const [url, setUrl] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");

    useEffect(() => {
        if (button) {
			setText(button.text);
			setType(button.type);
			
			if (button.type === "quickReplyButton") setButtonId(button.buttonId);
			if (button.type === "callButton") setPhoneNumber(button.phoneNumber);
			if (button.type === "urlButton") setUrl(button.url);
		}
    }, [open, button])

	const handleClose = () => {
		onClose();
        setText("");
		setType("quickReplyButton");
		setButtonId("");
		setUrl("");
		setPhoneNumber("");
	};

	const handleSubmit = async () => {
		let button = {
			text,
			type
		}

		if (type === "quickReplyButton") button = { ...button, buttonId }
		if (type === "callButton") button = { ...button, phoneNumber };
		if (type === "urlButton") button = { ...button, url };

        handleButtonsChange(button, index);

		handleClose();
	};

    const handleTextChange = (e) => {
        setText(e.target.value);
    }

	const handleTypeChange = (e) => {
		setType(e.target.value);
	}

	const handleButtonIdChange = (e) => {
		setButtonId(e.target.value);
	}

	const handleUrlChange = (e) => {
		setUrl(e.target.value);
	}

	const handlePhoneNumberChange = (e) => {
		setPhoneNumber(e.target.value);
	}

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="xs"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{ button
                     ? `${i18n.t("templatesData.buttomModal.edit")}`
                     : `${i18n.t("templatesData.buttomModal.create")}`
                    }
				</DialogTitle>
				<DialogContent dividers>
                    <div className={classes.root}>
						<FormControl
							variant="outlined"
							margin="dense"
							fullWidth
						>
							<InputLabel id="type-select-label">
								{"Tipo"}
							</InputLabel>
							<Select
								labelId="type-select-label"
								label={"Tipo"}
								id="type-select"
								value={type}
								onChange={(e) => { handleTypeChange(e) }}
								fullWidth
							>
								<MenuItem value={"quickReplyButton"}>{"Botão de Resposta Rápida"}</MenuItem>
                                <MenuItem value={"callButton"}>{"Botão com Contato"}</MenuItem>
                                <MenuItem value={"urlButton"}>{"Botão com Link"}</MenuItem>
							</Select>
						</FormControl>
                        <FormControl
                            variant="outlined"
                            margin="dense"
                            fullWidth
						>
                           <TextField
                                label={i18n.t("templatesData.buttomModal.text")}
                                variant="outlined"
                                value={text}
                                onChange={handleTextChange}
                                fullWidth
                            />
					    </FormControl>
						{ type === "quickReplyButton" &&
							<FormControl
								variant="outlined"
								margin="dense"
								fullWidth
							>
							<TextField
									label={"ID do Botão"}
									variant="outlined"
									value={buttonId}
									onChange={handleButtonIdChange}
									fullWidth
								/>
							</FormControl>
						}
						{ type === "callButton" &&
							<FormControl
								variant="outlined"
								margin="dense"
								fullWidth
							>
							<TextField
									label={"Telefone"}
									variant="outlined"
									value={phoneNumber}
									onChange={handlePhoneNumberChange}
									fullWidth
								/>
							</FormControl>
						}
						{ type === "urlButton" &&
							<FormControl
								variant="outlined"
								margin="dense"
								fullWidth
							>
							<TextField
									label={"URL"}
									variant="outlined"
									value={url}
									onChange={handleUrlChange}
									fullWidth
								/>
							</FormControl>
						}
                    </div>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						color="secondary"
						variant="outlined"
					>
						{i18n.t("templatesData.buttomModal.cancel")}
					</Button>
					<Button
                        onClick={handleSubmit}
						color="primary"
						variant="contained"
					>
						{ button
                         ? `${i18n.t("templatesData.buttomModal.save")}`
                         : `${i18n.t("templatesData.buttomModal.create")}`
                        }
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default TemplateButton;