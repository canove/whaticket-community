import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

const AddContactModal = ({ modalOpen, setModalOpen, handleAddContact }) => {
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
			>
				<DialogTitle id="form-dialog-title">Adicionar contato</DialogTitle>
				<DialogContent>
					<TextField
						autoComplete="false"
						autoFocus
						margin="dense"
						name="number"
						id="contactNumber"
						label="Número"
						type="text"
						value={contact.number}
						onChange={handleChangeInput}
						fullWidth
					/>
					<TextField
						margin="dense"
						name="name"
						id="contactName"
						label="Nome do contato"
						type="text"
						value={contact.name}
						onChange={handleChangeInput}
						fullWidth
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
