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
		marginBottom: "16px",
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

const ConnectionFileModal = ({ open, onClose, connectionFileId }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();

	const [name, setName] = useState("");
	const [icon, setIcon] = useState("");

	const handleClose = () => {
		setName("");
		setIcon("");
		onClose();
	};

	const handleNameChange = (e) =>{
		const name = e.target.value.replace(/[^a-zA-Z\d\s:]/gi, "");

		setName(name);

		e.preventDefault();
	};

	const handleIconChange = (e) =>{
		setIcon(e.target.files[0]);
	};

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				const { data } = await api.get(`/connectionFiles/${connectionFileId}`);
				setName(data.name);
				setIcon(data.icon);
			} catch (err) {
				toastError(err);
			}
		}

		if (connectionFileId) {
			fetchProduct();
		}
	}, [open, connectionFileId])

	const handleSubmit = async () => {
		const connectionFileData = new FormData();

		connectionFileData.set("name", name);
		connectionFileData.set("icon", icon);

		 try {
            if (connectionFileId) {
                await api.put(`/connectionFiles/${connectionFileId}`, connectionFileData);
                toast.success("Editado com sucesso!");
            } else {
                await api.post("/connectionFiles/", connectionFileData);
                toast.success("Criado com sucesso!");
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
				maxWidth="xs"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{ connectionFileId
					 ? `${i18n.t("connectionsFiles.modal.create")}`
					 : `${i18n.t("connectionsFiles.modal.edit")}`
					}
				</DialogTitle>
				<DialogContent dividers>
					<div className={classes.multFieldLine}>
						<TextField
							as={TextField}
							name="name"
							variant="outlined"
							margin="dense"
							label={i18n.t("connectionsFiles.modal.name")}
							fullWidth
							value={name}
							onChange={ handleNameChange }
						/>
					</div>
					<div className={classes.multFieldLine}>
                        <TextField
                            label={i18n.t("connectionsFiles.modal.file")}
                            variant="outlined"
                            value={icon ? icon.name || icon : ""}
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
                                onChange={handleIconChange}
                                hidden
                                accept="image/*"
                            />
                        </Button>
                    </div>
					<Button
                        variant="contained"
                        component="label"
						onClick={() => { setIcon("") }}
                    >
						{i18n.t("connectionsFiles.modal.removeIcon")}
                    </Button>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						color="secondary"
						variant="outlined"
					>
						{i18n.t("connectionsFiles.modal.cancel")}
					</Button>
					<Button
                        onClick={handleSubmit}
						color="primary"
						variant="contained"
					>
						{ connectionFileId
						 ? `${i18n.t("connectionsFiles.modal.save")}`
						 : `${i18n.t("connectionsFiles.modal.create")}`
						}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default ConnectionFileModal;
