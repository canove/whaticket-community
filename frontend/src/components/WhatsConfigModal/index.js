import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Typography,
  } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";
import IntlCurrencyInput from "react-intl-currency-input"

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	multFieldLine: {
		display: "flex",
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

const WhatsConfigModal = ({ open, onClose, whatsappId }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();

	const [whatsName, setWhatsName] = useState("");
	const [whatsImage, setWhatsImage] = useState("");

	useEffect(() => {
		const fetchWhatsApp = async () => {
			try {
				const { data } = await api.get(`/whatsapp/${whatsappId}`);
				setWhatsName(data.whatsName || "");
				setWhatsImage(data.whatsImage || "");
			} catch (err) {
				toastError(err);
			}
		}

		if (whatsappId) {
			fetchWhatsApp();
		}
	}, [open, whatsappId])

	const handleClose = () => {
		setWhatsName("");
		setWhatsImage("");
		onClose();
	};

	const handleSubmit = async () => {
		const formData = new FormData();
        formData.set("whatsName", whatsName);

		if (typeof whatsImage === "string") {
			formData.set("whatsImage", whatsImage);
		} else {
			formData.append("file", whatsImage, whatsImage.name);
		}

		try {
			const { data } = await api.put(`/whatsapp/config/${whatsappId}`, formData);
		} catch (err) {
			toastError(err);
		}

        handleClose();
	};

	const handleWhatsNameChange = (e) => {
		setWhatsName(e.target.value);
	}

	const handleWhatsImageChange = (e) => {
		setWhatsImage(e.target.files[0]);
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
					Whats Config
				</DialogTitle>
				<DialogContent dividers>
					<TextField
                        as={TextField}
                        label="Nome"
                        value={whatsName}
                        name="name"
                        onChange={(e) => { handleWhatsNameChange(e) }}
                        variant="outlined"
                        margin="dense"
                        fullWidth
                    />
					<div className={classes.multFieldLine} style={{ marginTop: "5px" }}>
                        <TextField
                            label="Imagem"
                            variant="outlined"
                            value={whatsImage ? whatsImage.name || whatsImage : ""}
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
                                onChange={handleWhatsImageChange}
                                hidden
                                accept="image/*"
                            />
                        </Button>
                    </div>
					<div
						style={{
							border: "1px solid rgba(0,0,0,0.5)",
							borderRadius: "100%",
							height: "100px",
							margin: "0 auto",
							marginTop: "10px",
							width: "100px",
							overflow: "hidden",
						}}
					>
						<img
							style={{
								height: "100%",
								width: "100%",
							}}
							src={whatsImage}
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
						Salvar
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default WhatsConfigModal;
