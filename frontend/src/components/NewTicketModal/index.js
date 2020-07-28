import React, { useState, useEffect } from "react";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";

import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControl from "@material-ui/core/FormControl";
import { green } from "@material-ui/core/colors";

import { makeStyles } from "@material-ui/core/styles";

import api from "../../services/api";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},

	btnWrapper: {
		// margin: theme.spacing(1),
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
}));

const NewTicketModal = ({ modalOpen, onClose, contactId }) => {
	const classes = useStyles();
	const userId = +localStorage.getItem("userId");

	const [options, setOptions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedContact, setSelectedContact] = useState(null);

	useEffect(() => {
		setLoading(true);
		const fetchContacts = async () => {
			try {
				const res = await api.get("contacts");
				setOptions(res.data.contacts);
			} catch (err) {
				alert(err);
			}
		};

		fetchContacts();
		setLoading(false);
	}, []);

	const handleClose = () => {
		onClose();
		setSelectedContact(null);
	};

	const handleSaveTicket = async e => {
		e.preventDefault();
		if (!selectedContact) return;
		setLoading(true);
		try {
			await api.post("/tickets", {
				contactId: selectedContact.id,
				userId: userId,
				status: "open",
			});
		} catch (err) {
			alert(err);
		}
		setLoading(false);
		handleClose();
	};

	return (
		<div className={classes.root}>
			<Dialog
				open={modalOpen}
				onClose={handleClose}
				maxWidth="lg"
				scroll="paper"
			>
				<form onSubmit={handleSaveTicket}>
					<DialogTitle id="form-dialog-title">Criar Ticket</DialogTitle>
					<DialogContent dividers>
						<Autocomplete
							id="asynchronous-demo"
							style={{ width: 300 }}
							getOptionLabel={option => option.name}
							onChange={(e, newValue) => {
								setSelectedContact(newValue);
							}}
							options={options}
							loading={loading}
							renderInput={params => (
								<TextField
									{...params}
									label="Selecione o contato"
									variant="outlined"
									required
									id="my-input"
									InputProps={{
										...params.InputProps,
										endAdornment: (
											<React.Fragment>
												{loading ? (
													<CircularProgress color="inherit" size={20} />
												) : null}
												{params.InputProps.endAdornment}
											</React.Fragment>
										),
									}}
								/>
							)}
						/>
					</DialogContent>
					<DialogActions>
						<Button
							onClick={handleClose}
							color="secondary"
							disabled={loading}
							variant="outlined"
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							color="primary"
							disabled={loading}
							variant="contained"
							className={classes.btnWrapper}
						>
							Salvar
							{loading && (
								<CircularProgress
									size={24}
									className={classes.buttonProgress}
								/>
							)}
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</div>
	);
};

export default NewTicketModal;
