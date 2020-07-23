import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import FormHelperText from "@material-ui/core/FormHelperText";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	textField: {
		// marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		// width: "25ch",
		flex: 1,
	},

	extraAttr: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
}));

const AddContactModal = ({ modalOpen, setModalOpen, handleAddContact }) => {
	const classes = useStyles();
	const initialState = { name: "", number: "" };
	const [contact, setContact] = useState(initialState);
	const [newInfo, setNewInfo] = useState({
		name: "",
		value: "",
	});
	const [extraInfo, setExtraInfo] = useState([
		{
			id: "test1",
			name: "Teste",
			value: "testera",
		},
		{
			id: "test2",
			name: "Mesh Agent URL",
			value: "http://10.10.10.2",
		},
		{
			id: "test3",
			name: "Atera Agent URL",
			value: "http://10.10.10.5",
		},
	]);

	const handleClose = () => {
		setModalOpen(false);
	};

	const handleChangeInput = e => {
		setContact({ ...contact, [e.target.name]: e.target.value });
	};

	const handleChangeExtraInfoInput = (e, id) => {
		setExtraInfo(prevState => {
			const index = prevState.findIndex(ext => ext.id === id);
			if (index === -1) return prevState;
			let aux = [...prevState];
			aux[index] = { ...aux[index], [e.target.name]: e.target.value };
			return aux;
		});
	};

	console.log(extraInfo);

	const handleAddExtraInfo = () => {
		setExtraInfo(prevState => [newInfo, ...extraInfo]);
	};

	const handleDeleteExtraInfo = (extraId, id) => {
		setExtraInfo(prevState => {
			const index = prevState.findIndex(ext => ext.id === id);
			if (index === -1) return prevState;
			let aux = [...prevState];
			aux.splice(index, 1);
			return aux;
		});
	};

	return (
		<div className={classes.root}>
			<Dialog
				open={modalOpen}
				onClose={handleClose}
				aria-labelledby="form-dialog-title"
				maxWidth="lg"
				// maxHeight="xs"
				scroll="paper"
				className={classes.modal}
			>
				<DialogTitle id="form-dialog-title">Adicionar contato</DialogTitle>
				<DialogContent dividers>
					<Typography variant="subtitle1" gutterBottom>
						Dados do contato
					</Typography>
					<TextField
						id="contactName"
						label="Nome"
						variant="outlined"
						margin="dense"
						required
						className={classes.textField}
					/>
					<TextField
						id="contactNumber"
						label="Número do Whatsapp"
						placeholder="Ex: 13912344321"
						variant="outlined"
						margin="dense"
						required
					/>
					<div>
						<TextField
							id="outlined-full-width"
							label="Email"
							placeholder="Endereço de Email"
							fullWidth
							margin="dense"
							variant="outlined"
						/>
					</div>
					<Typography
						style={{ marginBottom: 8, marginTop: 12 }}
						variant="subtitle1"
					>
						Informações extras
					</Typography>
					{extraInfo &&
						extraInfo.map((extra, index) => (
							<div key={extra.id} className={classes.extraAttr}>
								<TextField
									// id={extra.id}
									label="Nome do campo"
									name="name"
									value={extra.name}
									onChange={e => handleChangeExtraInfoInput(e, extra.id)}
									variant="outlined"
									margin="dense"
									required
									className={classes.textField}
								/>
								<TextField
									// id={extra.id}
									label="Valor"
									name="value"
									value={extra.value}
									onChange={e => handleChangeExtraInfoInput(e, extra.id)}
									variant="outlined"
									margin="dense"
									required
								/>
								<IconButton
									size="small"
									onClick={e => handleDeleteExtraInfo(extra.id, index)}
								>
									<DeleteOutlineIcon />
								</IconButton>
							</div>
						))}

					<div className={classes.extraAttr}>
						<Button
							style={{ flex: 1, marginTop: 8 }}
							variant="outlined"
							color="primary"
							onClick={handleAddExtraInfo}
						>
							+ Adicionar atributo
						</Button>
					</div>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="secondary">
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
