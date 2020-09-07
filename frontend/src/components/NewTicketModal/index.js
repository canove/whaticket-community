import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";

import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";

import { makeStyles } from "@material-ui/core/styles";

import { i18n } from "../../translate/i18n";
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

const NewTicketModal = ({ modalOpen, onClose }) => {
	const history = useHistory();
	const classes = useStyles();
	const userId = +localStorage.getItem("userId");

	const [options, setOptions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchParam, setSearchParam] = useState("");
	const [selectedContact, setSelectedContact] = useState(null);

	useEffect(() => {
		if (!modalOpen || searchParam.length < 3) return;
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchContacts = async () => {
				try {
					const { data } = await api.get("contacts", {
						params: { searchParam },
					});
					setOptions(data.contacts);
					setLoading(false);
				} catch (err) {
					console.log(err);
					if (err.response && err.response.data && err.response.data.error) {
						toast.error(err.response.data.error);
					}
				}
			};

			fetchContacts();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, modalOpen]);

	const handleClose = () => {
		onClose();
		setSearchParam("");
		setSelectedContact(null);
	};

	const handleSaveTicket = async e => {
		e.preventDefault();
		if (!selectedContact) return;
		setLoading(true);
		try {
			const { data: ticket } = await api.post("/tickets", {
				contactId: selectedContact.id,
				userId: userId,
				status: "open",
			});
			history.push(`/tickets/${ticket.id}`);
		} catch (err) {
			console.log(err);
			if (err.response && err.response.data && err.response.data.error) {
				toast.error(err.response.data.error);
			}
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
					<DialogTitle id="form-dialog-title">
						{i18n.t("newTicketModal.title")}
					</DialogTitle>
					<DialogContent dividers>
						<Autocomplete
							id="contacts-finder"
							style={{ width: 300 }}
							getOptionLabel={option => `${option.name} - ${option.number}`}
							onChange={(e, newValue) => {
								setSelectedContact(newValue);
							}}
							options={options}
							noOptionsText="No contacts found. Try another term."
							loading={loading}
							renderInput={params => (
								<TextField
									{...params}
									label={i18n.t("newTicketModal.fieldLabel")}
									variant="outlined"
									required
									autoFocus
									onChange={e => setSearchParam(e.target.value)}
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
							{i18n.t("newTicketModal.buttons.cancel")}
						</Button>
						<Button
							type="submit"
							color="primary"
							disabled={loading}
							variant="contained"
							className={classes.btnWrapper}
						>
							{i18n.t("newTicketModal.buttons.ok")}
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
