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

	const { i18n } = useTranslation();

	const [options, setOptions] = useState([]);
	const [queues, setQueues] = useState([]);
	const [allQueues, setAllQueues] = useState([]);

	const [loading, setLoading] = useState(false);

	const [searchParam, setSearchParam] = useState("");
	const [selectedUser, setSelectedUser] = useState(null);
	const [selectedQueue, setSelectedQueue] = useState('');

	const [requiredQueue, setRequiredQueue] = useState(false);

	const [observation, setObservation] = useState("");

	const { findAll: findAllQueues } = useQueues();

	useEffect(() => {
		const loadQueues = async () => {
			const list = await findAllQueues();
			setAllQueues(list);
			setQueues(list);
		}

		const fetchSettings = async () => {
			const { data } = await api.get("/companySettings");

			setRequiredQueue(data.transferRequiredQueue);
		}

		loadQueues();
		fetchSettings();
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
					const { data } = await api.get("/users/transferList", {
						params: { searchParam },
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
	}, [searchParam, modalOpen]);

	const handleClose = () => {
		onClose();
		setSearchParam("");
		setSelectedUser(null);
		setObservation("");
	};

	const handleSaveTicket = async e => {
		e.preventDefault();
		if (!ticketid) return;
		setLoading(true);
		try {
			let data = {};

			if (selectedUser) {
				data.userId = selectedUser.id;
				data.queueId = null;
			}

			if (selectedQueue) {
				data.queueId = selectedQueue;

				if (!selectedUser) {
					data.status = 'pending';
					data.userId = null;
				}
			}

			if (observation) data.observation = observation;

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
							setSelectedQueue('');

							if (newValue != null && Array.isArray(newValue.queues)) {
								setQueues(newValue.queues);

								if (newValue.queues.length === 1) setSelectedQueue(newValue.queues[0].id);
							} else {
								setQueues(allQueues);
							}
						}}
						options={options}
						filterOptions={filterOptions}
						freeSolo
						autoHighlight
						noOptionsText={i18n.t("transferTicketModal.noOptions")}
						loading={loading}
						renderInput={params => (
							<TextField
								{...params}
								label={i18n.t("transferTicketModal.fieldLabel")}
								variant="outlined"
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
						>
							<MenuItem value={''}>&nbsp;</MenuItem>
							{queues && queues.map((queue) => (
								<MenuItem key={queue.id} value={queue.id}>{queue.name}</MenuItem>
							))}
						</Select>
					</FormControl>
					<div style={{ marginTop: "10px" }}>
						<TextField
							label="Observação"
							name="observation"
							variant="outlined"
							margin="dense"
							multiline
							minRows={3}
							maxRows={3}
							value={observation}
							onChange={(e) => setObservation(e.target.value)}
							fullWidth
						/>
					</div>
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
						disabled={requiredQueue && !selectedQueue}
					>
						{i18n.t("transferTicketModal.buttons.ok")}
					</ButtonWithSpinner>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default TransferTicketModal;
