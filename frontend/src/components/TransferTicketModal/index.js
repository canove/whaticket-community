import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from "@material-ui/core";

import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Autocomplete, {
	createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import toastError from "../../errors/toastError";
import useQueues from "../../hooks/useQueues";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  maxWidth: {
    width: "100%",
  },
}));

const filterOptions = createFilterOptions({
	trim: true,
});

const TransferTicketModal = ({ modalOpen, onClose, ticketid, queueId }) => {
	const history = useHistory();
	const classes = useStyles();
	const { user } = useContext(AuthContext);
	const { i18n } = useTranslation();

	const [options, setOptions] = useState([]);
	const [queues, setQueues] = useState([]);
	const [allQueues, setAllQueues] = useState([]);

	const [loading, setLoading] = useState(false);

	const [searchParam, setSearchParam] = useState("");
	const [selectedUser, setSelectedUser] = useState(null);
	const [selectedQueue, setSelectedQueue] = useState('');

	const { findAll: findAllQueues } = useQueues();

	useEffect(() => {
		
		const loadQueues = async () => {
			if (user.profileId !== 1) {
				setQueues(user.queues);
				setAllQueues(user.queues);
				return;
			}

			const list = await findAllQueues();
			setAllQueues(list);
			setQueues(list);
		}

		loadQueues();
	}, []);

	useEffect(() => {
		if (!modalOpen || searchParam.length < 3) {
			setLoading(false);
			return;
		}
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchUsers = async () => {
				try {
					const { data } = await api.get("/users/transferList/", {
						params: { searchParam, queueId },
					});
					setOptions(data);
					setLoading(false);
				} catch (err) {
					setLoading(false);
					toastError(err);
				}
			};

			fetchUsers();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, queueId, modalOpen]);

	const handleClose = () => {
		onClose();
		setSearchParam("");
		setSelectedUser(null);
	};

	const handleSaveTicket = async e => {
		e.preventDefault();
		if (!ticketid) return;
		setLoading(true);
		try {
			let data = {};

			if (selectedUser) {
				data.userId = selectedUser.id
			}

			if (selectedQueue && selectedQueue !== null) {
				data.queueId = selectedQueue

				if (!selectedUser) {
					data.status = 'pending';
					data.userId = null;
				}
			}

			await api.put(`/tickets/${ticketid}`, data);

			setLoading(false);
			history.push(`/tickets`);
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
	};

	return (
		<Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
			<form onSubmit={handleSaveTicket}>
				<DialogTitle id="form-dialog-title">
					{i18n.t("transferTicketModal.title")}
				</DialogTitle>
				<DialogContent dividers>
					<Autocomplete
						style={{ width: 300, marginBottom: 20 }}
						getOptionLabel={option => `${option.name}`}
						onChange={(e, newValue) => {
							setSelectedUser(newValue);
							if (newValue != null && Array.isArray(newValue.queues)) {
								setQueues(newValue.queues);
							} else {
								setQueues(allQueues);
								setSelectedQueue('');
							}
						}}
						options={options}
						filterOptions={filterOptions}
						freeSolo
						autoHighlight
						noOptionsText={i18n.t("transferTicketModal.noOptions")}
						loading={loading}
						disabled={selectedQueue}
						renderInput={params => (
							<TextField
								{...params}
								label={i18n.t("transferTicketModal.fieldLabel")}
								variant="outlined"
								disabled={selectedQueue}
								autoFocus
								onChange={e => setSearchParam(e.target.value)}
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
					<FormControl variant="outlined" className={classes.maxWidth}>
						<InputLabel>{i18n.t("transferTicketModal.fieldQueueLabel")}</InputLabel>
						<Select
							value={selectedQueue}
							onChange={(e) => setSelectedQueue(e.target.value)}
							label={i18n.t("transferTicketModal.fieldQueuePlaceholder")}
							disabled={selectedUser}
						>
							<MenuItem value={''}>&nbsp;</MenuItem>
							{queues && queues.map((queue) => (
								<MenuItem key={queue.id} value={queue.id}>{queue.name}</MenuItem>
							))}
						</Select>
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						color="secondary"
						disabled={loading}
						variant="outlined"
					>
						{i18n.t("transferTicketModal.buttons.cancel")}
					</Button>
					<ButtonWithSpinner
						variant="contained"
						type="submit"
						color="primary"
						loading={loading}
					>
						{i18n.t("transferTicketModal.buttons.ok")}
					</ButtonWithSpinner>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default TransferTicketModal;
