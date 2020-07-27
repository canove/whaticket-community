import React, { useState, useEffect } from "react";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";

import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";

import { makeStyles } from "@material-ui/core/styles";

import api from "../../services/api";

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

	const [options, setOptions] = React.useState([]);
	const [loading, setLoading] = React.useState(false);

	useEffect(() => {
		const fetchContacts = async () => {
			try {
				const res = await api.get("contacts");
				setOptions(res.data.contacts);
			} catch (err) {
				alert(err);
			}
		};

		fetchContacts();
	}, []);

	const handleClose = () => {
		onClose();
		// setTicket(initialState);
	};

	const handleSaveTicket = async selected => {
		console.log(selected.id);
		try {
			await api.post("/tickets", { contactId: selected.id });
		} catch (err) {
			alert(err);
		}
		// handleClose();
	};

	return (
		<div className={classes.root}>
			<Dialog
				open={modalOpen}
				onClose={handleClose}
				maxWidth="lg"
				scroll="paper"
				className={classes.modal}
			>
				<DialogTitle id="form-dialog-title">Criar Ticket</DialogTitle>
				<DialogContent dividers>
					<Autocomplete
						id="asynchronous-demo"
						style={{ width: 300 }}
						getOptionLabel={option => option.name}
						onChange={(e, newValue) => {
							handleSaveTicket(newValue);
						}}
						options={options}
						loading={loading}
						renderInput={params => (
							<TextField
								{...params}
								label="Selecione o contato"
								variant="outlined"
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
						// disabled={isSubmitting}
						variant="outlined"
					>
						Cancelar
					</Button>
					<Button
						onClick={handleSaveTicket}
						color="primary"
						// disabled={isSubmitting}
						variant="contained"
						className={classes.btnWrapper}
					>
						Salvar
						{loading && (
							<CircularProgress size={24} className={classes.buttonProgress} />
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default NewTicketModal;
