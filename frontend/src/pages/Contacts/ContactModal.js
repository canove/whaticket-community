import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
	modal: {
		"& .MuiTextField-root": {
			margin: theme.spacing(1),
			width: "25ch",
		},
	},
}));

const AddContactModal = ({ modalOpen, setModalOpen, handleAddContact }) => {
	const classes = useStyles();
	const initialState = { name: "", number: "" };
	const [contact, setContact] = useState(initialState);

	const handleClose = () => {
		setModalOpen(false);
	};

	const handleChangeInput = e => {
		setContact({ ...contact, [e.target.name]: e.target.value });
	};

	return (
		<div>
			<Dialog
				open={modalOpen}
				onClose={handleClose}
				aria-labelledby="form-dialog-title"
				// maxWidth="lg"
				maxHeight="xs"
				scroll="paper"
				className={classes.modal}
			>
				<DialogTitle id="form-dialog-title">Adicionar contato</DialogTitle>
				<DialogContent>
					<TextField
						autoComplete="false"
						margin="dense"
						autoFocus
						variant="outlined"
						name="number"
						id="contactNumber"
						label="Número de Telefone"
						type="text"
						value={contact.number}
						onChange={handleChangeInput}
					/>
					<TextField
						margin="dense"
						variant="outlined"
						name="name"
						id="contactName"
						label="Nome Completo"
						type="text"
						value={contact.name}
						onChange={handleChangeInput}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="primary">
						Cancelar
					</Button>
					<Button
						onClick={e => {
							handleAddContact(contact);
							setContact(initialState);
						}}
						color="primary"
					>
						Adicionar
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default AddContactModal;
