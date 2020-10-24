import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";

import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Autocomplete, {
	createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";

import { makeStyles } from "@material-ui/core/styles";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
}));

const filterOptions = createFilterOptions({
	trim: true,
});

const TransferTicketModal = ({ modalOpen, onClose,TechinicalId,ticketid }) => {
	const history = useHistory();
	const classes = useStyles();
	const [options, setOptions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchParam, setSearchParam] = useState("");
	const [selectedTechinical, setSelectedTechinical] = useState(null);
	//const [hasMore, setHasMore] = useState(false);

	//const [user, setUser] = useState(null);


	useEffect(() => {
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchUsers = async () => {
				try {
					const { data } = await api.get("/users/", {
						params: { searchParam, pageNumber : 1 },
					});
					setOptions(data.users);
					//setUser({ type: "LOAD_USERS", payload: data.users });
					//setHasMore(data.hasMore);
					setLoading(false);
				} catch (err) {
					const errorMsg = err.response?.data?.error;
					if (errorMsg) {
						if (i18n.exists(`backendErrors.${errorMsg}`)) {
							toast.error(i18n.t(`backendErrors.${errorMsg}`));
						} else {
							toast.error(err.response.data.error);
						}
					} else {
						toast.error("Unknown error");
					}
				}
			};
			fetchUsers();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, modalOpen]);


	const handleClose = () => {
		onClose();
		setSearchParam("");
		setSelectedTechinical(null);
	};

	const handleSaveTicket = async e => {
		e.preventDefault();
		if (!selectedTechinical) return;
		setLoading(true);
		try {



			const { data: ticket } = await api.put("/tickets/"+ticketid , {
				TechinicalId: TechinicalId,
				userId: selectedTechinical.id,
				status: "open",
			});
			history.push(`/tickets/${ticket.id}`);
		} catch (err) {
			const errorMsg = err.response?.data?.error;
			if (errorMsg) {
				if (i18n.exists(`backendErrors.${errorMsg}`)) {
					toast.error(i18n.t(`backendErrors.${errorMsg}`));
				} else {
					toast.error(err.response.data.error);
				}
			} else {
				toast.error("Unknown error"+ err);
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
						{i18n.t("TransferTicketModal.title")}

						
					</DialogTitle>
					<DialogContent dividers>
						<Autocomplete
							id="Techinicals-finder"
							style={{ width: 300 }}
							getOptionLabel={option => `${option.name}`}
							onChange={(e, newValue) => {
								setSelectedTechinical(newValue);
							}}
							options={options}
							filterOptions={filterOptions}
							noOptionsText={i18n.t("newTicketModal.noOptions")}
							loading={loading}
							renderInput={params => (
								<TextField
									{...params}
									label={i18n.t("TransferTicketModal.fieldLabel") }
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
						<ButtonWithSpinner
							variant="contained"
							type="submit"
							color="primary"
							loading={loading}
						>
							{i18n.t("newTicketModal.buttons.ok")}
						</ButtonWithSpinner>
					</DialogActions>
				</form>
			</Dialog>
		</div>
	);
};

export default TransferTicketModal;
